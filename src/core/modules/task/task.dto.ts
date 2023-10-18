import { Status } from './status.enum';
import { IsString, IsOptional } from 'class-validator';

export class TaskDto {
  @IsString()
  name: string;

  @IsOptional()
  dueDate?: string;
  taskDesc?: string;
  status: Status;
  forUser: string;
  parentId?: number;
}