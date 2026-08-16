import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';
import { AdminCreateUserDto, AdminUpdateUserDto } from './dto/admin_user_dto';
import * as bycript from 'bcrypt';
import { UpdateUserDto } from './dto/user_dto';
import { CurrentUser } from '../../types/user.types';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // =====================================================
  // ===================== ADMIN =========================
  // =====================================================

  // Crear usuario (solo ADMIN)
  async createUser(AdminCreateUserDto: AdminCreateUserDto) {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: AdminCreateUserDto.email },
            { username: AdminCreateUserDto.username },
          ],
        },
      });

      if (existingUser) {
        throw new ConflictException(
          'El usuario ya existe con ese email o nombre de usuario',
        );
      }

      const hashPassword = await bycript.hash(AdminCreateUserDto.password, 10);

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
    } catch (error) {
      console.error('Error al crear usuario:', error as Error);
    }
  }

  //Actualizar usuario (solo ADMIN)

  async adminUpdateUser(id: number, AdminUpdateUserDto: AdminUpdateUserDto) {
    //Verificar que el usuario existe

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const emailOrUsernameExists = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: AdminUpdateUserDto.email },
          { username: AdminUpdateUserDto.username },
        ],
        NOT: { id },
      },
    });

    if (emailOrUsernameExists) {
      throw new ConflictException(
        'El email o nombre de usuario ya está en uso por otro usuario',
      );
    }

    //hashear la contraseña si se proporciona
    let hashPassword: string | undefined;
    if (AdminUpdateUserDto.password) {
      hashPassword = await bycript.hash(AdminUpdateUserDto.password, 10);
    }

    const dataToUpdate: Prisma.UserUpdateInput = {
      ...(AdminUpdateUserDto.username && {
        username: AdminUpdateUserDto.username,
      }),
      ...(AdminUpdateUserDto.email && { email: AdminUpdateUserDto.email }),
      ...(AdminUpdateUserDto.password && { passwordHash: hashPassword }),
      ...(AdminUpdateUserDto.role && { role: AdminUpdateUserDto.role }),
      ...(AdminUpdateUserDto.isActive !== undefined && {
        isActive: AdminUpdateUserDto.isActive,
      }),
    };

    try {
      const updateUser = await this.prisma.user.update({
        where: { id },
        data: dataToUpdate,
      });

      console.error('Usuario actualizado con éxito');
      return {
        username: updateUser.username,
        email: updateUser.email,
        role: updateUser.role,
        isActive: updateUser.isActive,
      };
    } catch (error) {
      console.error('Error al actualizar usuario:', error as Error);
    }
  }

  // Obtener todos los usuarios (solo ADMIN)
  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      return users;
    } catch (error) {
      console.error('Error al obtener usuarios:', error as Error);
    }
  }

  // Eliminar usuario (desactivar cuenta) (solo ADMIN)
  async deleteUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      };
    } catch (error) {
      console.error('Error al eliminar usuario:', error as Error);
    }
  }

  // =====================================================
  // ==================== USUARIO ========================
  // =====================================================

  // Actualizar su propio usuario
  async updateUser(
    id: number,
    currentUser: CurrentUser,
    updateUserDto: UpdateUserDto,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (currentUser.id !== id) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar este usuario',
      );
    }

    const orConditions: Prisma.UserWhereInput[] = [];
    if (updateUserDto.email) orConditions.push({ email: updateUserDto.email });
    if (updateUserDto.username)
      orConditions.push({ username: updateUserDto.username });

    if (orConditions.length > 0) {
      const emailOrUsernameExists = await this.prisma.user.findFirst({
        where: { OR: orConditions, NOT: { id } },
      });

      if (emailOrUsernameExists) {
        throw new ConflictException(
          'El email o nombre de usuario ya está en uso por otro usuario',
        );
      }
    }

    const dataToUpdate: Prisma.UserUpdateInput = {
      ...(updateUserDto.username && { username: updateUserDto.username }),
      ...(updateUserDto.email && { email: updateUserDto.email }),
    };

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return {
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    };
  }

  // Cambiar la contraseña propia (requiere la contraseña actual)
  async updateMyPassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const isCurrentPasswordValid = await bycript.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    const newPasswordHash = await bycript.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true };
  }

  // Desactivar la cuenta propia (self-service, mismo patrón que deleteUser del admin)
  async deactivateMyAccount(
    userId: number,
  ): Promise<{ username: string; isActive: boolean }> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
    return { username: updated.username, isActive: updated.isActive };
  }

  // Obtener perfil por ID (usuario autenticado)
  async getUserById(id: number) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return {
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      };
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error as Error);
    }
  }

  async getProfile(userId: number) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado o inactivo');
      }

      return user;
    } catch (error) {
      console.error('Error al obtener perfil:', error as Error);
    }
  }

  // Estadísticas del usuario por dificultad
  async getMyStats(userId: number): Promise<
    Array<{
      difficultyId: number;
      difficultyName: string;
      bestWpm: number;
      avgWpm: number;
      avgAccuracy: number;
      totalSessions: number;
      avgErrorRate: number;
    }>
  > {
    const stats = await this.prisma.userStatsByDifficulty.findMany({
      where: { userId },
      include: { difficulty: true },
      orderBy: { difficulty: { orderIndex: 'asc' } },
    });

    return stats.map((s) => ({
      difficultyId: s.difficultyId,
      difficultyName: s.difficulty.name,
      bestWpm: s.bestWpm,
      avgWpm: s.avgWpm,
      avgAccuracy: s.avgAccuracy,
      totalSessions: s.totalSessions,
      avgErrorRate: s.avgErrorRate,
    }));
  }

  // Preferencias del usuario: dificultad por defecto
  async getMyPreferences(
    userId: number,
  ): Promise<{ defaultDifficultyId: number | null }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { defaultDifficultyId: true },
    });

    return {
      defaultDifficultyId: user.defaultDifficultyId as number | null,
    };
  }

  async updateMyPreferences(
    userId: number,
    defaultDifficultyId: number,
  ): Promise<{ defaultDifficultyId: number | null }> {
    const difficulty = await this.prisma.difficulty.findFirst({
      where: { id: defaultDifficultyId, isActive: true },
    });
    if (!difficulty) {
      throw new NotFoundException(
        `Dificultad ${defaultDifficultyId} no encontrada`,
      );
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { defaultDifficultyId },
      select: { defaultDifficultyId: true },
    });

    return {
      defaultDifficultyId: updated.defaultDifficultyId as number | null,
    };
  }
}
