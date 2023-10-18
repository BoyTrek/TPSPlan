import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  Equals,
  IsOptional,
} from 'class-validator';

export enum UserRole {
  SUPERADMIN = 'Super Admin',
  ADMIN = 'Admin',
  USER = 'User',
}

export enum UserStatus {
  Active = 'Active',
  InActive = 'InActive',
}

export class UserDto {
  @IsNotEmpty({ message: 'NIP tidak boleh kosong' })
  @MinLength(15, { message: 'NIP harus memiliki setidaknya 15 karakter' })
  readonly nip: string;

  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  readonly name: string;

  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  readonly email: string;

  @IsNotEmpty({ message: 'Nomor HP tidak boleh kosong' })
  @MinLength(12, { message: 'Nomor HP harus memiliki setidaknya 12 karakter' })
  readonly nohp: number;

  password: string;

  role?: UserRole;

  @IsOptional()
  status: UserStatus;

  resetPasswordExpires: string;
}
