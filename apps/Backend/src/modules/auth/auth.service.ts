import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../Prisma/prisma.service';
import { RegisterUserDto } from './dto/register_user_dto';
import { LoginUserDto } from './dto/login_user_dto';
import * as bycript from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const existeUser = await this.prisma.user.findFirst({
      //Usamos le findFirst para buscar un usuario que tenga el mismo email o username
      where: {
        OR: [
          { email: registerUserDto.email },
          { username: registerUserDto.username },
        ],
      },
    });

    //Si existe un usuario con el mismo email o username, lanzamos un error
    if (existeUser) {
      throw new BadRequestException('El usuario ya existe');
    }

    //Hasheamos la contraseña antes de guardarla en la base de datos
    const hashPassword = await bycript.hash(registerUserDto.password, 10);

    //Creamos el usuario en la base de datos con el hash de la contraseña
    try {
      const user = await this.prisma.user.create({
        data: {
          username: registerUserDto.username,
          email: registerUserDto.email,
          passwordHash: hashPassword,
        },
      });

      //Creacion del token
      const token = this.generateToken(user.id, user.email, user.role);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      console.log('Error al registrar usuario:', error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginUserDto.email,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPasswordValid = await bycript.compare(
      loginUserDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    try {
      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token: this.generateToken(
          user.id,
          user.email,
          user.role,
          user.isActive,
        ),
      };
    } catch (error) {
      console.error('Error al generar token:', error);
    }
  }

  private generateToken(
    userId: number,
    email: string,
    role: string,
    isActive: boolean = true,
  ) {
    const payload = { sub: userId, email, role, isActive };
    return this.jwtService.sign(payload);
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return user;
  }
}
