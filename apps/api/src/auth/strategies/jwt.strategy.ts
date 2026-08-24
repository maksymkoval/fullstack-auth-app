import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { UserEntity } from '../../users/entities/user.entity';

/** What we put inside the token (the payload). */
export interface JwtPayload {
  sub: string; // user id (the standard "subject" field)
  email: string;
}

/**
 * Passport's JWT strategy. Runs for every protected request:
 *  1. pulls the token out of the httpOnly `accessToken` cookie (falling
 *     back to an Authorization header, so curl/Postman-style API clients
 *     that can't hold a cookie jar still work),
 *  2. verifies its signature against the secret,
 *  3. if valid — calls validate() with the decoded payload.
 *
 * Whatever validate() returns, Nest puts into request.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.accessToken ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'super-secret-change-me'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    // Check that the user still exists (they may have been deleted after the token was issued).
    try {
      return await this.usersService.findById(payload.sub);
    } catch {
      throw new UnauthorizedException('User not found');
    }
  }
}
