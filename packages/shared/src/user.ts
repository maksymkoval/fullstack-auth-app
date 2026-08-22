/**
 * Types for server RESPONSES (what comes back from the backend).
 * Form input types (LoginInput / RegisterInput) live in auth.ts,
 * since they're inferred from the validation schemas.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}
