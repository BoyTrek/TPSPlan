import { IsNotEmpty, IsInt } from 'class-validator';
import { UserRole } from '../users/user.dto';

export class MemberDTO {
  
  readonly teamId: number;
  readonly userId: number;
  readonly memberId: number;

  // role?: UserRole;
}