import { z } from 'zod';

/**
 * Zod schemas — the single source of truth for both the shape of the data
 * AND the validation rules.
 *
 * The big win: one schema gives us both runtime validation (checking values
 * as the app runs) and a TypeScript type (via z.infer). No need to
 * duplicate "interface here, checks there" — they can't drift apart.
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

// Types are inferred AUTOMATICALLY from the schemas — no need to write them by hand.
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
