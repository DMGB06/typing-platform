import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  //Verificar que sea un email valido
  @IsEmail()
  email: string = '';

  //Veriifcar que no este vacio y que sea un string
  @IsNotEmpty()
  @IsString()
  password: string = '';

  @IsBoolean()
  isActive: boolean = true;
}
