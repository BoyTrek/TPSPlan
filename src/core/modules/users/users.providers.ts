import { User } from './User.entity';
import { USER_REPOSITORY } from '../../constants';

export const userProviders = [
  {
    provide: USER_REPOSITORY,
    useValue: User,
  },
];
