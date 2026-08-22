import { Controller, Get } from '@nestjs/common';

/**
 * TEMPORARY — verifies the Sentry wiring actually reports errors from the
 * deployed instance. Remove once confirmed in the Sentry dashboard.
 */
@Controller('debug-sentry')
export class DebugSentryController {
  @Get()
  throwError() {
    throw new Error('Sentry test error — safe to ignore');
  }
}
