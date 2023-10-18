import { IsNotEmpty, IsInt } from 'class-validator';
import { UserRole } from '../users/user.dto';

export class MemberDTO {
  
  readonly teamId: number;
  readonly userId: string;
  readonly memberId: string;

  // role?: UserRole;
}