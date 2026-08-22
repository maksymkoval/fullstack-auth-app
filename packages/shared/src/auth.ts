import { z } from 'zod';

/**
 * Zod schemas — the single source of truth for both the shape of the data
 * AND the validation rules. Shared between apps/web (form validation) and
 * apps/api (request validation via ZodValidationPipe) so the two can't
 * drift apart the way separate class-validator DTOs used to.
 */

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password is too long'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
