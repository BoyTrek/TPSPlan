import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { Team } from '../team/team.entity';
import { Member } from '../member/member.entity';
import { Status } from './status.enum';
import { Project } from '../project/project.entity';

@Table
export class Task extends Model<Task> {
  @Column
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  forUser: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  dueDate: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  taskDesc: string;

  @Column({
    type: DataType.ENUM('Pending', 'InProgress', 'Completed'),
    allowNull: false,
    defaultValue: 'Pending',
  })
  status: Status;

  // Menambahkan foreign key idTim dari Team
  @ForeignKey(() => Team)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  teamId: number;

  @BelongsTo(() => Team, 'teamId') // Menyesuaikan nama foreign key
  team: Team;

  // Menambahkan foreign key idProject dari Project
  @ForeignKey(() => Project)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  projectId: number;

  @BelongsTo(() => Project, 'projectId') // Menyesuaikan nama foreign key
  project: Project;

  // Menambahkan foreign key id dari Member
  @ForeignKey(() => Member)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  memberId: number;

  @BelongsTo(() => Member, 'memberId') // Menyesuaikan nama foreign key
  member: Member;

  @ForeignKey(() => Task)
  @Column({
    allowNull: true,
  })
  parentId: number;
  

  @BelongsTo(() => Task, { foreignKey: 'parentId', as: 'parent' })
  parentTask: Task;

  @HasMany(() => Task, { foreignKey: 'parentId', as: 'subtasks' })
  subTasks: Task[];
}
