import { Module } from '@nestjs/common';
import { DifficultiesController } from './difficulties.controller';
import { DifficultiesAdminService } from './difficulties.service';
import { PrismaModule } from '../../../Prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Importa el módulo de Prisma para usar el servicio de Prisma
  controllers: [DifficultiesController], // Registra el controlador
  providers: [DifficultiesAdminService], // Registra el servicio
  exports: [DifficultiesAdminService], // Exporta el servicio si otros módulos lo necesitan
})
export class DifficultiesModule {}
