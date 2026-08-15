import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateUserPreferencesDto {
  @IsInt()
  @IsNotEmpty()
  defaultDifficultyId!: number;
}
