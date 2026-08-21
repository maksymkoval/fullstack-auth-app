import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * CONTROLLER layer: the ONLY place that knows about HTTP.
 *
 * A controller's job:
 *  - map a URL/method to an action,
 *  - pull out the input (@Body, @Param, @Query),
 *  - call the service,
 *  - return the result.
 * No business logic belongs here.
 *
 * @UseGuards(JwtAuthGuard) — the whole controller is protected: no valid
 * JWT in the Authorization header means no access.
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }
}
