import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Team } from '../team/team.entity';
import { User } from '../users/user.entity';

@Table
export class Member extends Model<Member> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true, // Mengatur kolom sebagai primary key
    autoIncrement: true, // Mengatur kolom sebagai auto-increment
    allowNull: false,
    field: 'idMember', // Mengatur nama kolom ID
  })
  idMember: number; // Kolom ID dengan nama idMember

  @ForeignKey(() => Team)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  teamId: number;

  @BelongsTo(() => Team)
  team: Team;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;
}
