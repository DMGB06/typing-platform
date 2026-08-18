import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register_user_dto';
import { LoginUserDto } from './dto/login_user_dto';
import {
  ACCESS_TOKEN_COOKIE,
  SESSION_MAX_AGE_MS,
  REMEMBER_ME_MAX_AGE_MS,
} from './auth.constants';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.authService.register(registerUserDto);
    this.setAuthCookie(res, token);
    return { user };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.authService.login(loginUserDto);
    this.setAuthCookie(res, token, loginUserDto.rememberMe);
    return { user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, this.cookieAttrs());
    return { success: true };
  }

  private setAuthCookie(
    res: Response,
    token: string,
    rememberMe?: boolean,
  ): void {
    res.cookie(ACCESS_TOKEN_COOKIE, token, {
      ...this.cookieAttrs(),
      maxAge: rememberMe ? REMEMBER_ME_MAX_AGE_MS : SESSION_MAX_AGE_MS,
    });
  }

  // Frontend y backend viven en dominios distintos en producción (Vercel /
  // Render), así que la cookie necesita SameSite=None para viajar en
  // fetch(credentials:'include') cross-origin - eso exige Secure=true
  // (los navegadores rechazan SameSite=None sin Secure). En local, ambos
  // corren en localhost sobre HTTP, así que se usa Lax + no-secure.
  private cookieAttrs() {
    const secure = process.env.COOKIE_SECURE !== 'false';
    return {
      httpOnly: true,
      secure,
      sameSite: secure ? ('none' as const) : ('lax' as const),
    };
  }
}
