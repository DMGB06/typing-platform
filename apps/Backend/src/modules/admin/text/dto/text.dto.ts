import {
  IsBoolean,
  IsString,
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateTextDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El título no puede tener más de 200 caracteres' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'El contenido es requerido' })
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  content!: string;

  @Type(() => Number)
  @IsInt({ message: 'El ID de dificultad debe ser un número entero' })
  difficultyId!: number;

  @Type(() => Number)
  @IsInt({ message: 'El ID de tipo debe ser un número entero' })
  typeId!: number;

  @Type(() => Number)
  @IsInt({ message: 'El ID de lenguaje debe ser un número entero' })
  languageId!: number;
}

export class UpdateTextDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El título no puede tener más de 200 caracteres' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El contenido es requerido' })
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  content?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de dificultad debe ser un número entero' })
  difficultyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de tipo debe ser un número entero' })
  typeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de lenguaje debe ser un número entero' })
  languageId?: number;
}

export class FilterTextDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de dificultad debe ser un número entero' })
  difficultyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de tipo debe ser un número entero' })
  typeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de lenguaje debe ser un número entero' })
  languageId?: number;

  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  isActive?: boolean;
}

export class PaginationTextDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El número de página debe ser un número entero' })
  @Min(1, { message: 'El número de página debe ser al menos 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser al menos 1' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  limit?: number = 10;

  //Esto es para ordenar los textos por un campo específico, como título, dificultad, tipo o lenguaje. Si no se proporciona, se ordenará por fecha de creación.
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'El orden debe ser ASC o DESC' })
  order?: 'ASC' | 'DESC' = 'ASC';
}
