import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { LoginInput, RegisterInput } from '@fullstack-auth-app/shared';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthResult {
  accessToken: string;
  user: UserEntity;
}

/**
 * Auth SERVICE layer. All authentication logic lives here:
 * password hashing, credential checks, issuing JWTs.
 *
 * Note: auth never touches the DB directly — it goes through
 * UsersService. That keeps the separation of concerns intact: users
 * as an entity live in UsersModule, login logic lives here.
 */
@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterInput): Promise<AuthResult> {
    const existing = await this.usersService.findByEmailWithHash(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    return this.buildAuthResult(user);
  }

  async login(dto: LoginInput): Promise<AuthResult> {
    const user = await this.usersService.findByEmailWithHash(dto.email);

    // Same message for "no such email" and "wrong password",
    // so we don't give an attacker a hint about which emails exist.
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResult(
      new UserEntity({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      }),
    );
  }

  /** Signs the JWT and assembles the response. */
  private buildAuthResult(user: UserEntity): AuthResult {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user };
  }
}
