import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';
import { AdminCreateUserDto } from './dto/admin_dto';
import * as bycript from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(AdminCreateUserDto: AdminCreateUserDto) {
    //Validacion del email que se esta creando
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: AdminCreateUserDto.email },
          { username: AdminCreateUserDto.username },
        ],
      },
    });

    if (existingUser) {
      throw new Error('El usuario ya existe con ese email o nombre de usuario');
    }

    //hashear la contraseña antes de guardarla en la base de datos
    const hashPassword = await bycript.hash(AdminCreateUserDto.password, 10);

    //Crear el usuario en la base de datos con el hash de la contraseña
    const user = await this.prisma.user.create({
      data: {
        username: AdminCreateUserDto.username,
        email: AdminCreateUserDto.email,
        passwordHash: hashPassword,
        role: AdminCreateUserDto.role,
        isActive: AdminCreateUserDto.isActive,
      },
    });

    return {
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
