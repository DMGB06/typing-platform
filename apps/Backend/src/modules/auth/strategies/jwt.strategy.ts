import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { ACCESS_TOKEN_COOKIE } from '../auth.constants';

interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  isActive: boolean | null;
}

export function extractJwtFromCookie(req: Request): string | null {
  if (req?.cookies && typeof req.cookies[ACCESS_TOKEN_COOKIE] === 'string') {
    return req.cookies[ACCESS_TOKEN_COOKIE];
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET no está definido. Copiá apps/Backend/.env.example a .env y completá los valores.',
      );
    }
    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }
    // Retorna el usuario completo con el rol
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      isActive: user.isActive,
    };
  }
}
