import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../../../types/user.types';
import { CurrentUser } from '../../../types/user.types';

@Injectable()
export class AdminGuard implements CanActivate {
  //Entonces cuando se usa el implements es como un contrato
  //El contrato es que la clase debe implementar el método canActivate que devuelve un booleano o una promesa de booleano
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Express.Request>();
    const user = request.user as CurrentUser; //El usuario debe estar en el request desbpués de la autenticación

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Acceso denegado: Solo los administradores pueden acceder a esta ruta',
      );
    }
    return true;
  }
}
