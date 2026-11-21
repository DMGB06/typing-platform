import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

function parseDecimal({ value }: { value: unknown }) {
  return typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN;
}

export class PaginationDto {
  @Transform(parseDecimal)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  page = 1;

  @Transform(parseDecimal)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

export function paginated<T>(
  data: T[],
  { page, limit }: PaginationDto,
  total: number,
) {
  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
