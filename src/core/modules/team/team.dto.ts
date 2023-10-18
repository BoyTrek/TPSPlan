import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class TeamDto {
  @IsNotEmpty()
  @MinLength(4)
  @ApiProperty()
  readonly namaTim: string;
}
