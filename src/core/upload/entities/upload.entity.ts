import { Column, DataType, Table, BelongsTo, ForeignKey, Model } from 'sequelize-typescript';
import { User } from 'src/core/modules/users/User.entity';

interface DatabaseFileType {
  filename: string;
  data: string; // Menggunakan STRING untuk menyimpan data base64
  userId: string; // Menggunakan STRING untuk menyimpan ID pengguna
}

@Table({ tableName: 'files' })
export class DatabaseFile extends Model<DatabaseFile, DatabaseFileType> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: true })
  filename: string;

  @Column({ type: DataType.TEXT, allowNull: false }) // Menggunakan TEXT untuk menyimpan data base64
  data: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING, // Menggunakan STRING untuk menyimpan ID pengguna
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;
  mimetype: any;
}
