import {
  IsInt,
  IsOptional,
  IsNumber,
  IsPositive,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ------------------------------------------------
// Error individual cometido durante la sesión
// ------------------------------------------------
export class TypingErrorDto {
  @IsOptional()
  @IsString()
  wrongWord?: string;

  @IsOptional()
  @IsString()
  correctWord?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

// ------------------------------------------------
// Body que envía el frontend al terminar una sesión
// ------------------------------------------------
export class CreateTypingSessionDto {
  @IsInt()
  @IsPositive()
  textId!: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  wpm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracy?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  timeSeconds?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  errorRate?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TypingErrorDto)
  errors?: TypingErrorDto[];
}

// ------------------------------------------------
// Respuesta que devuelve el backend
// ------------------------------------------------
export class TypingSessionResponseDto {
  id!: number;
  userId!: number;
  textId!: number;
  wpm!: number | null;
  accuracy!: number | null;
  timeSeconds!: number | null;
  errorRate!: number | null;
  improvementRate!: number | null;
  createdAt!: Date;
}
