import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/User.entity';
import { MailService } from '../mail/mail.service';
import { UploadService } from 'src/core/upload/upload.service';
import * as multer from 'multer';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService, // Injeksi MailService
    private readonly uploadService: UploadService,
  ) {}




  async forgotPassword(email: string) {
    
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Email is not associated with a user.');
    }

    const resetPasswordToken = this.jwtService.sign(
      { email },
      { expiresIn: '1h' },
    );

    const resetLink = `http://192.168.1.4:3000/authentication/repassword`;

    const emailContent = `
      <p>Hello!</p>
      <p>You have requested to reset your password. Please click the link below to reset it:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    // Simpan token reset password ke dalam basis data untuk validasi nanti
    user.resetPasswordExpires = resetPasswordToken;
    await user.save();

    
    // Kirim email verifikasi dengan token reset password ke pengguna
    this.mailService.sendForgotPasswordEmail(user.email, emailContent);

    return {message: 'Password reset email sent successfully' , resetPasswordToken};

  }

  async resetPassword(
    token: string,
    newPassword: string,
    newRepassword: string,
  ): Promise<string> {
    try {
      const decodedToken = this.jwtService.verify(token); // Verifikasi token
      const user = await this.userService.findOneByEmail(decodedToken.email);
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      // Validasi kata sandi baru dan konfirmasi kata sandi
      if (newPassword !== newRepassword) {
        throw new BadRequestException(
          'Password and confirmation password do not match.',
        );
      }

      // Validasi waktu kedaluwarsa token
      if (user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
        
      throw new BadRequestException('Reset password link has expired. Please request a new one.');
    }

      // Hash kata sandi baru
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Perbarui kata sandi pengguna di basis data
      user.password = hashedPassword;

      // Kemudian, Anda dapat menghapus token reset password dari basis data
      user.resetPasswordExpires = null;
      await user.save();

      // Kemudian, Anda dapat mengembalikan respons sukses
      return 'Password reset successfully';
    } catch (error) {
      throw new BadRequestException('Invalid or expired token.');
    }
  }
  private failedLoginAttempts = new Map<string, number>();

  async validateUser(username: string, pass: string) {
    // Check if user has exceeded failed login attempts
    if (
      this.failedLoginAttempts.has(username) &&
      this.failedLoginAttempts.get(username) >= 3
    ) {
      throw new HttpException
      ('Anda telah mencapai batas login gagal, silahkan menunggu beberapa saat sebelum login kembali',
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

  private generateRandomPassword(): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const passwordLength = 12; // Panjang kata sandi yang diinginkan
    let password = '';

    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters[randomIndex];
    }

    return password;
  }

  

  public async create(user) {
    // Generate a random password
    const randomPassword = this.generateRandomPassword();

    // Hash the random password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Omit repassword from the user object
    const { repassword, ...userWithoutRepassword } = user;

    // Create the user with the random password
    const newUser = await this.userService.create({
      ...userWithoutRepassword,
      password: hashedPassword,
    });

    // Send the random password to the user's email
    await this.mailService.sendRandomPasswordEmail(
      newUser.email,
      randomPassword,
    );

    // tslint:disable-next-line: no-string-literal
    const { password, ...result } = newUser['dataValues'];

    // Generate token
    const token = await this.generateToken(result);

    // Return the user and the token
    return { user: result, token };
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
  async deleteUser(userNip: number): Promise<void> {
    const user = await this.userService.findOneById(userNip);

    if (!user) {
      throw new NotFoundException(`User with ID ${userNip} not found`);
    }

    // Hapus pengguna dari layanan pengguna
    await this.userService.deleteUser(userNip);
  }

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
