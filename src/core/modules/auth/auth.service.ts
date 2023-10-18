import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/User.entity';
import { UploadService } from 'src/core/upload/upload.service';
import { UserDto, UserStatus } from '../users/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly uploadService: UploadService,
  ) {}

  private failedLoginAttempts = new Map<string, number>();

  async validateUser(username: string, pass: string) {
    // Check if user has exceeded failed login attempts
    if (
      this.failedLoginAttempts.has(username) &&
      this.failedLoginAttempts.get(username) >= 3
    ) {
      throw new HttpException
      ('Anda telah mencapai batas login gagal. Tunggu beberapa saat sebelum mencoba lagi dalam 1 menit',
      HttpStatus.OK,
      );
    }

    // Set a timeout to clear failed login attempts
    if (this.failedLoginAttempts.has(username)) {
      setTimeout(() => {
        this.failedLoginAttempts.delete(username);
      }, 6000); // Clear attempts after 1 minute
    }

    // find if user exist with this email
    const user = await this.userService.findOneByEmail(username);
    if (!user) {
      return null;
    }

    // find if user password match
    const match = await this.comparePassword(pass, user.password);
    if (!match) {
      // Increment failed login attempts
      const currentAttempts = this.failedLoginAttempts.get(username) || 0;
      this.failedLoginAttempts.set(username, currentAttempts + 1);

      throw new HttpException(
        'Login Gagal, Email atau Password Tidak Sesuai.',
        HttpStatus.CREATED,
      );
    }

    const { password, ...result } = user['dataValues'];
    return result;
  }

  async login(user: User): Promise<{ user: User; token: string }> {
    const token = await this.generateToken(user);
    return { user, token };
  }

  public async create(user) {
    // Validasi password dan repassword
    if (user.password !== user.repassword) {
      throw new HttpException
      ('Password and repassword do not match',
      HttpStatus.CREATED,
      );
    }

    // Hash password
    const hashedPassword = await this.hashPassword(user.password);

    try {
      // Buat pengguna baru dalam database
      const newUser = await this.userService.create({
        ...user,
        password: hashedPassword,
      });

      // Dapatkan data pengguna tanpa password
      const { password, ...userData } = newUser['dataValues'];

      // Generate token untuk pengguna
      const token = await this.generateToken(userData);

      // Mengembalikan data pengguna dan token
      return { user: userData, token };
    } catch (error) {
      // Tangani kesalahan pembuatan pengguna dengan memberikan respons yang sesuai
      throw new HttpException
      ('Email atau NIP Sudah Terdaftar',
      HttpStatus.CREATED,
      );
    }
  }

  public async getDataUser() {
    const getData = await this.userService.getDataUser();
    return getData;
  }

  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Temukan pengguna berdasarkan ID
    const user = await this.userService.findOneById(userId);

    // Memeriksa apakah kata sandi saat ini cocok
    const isCurrentPasswordValid = await this.comparePassword(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new HttpException
      ('Kata Sandi Saat Ini Salah!',
      HttpStatus.CREATED,
      );
    }

    // Hash kata sandi yang baru
    const hashedNewPassword = await this.hashPassword(newPassword);

    // Simpan kata sandi yang baru ke dalam database
    await this.userService.updatePassword(userId, hashedNewPassword);
  }

  // auth.service.ts

  async updateUser(
    userId: number,
    updatedUserData: Partial<User>,
  ): Promise<User> {
    // Temukan pengguna berdasarkan ID
    const user = await this.userService.findOneById(userId);

    // Jika pengguna tidak ditemukan, lempar NotFoundException
    if (!user) {
      throw new NotFoundException(
        `Pengguna dengan ID ${userId} tidak ditemukan`,
      );
    }

    // Jika ada upaya untuk mengubah email, periksa apakah email sudah digunakan oleh pengguna lain
    if (updatedUserData.email && updatedUserData.email !== user.email) {
      const existingUserWithSameEmail = await this.userService.findOneByEmail(
        updatedUserData.email,
      );

      if (existingUserWithSameEmail) {
        throw new HttpException
      ('Email Sudah Terdaftar',
      HttpStatus.CREATED,
      );
      }
    }
    // Update data pengguna kecuali kata sandi
    Object.assign(user, { ...updatedUserData, password: user.password });

    // Simpan perubahan ke dalam database
    return await user.save();
  }

  private async generateToken(user) {
    const token = await this.jwtService.signAsync(user);
    return token;
  }

  private async hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  private async comparePassword(enteredPassword, dbPassword) {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    return match;
  }

  async findByNip(nip: number): Promise<User | null> {
    // Cari pengguna berdasarkan NIP menggunakan layanan UsersService
    const user = await this.userService.findOneById(nip);

    if (!user) {
      throw new NotFoundException(`Pengguna dengan NIP ${nip} tidak ditemukan`);
    }
    const { password, ...userWithoutPassword } = user;

    return user;
  }

  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<any> {
    try {
      // Mengonversi file ke data base64
      const fileBuffer = file.buffer.toString('base64');
      const base64Data = `data:${file.mimetype};base64,${fileBuffer}`;

      // Menyusun nama file dengan menambahkan timestamp untuk memastikan keunikan
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.originalname}`;

      // Menyimpan data base64 ke database dengan menyertakan filename yang baru
      const uploadedFile = await this.uploadService.create(
        fileName, // Gunakan nama file yang baru disusun
        base64Data,
        userId,
      );

      return uploadedFile;
    } catch (error) {
      throw new BadRequestException('Gagal mengunggah file: ' + error.message);
    }
  }

  async updateUserAvatar(
    userId: string,
    data: string,
    filename: string,
  ): Promise<any> {
    try {
      // Memanggil metode update dari UploadService dengan data, userId, dan filename
      const result = await this.uploadService.update(data, userId, filename);
      return result;
    } catch (error) {
      // Tangani pengecualian di sini jika diperlukan
      throw new ForbiddenException(
        'Failed to update user avatar: ' + error.message,
      );
    }
  }

  // async updateUserStatus(nip: number, status: UserStatus): Promise<User> {
  //   const user = await this.userService.findOneById(nip);

  //   if (!user) {
  //     throw new NotFoundException(`User with NIP ${nip} not found`);
  //   }

  //   user.status = status;
  //   await user.save();

  //   return user;
  // }
}
