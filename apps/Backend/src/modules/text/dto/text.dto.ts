import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TextFilterDto } from './text-filter.dto';

export class TextPaginationDto extends TextFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
