import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import TaskController from './task.controller';
import { taskProviders } from './task.providers';
import { memberProviders } from '../member/member.providers';
import { teamsProviders } from '../team/team.providers';
import { projectProviders } from '../project/project.providers';

@Module({
  controllers: [TaskController],
  providers: [
    TaskService,
    ...taskProviders,
    ...memberProviders,
    ...teamsProviders,
    ...projectProviders,
  ],
})
export class TaskModule {}

// import { SequelizeModule } from '@nestjs/sequelize';
// import { Task } from './task.entity';

// imports: [SequelizeModule.forFeature([Task])], // Mengimpor model Task ke modul
