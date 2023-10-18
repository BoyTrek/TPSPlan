import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/core/constants';
import { User } from './User.entity';
import { UserDto, UserStatus } from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: typeof User,
  ) {}

  async create(user: UserDto): Promise<User> {
    return await this.userRepository.create<User>(user);
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { email } });
  }

  async findOneById(nip: number): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { nip } });
  }

  async getDataUser(): Promise<User[]> {
    return await this.userRepository.findAll<User>();
  }

  async updatePassword(userId: number, newPassword: string) {
    const user = await this.userRepository.findByPk(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findByPk(userId);
  
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  
    await user.destroy(); // Menghapus pengguna dari basis data
  
    return { message: 'Data berhasil dihapus' };
  }

  async findOneByResetPasswordToken(resetPasswordExpires: string): Promise<User | null> {
    return await this.userRepository.findOne<User>({ where: { resetPasswordExpires } });
  }
  
  async saveResetPasswordExpires(userId: number, resetPasswordExpires: string): Promise<void> {
    const user = await this.userRepository.findByPk(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Simpan waktu kedaluwarsa reset password ke dalam basis data
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();
  }

  async updateUserStatus(nip: string, status: UserStatus): Promise<User> {
    const user = await this.userRepository.findOne<User>({ where: { nip } });

    if (!user) {
      throw new NotFoundException(`User with NIP ${nip} not found`);
    }

    user.status = status;
    await user.save();

    return user;
  }
  
}
