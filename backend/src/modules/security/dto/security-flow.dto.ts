import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RequestPasswordRecoveryDto {
  @IsEmail()
  email: string;
}

export class ConfirmPasswordRecoveryDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class RequestEmailVerificationDto {
  @IsEmail()
  email: string;
}

export class ConfirmEmailVerificationDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}

export class DataControlRequestDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
