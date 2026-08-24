/**
 * Type for server RESPONSES (what comes back from the backend).
 * Form input types (LoginInput / RegisterInput) live in auth.ts,
 * since they're inferred from the validation schemas.
 *
 * login/register/me all just return the User — the access token travels
 * in an httpOnly cookie, never in a JSON body the frontend can read.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}
