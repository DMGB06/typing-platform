import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../Prisma/prisma.service';
import { RegisterUserDto } from './dto/register_user_dto';
import { LoginUserDto } from './dto/login_user_dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const existeUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: registerUserDto.email },
          { username: registerUserDto.username },
        ],
      },
    });

    if (existeUser) {
      throw new BadRequestException('El usuario ya existe');
    }

    const hashPassword = await bcrypt.hash(registerUserDto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          username: registerUserDto.username,
          email: registerUserDto.email,
          passwordHash: hashPassword,
        },
      });

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
    } catch {
      throw new InternalServerErrorException('No se pudo registrar el usuario');
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginUserDto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
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
    } catch {
      throw new InternalServerErrorException('No se pudo iniciar sesión');
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
