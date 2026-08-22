import { Body, Controller, Get, Post, UseGuards, UsePipes } from "@nestjs/common";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@fullstack-auth-app/shared";
import { AuthService, AuthResult } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { UserEntity } from "../users/entities/user.entity";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

/**
 * Auth CONTROLLER layer. Again: only HTTP, no business logic.
 * Each method is a thin wrapper around the matching service method.
 */
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @UsePipes(new ZodValidationPipe(registerSchema))
  register(@Body() dto: RegisterInput): Promise<AuthResult> {
    return this.authService.register(dto);
  }

  @Post("login")
  @UsePipes(new ZodValidationPipe(loginSchema))
  login(@Body() dto: LoginInput): Promise<AuthResult> {
    return this.authService.login(dto);
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
