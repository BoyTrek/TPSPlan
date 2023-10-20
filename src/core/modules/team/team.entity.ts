import { BelongsTo, Column, DataType, ForeignKey, Model, Table, HasMany } from "sequelize-typescript";
import { User } from "../users/User.entity";
import { Member } from "../member/member.entity";
import { Project } from "../project/project.entity";

@Table
export class Team extends Model<Team> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  idTim: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  namaTim: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => Member)
  members: Member[];

  @HasMany(() => Project)
  projects: Project[];

}
