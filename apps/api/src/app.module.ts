import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
