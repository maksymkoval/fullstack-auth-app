/**
 * API functions for the "auth" feature — a thin, typed wrapper over apiRequest.
 * These are the "raw" calls. Caching, loading/error states and retries
 * are layered on top by React Query (see hooks.ts).
 */
import { apiRequest } from '../../lib/api';
import type { User, LoginInput, RegisterInput } from '@fullstack-auth-app/shared';

export const authApi = {
  // Server sets the access token as an httpOnly cookie on these two —
  // the JSON body is just the user, there's no token for the frontend to hold.
  register: (input: RegisterInput): Promise<User> =>
    apiRequest<User>('/auth/register', { method: 'POST', body: input }),

  login: (input: LoginInput): Promise<User> =>
    apiRequest<User>('/auth/login', { method: 'POST', body: input }),

  logout: (): Promise<{ success: true }> =>
    apiRequest<{ success: true }>('/auth/logout', { method: 'POST' }),

  me: (): Promise<User> => apiRequest<User>('/auth/me'),
};
