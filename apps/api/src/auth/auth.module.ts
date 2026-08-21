import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * The Auth module wires up everything authentication needs.
 *
 * - imports: UsersModule → gives us access to UsersService (it's exported).
 * - JwtModule.registerAsync → configures token signing with the secret from .env.
 * - providers: AuthService (logic) + JwtStrategy (token verification).
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'super-secret-change-me'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
