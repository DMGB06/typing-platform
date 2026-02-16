import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @MaxLength(10)
  @MinLength(2)
  @IsNotEmpty()
  name!: string;

  @IsString()
  @MaxLength(10)
  @MinLength(2)
  @IsNotEmpty()
  code!: string;
}

export class UpdateLanguageDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @MinLength(2)
  code?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
