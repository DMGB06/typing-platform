import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsUUID,
  Matches,
  Max,
  ValidateIf,
  Min,
} from 'class-validator';

export const typingEventPattern =
  /^(?:Backspace|[\t\n]|[^\p{Cc}\p{Cs}])$(?![\s\S])/u;

export class StartTypingSessionDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  textId!: number;

  @ValidateIf((_: unknown, value: unknown) => value !== undefined)
  @Matches(/^[a-f0-9]{64}$(?![\s\S])/)
  expectedContentHash?: string;
}

export class CreateTypingSessionDto {
  @IsUUID('4')
  attemptId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @Matches(typingEventPattern, { each: true })
  events!: string[];
}
