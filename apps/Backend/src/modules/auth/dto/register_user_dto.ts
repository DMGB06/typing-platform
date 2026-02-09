import { IsEmail, MinLength, IsString, IsBoolean } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string = '';

  @IsString()
  username: string = '';

  @MinLength(6)
  password: string = '';

  @IsBoolean()
  isActive: boolean = true;
}
