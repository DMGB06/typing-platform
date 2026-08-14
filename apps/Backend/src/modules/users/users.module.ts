import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../Prisma/prisma.service'; // Si usas Prisma
import { AuthModule } from '../auth/auth.module'; // Si necesitas autenticación

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService], // Agrega PrismaService si lo usas
  exports: [UsersService], // Exporta el servicio si otros módulos lo necesitan
})
export class UsersModule {}
