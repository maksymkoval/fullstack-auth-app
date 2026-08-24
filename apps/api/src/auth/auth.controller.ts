import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { CookieOptions, Response } from "express";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@fullstack-auth-app/shared";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { UserEntity } from "../users/entities/user.entity";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

const ACCESS_TOKEN_COOKIE = "accessToken";

/**
 * Auth CONTROLLER layer. Again: only HTTP, no business logic.
 * Each method is a thin wrapper around the matching service method.
 */
@Controller("auth")
export class AuthController {
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    const isProd = config.get<string>("NODE_ENV") === "production";
    this.cookieOptions = {
      httpOnly: true,
      // Prod: apps/web (Vercel) and apps/api (Railway) are different
      // domains, so a cross-site request needs SameSite=None to send the
      // cookie at all — which browsers only honor when Secure is also set.
      // Dev: localhost:5173 and localhost:3000 count as the *same* site
      // (only scheme+registrable domain matter, not port), and Secure
      // cookies are flat-out rejected over plain http:// — so dev needs
      // the opposite settings, or login silently never sets a cookie.
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // keep in sync with JWT_EXPIRES_IN's default
    };
  }

  @Post("register")
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(
    @Body() dto: RegisterInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserEntity> {
    const result = await this.authService.register(dto);
    res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, this.cookieOptions);
    return result.user;
  }

  @Post("login")
  @UsePipes(new ZodValidationPipe(loginSchema))
  // Tighter than the global default (100/min) — login is the endpoint
  // brute-forcing actually targets.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() dto: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserEntity> {
    const result = await this.authService.login(dto);
    res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, this.cookieOptions);
    return result.user;
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response): { success: true } {
    // clearCookie needs the same attributes used to set it (httpOnly/
    // secure/sameSite/path), or the browser treats it as a different
    // cookie and won't remove it — EXCEPT maxAge: passing that through
    // makes Express compute a future expiry instead of clearing it, since
    // clearCookie is really just cookie() with maxAge forced negative.
    const { maxAge: _maxAge, ...clearOptions } = this.cookieOptions;
    res.clearCookie(ACCESS_TOKEN_COOKIE, clearOptions);
    return { success: true };
  }

  /**
   * Protected route. JwtAuthGuard verifies the token, and @CurrentUser
   * pulls out the user the strategy attached. The "who am I?" endpoint.
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: UserEntity): UserEntity {
    return user;
  }
}
