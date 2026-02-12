import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../Prisma/prisma.service'; // Si usas Prisma
import { JwtModule } from '@nestjs/jwt'; // Si usas JWT para autenticación
import { AuthModule } from '../auth/auth.module'; // Si necesitas autenticación

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Asegúrate de tener esta variable en tu .env
      signOptions: { expiresIn: '1d' },
    }),
    AuthModule, // Importa el módulo de autenticación si es necesario
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService], // Agrega PrismaService si lo usas
  exports: [UsersService], // Exporta el servicio si otros módulos lo necesitan
})
export class UsersModule {}
