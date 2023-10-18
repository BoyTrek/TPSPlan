import { Module } from '@nestjs/common';
import { DatabaseModule } from './core/database/Database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './core/modules/auth/auth.module';
import { UsersModule } from './core/modules/users/users.module';
import { ProjectModule } from './core/modules/project/project.module';
import { TeamModule } from './core/modules/team/team.module';
import { MemberModule } from './core/modules/member/member.module';
import { TaskModule } from './core/modules/task/task.module';
import { MailModule } from './core/modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProjectModule,
    TeamModule,
    MemberModule,
    TaskModule,
    MailModule
  ],
  
})
export class AppModule {}
