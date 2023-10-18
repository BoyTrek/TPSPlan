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
import { UserRole } from '../users/user.dto';

@Table
export class Member extends Model<Member> {

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

  // @Column({
  //   type: DataType.ENUM,
  //   values: Object.values(UserRole),
  //   defaultValue: UserRole.USER,
  // })
  // role : UserRole;
}
