import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DatabaseFile } from './entities/upload.entity';
import { Databasefile_REPOSITORY } from '../constants';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  constructor(
    @Inject(Databasefile_REPOSITORY)
    private readonly databaseFilesRepository: typeof DatabaseFile,
  ) {}

  async create(filename: string, data: string, userId: string): Promise<DatabaseFile> {
    const avatar = await this.getOneByUserId(userId);

    if (avatar) {
      throw new ForbiddenException('This user already has an avatar');
    }

    const newFile = await this.databaseFilesRepository.create({
      filename: filename, // Gunakan filename yang diterima dari pengguna
      data: data,
      userId: userId,
    });

    return newFile;
  }
  

  async getAvatarById(id: number): Promise<DatabaseFile | null> {
    // Periksa apakah ID valid
    if (!id || isNaN(id)) {
      // ID kosong atau tidak valid, kembalikan nilai default atau objek kosong
      return null;
    }

    // Coba mencari avatar berdasarkan ID
    const avatar = await this.databaseFilesRepository.findOne({
      where: { id },
    });

    // Jika avatar tidak ditemukan, lempar pengecualian NotFound
    if (!avatar) {
      throw new NotFoundException('Avatar not found');
    }
    // Jika avatar ditemukan, kembalikan objek avatar
    return avatar;
  }

  async delete(id: number) {
    // Menghapus avatar berdasarkan ID
    const deletedRows = await this.databaseFilesRepository.destroy({
      where: { id },
    });

    return deletedRows; // Jumlah baris yang dihapus (0 jika tidak ada data yang dihapus)
  }

  async deleteByUserId(userId: string): Promise<number> {
    const deletedRows = await this.databaseFilesRepository.destroy({
      where: { userId },
    });

    return deletedRows; // Jumlah baris yang dihapus (0 jika tidak ada data yang dihapus)
  }

  async update(data: string, userId: string, filename: string) {
    const existingAvatar = await this.getOneByUserId(userId);
    if (!existingAvatar) {
      throw new ForbiddenException("User doesn't have an avatar");
    }
  
    // Lakukan pembaruan avatar berdasarkan userId, data, dan filename
    const [numberOfAffectedRows, [updatedFile]] = await this.databaseFilesRepository.update(
      { data, filename },
      { where: { userId: Number(userId) }, returning: true }
    );
  
    // Pastikan pembaruan berhasil dan ada file yang diperbarui
    if (numberOfAffectedRows === 0 || !updatedFile) {
      throw new NotFoundException("Avatar not found or update failed");
    }
  
    // Kembalikan data avatar yang diperbarui
    return updatedFile;
  }
  
  async getOneByUserId(userId: string) {
    return await this.databaseFilesRepository.findOne({
      where: { userId },
    });
  }
  
}
