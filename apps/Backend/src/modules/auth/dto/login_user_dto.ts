import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  //Verificar que sea un email valido
  @IsEmail()
  email!: string;

  //Verificar que no esté vacío y que sea un string
  @IsNotEmpty()
  @IsString()
  password!: string;
}
