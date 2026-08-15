import {
  Body,
  Put,
  Param,
  Req,
  Controller,
  Post,
  ForbiddenException,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminGuard } from '../../common/decorators/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/wt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { AdminCreateUserDto, AdminUpdateUserDto } from './dto/admin_user_dto';
import { UpdateUserDto } from './dto/user_dto';
import type { Request } from 'express';
import { CurrentUser } from '../../types/user.types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =====================================================
  // ===================== ADMIN =========================
  // =====================================================
  @Post('admin/create')
  @UseGuards(JwtAuthGuard, AdminGuard) //Solo administradores pueden crear usuarios
  createUser(@Body() AdminCreateUserDto: AdminCreateUserDto) {
    return this.usersService.createUser(AdminCreateUserDto);
  }

  //Eliminar usuario (desactivar cuenta)
  @Put('admin/delete/:id')
  @UseGuards(JwtAuthGuard, AdminGuard) //Solo administradores pueden desactivar cuentas usuarios
  deleteUser(@Param('id') UserId: string) {
    return this.usersService.deleteUser(Number(UserId));
  }

  @Put('admin/update/:id')
  @UseGuards(JwtAuthGuard, AdminGuard) //Solo administradores pueden actualizar cuentas usuarios
  async adminUpdateUser(
    @Param('id') UserId: string,
    @Body() AdminUpdateUserDto: AdminUpdateUserDto,
  ) {
    return this.usersService.adminUpdateUser(
      Number(UserId),
      AdminUpdateUserDto,
    );
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard) //Solo administradores pueden ver la lista de usuarios
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard) //Solo administradores pueden ver el perfil de otros usuarios
  async getUserById(@Param('id') UserId: string) {
    return this.usersService.getUserById(Number(UserId));
  }

  // =====================================================
  // ===================== USUARIOS ======================
  // =====================================================

  // Actualizar propio perfil - usa automáticamente el ID del usuario autenticado
  @Put('me')
  @UseGuards(JwtAuthGuard) // Solo usuarios autenticados
  async updateOwnProfile(
    @Body() updateData: UpdateUserDto,
    @Req() req: Request,
  ) {
    const currentUser = req.user as CurrentUser;

    if (!currentUser) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Usa automáticamente el ID del usuario autenticado
    return this.usersService.updateUser(
      currentUser.id,
      currentUser,
      updateData,
    );
  }

  // Obtener propio perfil
  @Get('me')
  @UseGuards(JwtAuthGuard) // Solo usuarios autenticados
  async getMyProfile(@Req() req: Request) {
    const currentUser = req.user as CurrentUser;

    if (!currentUser) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    return this.usersService.getUserById(currentUser.id);
  }

  // Obtener las estadísticas propias por dificultad
  @Get('me/stats')
  @UseGuards(JwtAuthGuard) // Solo usuarios autenticados
  async getMyStats(@Req() req: Request) {
    const currentUser = req.user as CurrentUser;

    if (!currentUser) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    return this.usersService.getMyStats(currentUser.id);
  }
}
