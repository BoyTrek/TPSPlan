import { Table, Column, Model, DataType, HasOne } from 'sequelize-typescript';
import { UserRole, UserStatus } from './user.dto';
import { DatabaseFile } from 'src/core/upload/entities/upload.entity';

@Table
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true
  })
  nip: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nohp: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.ENUM,
    values: Object.values(UserRole),
    defaultValue: UserRole.USER,
  })
  role : UserRole;

  @Column({
    type: DataType.ENUM,
    values: Object.values(UserStatus),
    defaultValue: UserStatus.Active,
    allowNull: true,
  })
  status: UserStatus;

  
  @Column({
    type: DataType.STRING, // Kolom untuk menyimpan waktu kedaluwarsa reset password
    allowNull: true, // Diizinkan untuk bernilai null jika reset password tidak aktif
  })
  resetPasswordExpires: string;

  @HasOne(() => DatabaseFile)
  avatar: DatabaseFile;


}