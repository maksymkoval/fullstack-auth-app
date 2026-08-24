import './instrument';

import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';

/**
 * Application entry point (composition root).
 * Here we ONLY assemble the app and set global config —
 * no business logic. All logic lives in the modules.
 *
 * Request validation is per-route via ZodValidationPipe (see auth.controller.ts),
 * sharing the same schemas apps/web uses for form validation.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new SentryExceptionFilter(app.get(HttpAdapterHost)));

  // Railway sits in front of the app as a reverse proxy — possibly more
  // than one hop (edge + internal load balancer). Without this, Express
  // reads req.ip from the raw socket peer, which is one of Railway's own
  // nodes, not the actual client, and can differ between requests from
  // the *same* client. `true` trusts the whole X-Forwarded-For chain and
  // takes the leftmost (original client) IP, rather than guessing a
  // specific hop count that might be wrong. ThrottlerGuard keys its
  // rate-limit buckets off req.ip, so an unstable value was silently
  // splitting one client's requests across multiple buckets.
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  app.use(helmet());
  // Needed to read the httpOnly accessToken cookie in JwtStrategy.
  app.use(cookieParser());

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
