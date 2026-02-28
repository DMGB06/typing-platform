import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class TextFilterDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  difficultyId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  typeId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  languageId?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
