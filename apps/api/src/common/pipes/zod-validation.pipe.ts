import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

/**
 * Validates and transforms the request body against a Zod schema —
 * the NestJS equivalent of the global class-validator ValidationPipe,
 * but sharing the exact same schema apps/web uses for form validation.
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return result.data;
  }
}
