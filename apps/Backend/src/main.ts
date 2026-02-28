import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Puertos del frontend
    credentials: true,
  });

  // Habilita la validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma los objetos al tipo del DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
