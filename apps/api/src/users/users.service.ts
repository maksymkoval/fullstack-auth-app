import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

/**
 * SERVICE layer: business logic around users.
 *
 * The service does NOT know about HTTP (no req/res) and does NOT know
 * about SQL (no Prisma). It works through the repository and applies
 * domain rules.
 *
 * This is also where "sanitizing" happens — turning the raw DB model
 * into a safe UserEntity (no passwordHash).
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const user = await this.usersRepository.create(dto);
    return this.toEntity(user);
  }

  /**
   * Returns the RAW model with passwordHash — only the auth layer needs
   * this, for password comparison. Never handed out to controllers.
   */
  findByEmailWithHash(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return this.toEntity(user);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.usersRepository.findAll();
    return users.map((u) => this.toEntity(u));
  }

  /** Maps the DB model to a safe entity for the client. */
  private toEntity(user: User): UserEntity {
    return new UserEntity({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });
  }
}
