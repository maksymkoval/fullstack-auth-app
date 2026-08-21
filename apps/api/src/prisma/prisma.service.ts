import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * A thin wrapper around PrismaClient to hook the DB connection's
 * lifecycle into NestJS's own module lifecycle.
 *
 * This is the ONLY place where the app directly knows about Prisma.
 * The repository layer uses this service; nothing else knows Prisma exists.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
