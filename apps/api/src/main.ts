import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * Application entry point (composition root).
 * Here we ONLY assemble the app and set global config —
 * no business logic. All logic lives in the modules.
 *
 * Request validation is per-route via ZodValidationPipe (see auth.controller.ts),
 * sharing the same schemas apps/web uses for form validation.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Allow the frontend to call the API from a different origin.
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
  });

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`API running at http://localhost:${port}`);
}
bootstrap();
