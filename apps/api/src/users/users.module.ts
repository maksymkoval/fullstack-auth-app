import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';

/**
 * The Users module encapsulates everything user-related.
 *
 * exports: [UsersService] — we deliberately expose the SERVICE to other
 * modules (AuthModule uses it). But UsersRepository is NOT exported:
 * DB access stays a private detail of this module.
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
