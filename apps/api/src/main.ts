import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * Application entry point (composition root).
 * Here we ONLY assemble the app and set global config —
 * no business logic. All logic lives in the modules.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Global validation: every incoming DTO is checked automatically.
  // whitelist strips fields not declared on the DTO (guards against extra data).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Allow the frontend to call the API from a different origin.
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
  });

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API running at http://localhost:${port}`);
}
bootstrap();
