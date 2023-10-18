import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import TaskController from './task.controller';
import { taskProviders } from './task.providers';
import { memberProviders } from '../member/member.providers';
import { teamsProviders } from '../team/team.providers';
import { projectProviders } from '../project/project.providers';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { userProviders } from '../users/users.providers';
import { AuthService } from '../auth/auth.service'
import { UploadService } from 'src/core/upload/upload.service';
import { uploadProviders } from 'src/core/upload/upload.providers';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [TaskController],
  providers: [
    TaskService,
    AuthService,
    JwtService, 
    UsersService,
    UploadService,
    ...uploadProviders,
    ...taskProviders,
    ...memberProviders,
    ...teamsProviders,
    ...projectProviders, 
    ...userProviders,
  ],
})
export class TaskModule {}

// import { SequelizeModule } from '@nestjs/sequelize';
// import { Task } from './task.entity';

// imports: [SequelizeModule.forFeature([Task])], // Mengimpor model Task ke modul
