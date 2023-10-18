import {
  Controller,
  Request,
  Body,
  Post,
  UseGuards,
  Get,
  Put,
  Param,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Res,
  Delete,
  UseInterceptors,
  ForbiddenException,
  UploadedFile,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserDto, UserRole, UserStatus } from '../../modules/users/user.dto';
import { DoesUserExist } from 'src/core/guards/UserExist.guard';
import { hasRoles } from './decorators/roles.decorators';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { ApiParam } from '@nestjs/swagger';
import { UploadService } from 'src/core/upload/upload.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { DatabaseFile } from 'src/core/upload/entities/upload.entity';
import { CreateDatabaseFileDto } from 'src/core/upload/upload.dto';
import { validate } from 'class-validator';
import { Multer } from 'multer';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly uploadService: UploadService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(@Request() req) {
    try {
      const user = req.user;

      // Memeriksa apakah status pengguna adalah 'Active' sebelum memberi akses
      
      if (user.status !== UserStatus.Active) {
        return {
          message: 'Akun Anda tidak aktif. Harap hubungi administrator.',
        };
      }

      const result = await this.authService.login(user);
      return result;
    } catch (error) {
      return {
        message:
          'Gagal masuk. Pastikan Anda mengisi username dan password dengan benar.',
      };
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/user/by-nip/:nip')
  async getUserByNip(@Param('nip') nip: number) {
    try {
      // Panggil metode findByNip dari AuthService untuk mencari pengguna berdasarkan NIP
      const user = await this.authService.findByNip(nip);

      // Kembalikan data pengguna yang ditemukan
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        'Terjadi kesalahan dalam mencari data pengguna berdasarkan NIP.',
      );
    }
  }

  // @hasRoles(UserRole.SUPERADMIN)
  // @UseGuards(AuthGuard('jwt'), RolesGuard, DoesUserExist)
  @Post('/signup')
  async create(@Body() user: UserDto) {
    // Set status pengguna ke 'Active' saat mendaftar
    user.status = UserStatus.Active; // Sesuaikan dengan nilai status yang sesuai

    return await this.authService.create(user);
  }

  @hasRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/user')
  async getDataUser(@Request() req) {
    return await this.authService.getDataUser();
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('/update-password/:userId')
  async updatePassword(
    @Param('userId') userId: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    const numericUserId = parseInt(userId, 10); // Mengonversi userId dari string ke number
    await this.authService.updatePassword(
      numericUserId,
      currentPassword,
      newPassword,
    );
    return { message: 'Password updated successfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('/update-user/:userId')
  async updateUser(
    @Param('userId') userId: number,
    @Body() updateUserDto: Partial<UserDto>,
  ) {
    try {
      // Panggil metode updateUser dari service
      const updatedUser = await this.authService.updateUser(
        userId,
        updateUserDto,
      );

      // Jika pembaruan berhasil, kembalikan data pengguna yang diperbarui
      return { message: 'User updated successfully', user: updatedUser };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan dalam mengupdate pengguna.',
      );
    }
  }

  // Avatar
  // @UseGuards(AuthGuard('jwt'))
  @Get('avatar/:id')
  public async getAvatarByUserId(
    @Param('id') id: string,
    @Res() response: any,
  ): Promise<any> {
    const file = await this.uploadService.getOneByUserId(id);
    return response.json(file);
  }

  @Post('avatar/:userId')
  @UseInterceptors(FileInterceptor('data'))
  async addAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: string,
  ): Promise<any> {
    try {
      const uploadedFile = await this.authService.uploadAvatar(file, userId);
      return { message: 'File berhasil diunggah', file: uploadedFile };
    } catch (error) {
      throw new BadRequestException('Gagal mengunggah file: ' + error.message);
    }
  }

  @Put('avatar/:userId')
  @UseInterceptors(FileInterceptor('avatar')) // Gunakan 'avatar' sebagai nama field untuk file
  async updateAvatar(
    @Param('userId') userId: string,
    @UploadedFile() avatar: Express.Multer.File,
    @Body('filename') filename: string,
  ): Promise<any> {
    try {
      // Pastikan 'avatar' ada nilainya sebelum memanggil service
      if (!avatar) {
        throw new BadRequestException('Invalid avatar');
      }

      // Lakukan pembaruan avatar berdasarkan userId, avatar, dan filename
      const base64Data = `data:${
        avatar.mimetype
      };base64,${avatar.buffer.toString('base64')}`;
      const updatedFile = await this.authService.updateUserAvatar(
        userId,
        base64Data,
        filename,
      );

      return { message: 'Avatar updated successfully', avatar: updatedFile };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete('avatar/:userId') // Menggunakan userId sebagai parameter route
  async remove(@Param('userId') userId: string) {
    const deleted = await this.uploadService.deleteByUserId(userId);

    if (deleted === 0) {
      throw new NotFoundException('No avatar found for this user');
    }

    return 'Successfully deleted';
  }

  // @Put(':nip/status')
  // async updateStatus(@Param('nip') nip: number, @Body('status') status: UserStatus): Promise<UserDto> {
  //   try {
  //     const updatedUser = await this.authService.updateUserStatus(nip, status);
  //     return updatedUser;
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       // Tanggapan jika pengguna dengan NIP tertentu tidak ditemukan
  //       throw new NotFoundException(error.message);
  //     }
  //     // Tanggapan jika terjadi kesalahan server
  //     throw error;
  //   }
  // }
}
