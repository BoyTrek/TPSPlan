import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, SetMetadata} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../modules/users/users.service';
import { Observable } from 'rxjs';
import { User } from '../modules/users/User.entity';
import { AuthService } from '../modules/auth/auth.service'; // Pastikan telah mengimpor AuthService

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    const hasRole = () => roles.indexOf(user.role) > -1;
    if (!hasRole()) {
      // Jika pengguna tidak memiliki peran yang diperlukan, lempar pengecualian UnauthorizedException
      const message = this.reflector.get<string>('message', context.getHandler()) || 'Anda tidak memiliki izin untuk mengakses sumber daya ini';
      throw new UnauthorizedException('Anda tidak memiliki izin untuk mengakses sumber daya ini');
    }

    return hasRole();
  }
}
