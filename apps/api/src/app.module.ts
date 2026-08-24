import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { validateEnv } from './env.validation';

/**
 * Root module. It doesn't do anything itself — it just "glues"
 * the feature modules together. Each module encapsulates its own domain slice.
 */
@Module({
  imports: [
    // Reads .env, makes ConfigService available everywhere (global: true),
    // and validates the result — an invalid/missing var fails at boot
    // instead of at the first request that needed it.
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    // Global default; routes that need a tighter limit (login) override it
    // with @Throttle(...).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    // JSON logs with a request id on every line, for tracing a request
    // across log entries. redact strips the auth header and password field
    // so they never end up in log storage.
    LoggerModule.forRoot({
      pinoHttp: {
        redact: ['req.headers.authorization', 'req.body.password'],
      },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
