import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string = '';

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email: string = '';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string = '';

  @IsOptional()
  @IsBoolean()
  isActive: boolean = true;
}
