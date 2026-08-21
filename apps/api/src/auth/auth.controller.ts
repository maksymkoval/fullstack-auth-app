import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthService, AuthResult } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { UserEntity } from "../users/entities/user.entity";

/**
 * Auth CONTROLLER layer. Again: only HTTP, no business logic.
 * Each method is a thin wrapper around the matching service method.
 */
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto): Promise<AuthResult> {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto): Promise<AuthResult> {
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
