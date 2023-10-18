import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDatabaseFileDto {
  @IsString()
  filename: string;

  @IsNotEmpty()
  data: string;

}
