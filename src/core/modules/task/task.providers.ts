import {
  MEMBER_REPOSITORY,
  PROJECT_REPOSITORY,
  TASK_REPOSITORY,
  TEAM_REPOSITORY,
} from 'src/core/constants';
import { Task } from './task.entity';

export const taskProviders = [
  {
    provide: TASK_REPOSITORY, MEMBER_REPOSITORY, PROJECT_REPOSITORY, TEAM_REPOSITORY,
    useValue: Task,
  },
];
