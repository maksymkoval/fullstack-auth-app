import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

/**
 * Root module. It doesn't do anything itself — it just "glues"
 * the feature modules together. Each module encapsulates its own domain slice.
 */
@Module({
  imports: [
    // Reads .env and makes ConfigService available everywhere (global: true).
    ConfigModule.forRoot({ isGlobal: true }),
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
})
export class AppModule {}
