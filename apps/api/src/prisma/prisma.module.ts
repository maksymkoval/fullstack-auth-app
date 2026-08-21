import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @Global() makes PrismaService available in any module
 * without re-importing it. This is the usual pattern for infrastructure
 * services that many modules need (DB, logger, config).
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
