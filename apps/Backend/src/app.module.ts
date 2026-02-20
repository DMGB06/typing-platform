import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './Prisma/prisma.module';
import { AdminModule } from './modules/admin/admin.module';
import { TextModule } from './modules/text/text.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, AdminModule, TextModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
