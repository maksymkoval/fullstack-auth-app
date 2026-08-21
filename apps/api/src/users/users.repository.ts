import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * REPOSITORY layer: the one place that knows HOW the data actually
 * sits in the DB.
 *
 * Why a separate repository instead of calling Prisma right from the service?
 *  - The service handles business logic and shouldn't know SQL/ORM details.
 *  - If you ever swap Prisma for TypeORM/Drizzle/raw SQL —
 *    only this file changes, the service stays untouched.
 *  - Easy to mock in unit tests.
 *
 * The repository returns "raw" DB models (Prisma's User type).
 * Turning that into a safe UserEntity is the service's job.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
