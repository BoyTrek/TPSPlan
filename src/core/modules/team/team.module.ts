import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { teamsProviders } from './team.providers';
import { memberProviders } from '../member/member.providers';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { userProviders } from '../users/users.providers';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { UploadService } from 'src/core/upload/upload.service';
import { uploadProviders } from 'src/core/upload/upload.providers';

@Module({
  controllers: [TeamController],
  providers: [
    TeamService,
    ...teamsProviders,
    ...memberProviders,
    JwtService,
    UsersService,
    ...userProviders,
    AuthService,
    MailService,
    UploadService,
    ...uploadProviders
  ],
})
export class TeamModule {}
