import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  isActive: boolean | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '',
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
