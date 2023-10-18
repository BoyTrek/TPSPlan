import { Module } from '@nestjs/common';
import { databaseProviders } from './Database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
