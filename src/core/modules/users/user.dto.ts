import { IsNotEmpty, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum UserStatus {
  Active = 'Active',
  InActive = 'InActive',
}
export enum UserRole {
  SUPERADMIN = 'Super Admin',
  ADMIN = 'Admin',
  USER = 'User',
}

export class UserDto {
  @IsNotEmpty({ message: 'NIP tidak boleh kosong' })
  @MinLength(15, { message: 'NIP harus memiliki setidaknya 15 karakter' })
  readonly nip: string;

  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  readonly name: string;

  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  readonly email: string;

  @IsNotEmpty({ message: 'Nomor HP tidak boleh kosong' })
  @IsOptional()
  @MinLength(12, { message: 'Nomor HP harus memiliki setidaknya 12 karakter' })
  readonly nohp: number;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(6, { message: 'Password harus memiliki setidaknya 6 karakter' })
  password: string;

  @IsOptional()
  status: UserStatus;

  @IsOptional()
  role?: UserRole;
}



