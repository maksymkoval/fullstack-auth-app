/**
 * API functions for the "auth" feature — a thin, typed wrapper over apiRequest.
 * These are the "raw" calls. Caching, loading/error states and retries
 * are layered on top by React Query (see hooks.ts).
 */
import { apiRequest } from '../../lib/api';
import type { AuthResult, User, LoginInput, RegisterInput } from '@fullstack-auth-app/shared';

export const authApi = {
  register: (input: RegisterInput): Promise<AuthResult> =>
    apiRequest<AuthResult>('/auth/register', { method: 'POST', body: input }),

  login: (input: LoginInput): Promise<AuthResult> =>
    apiRequest<AuthResult>('/auth/login', { method: 'POST', body: input }),

  me: (): Promise<User> => apiRequest<User>('/auth/me'),
};
