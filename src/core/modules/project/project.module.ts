import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { projectProviders } from './project.providers';
import { teamsProviders } from '../team/team.providers';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { userProviders } from '../users/users.providers';
import { AuthService } from '../auth/auth.service';
import { UploadService } from 'src/core/upload/upload.service';
import { UploadModule } from 'src/core/upload/upload.module';
import { uploadProviders } from 'src/core/upload/upload.providers';
import { JwtStrategy } from '../auth/jwt.strategy';
import { LocalStrategy } from '../auth/local.strategy';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { DatabaseFile } from 'src/core/upload/entities/upload.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';


@Module({
  controllers: [ProjectController],
  providers: [ProjectService, ...projectProviders, ...teamsProviders, DatabaseFile,
    //Add Roles//
    JwtService, UsersService, ...userProviders, AuthService, UploadService, ...uploadProviders,JwtStrategy,LocalStrategy, RolesGuard, JwtAuthGuard],
})
export class ProjectModule {}
