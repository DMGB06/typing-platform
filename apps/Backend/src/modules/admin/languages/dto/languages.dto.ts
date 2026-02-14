import { IsString, MaxLength, MinLength } from 'class-validator';

/*
  id        Int       @id @default(autoincrement())
  code      String    @unique
  name      String
  isActive  Boolean   @default(true) @map("is_active")
  createdAt DateTime  @default(now()) @map("created_at")

  // Relaciones
  texts Text[]

  @@map("languages")
  
  */

export class CreateLanguageDto {
  @IsString()
  @MaxLength(10)
  @MinLength(2)
  name!: string;

  @IsString()
  @MaxLength(10)
  @MinLength(2)
  code!: string;
}
