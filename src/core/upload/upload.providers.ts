import { DatabaseFile } from './entities/upload.entity';
import { Databasefile_REPOSITORY } from '../constants/index';

export const uploadProviders = [
  {
    provide: Databasefile_REPOSITORY,
    useValue: DatabaseFile,
  },
];
