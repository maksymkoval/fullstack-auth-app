/**
 * A thin HTTP client — the ONLY place in the frontend that knows about
 * fetch and the backend's base URL. Components never call fetch directly,
 * they go through this layer instead (the frontend's equivalent of a repository).
 *
 * The payoff: one way to attach the token, one way to handle errors,
 * and swapping in axios or adding logging means touching a single file.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const TOKEN_KEY = 'accessToken';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

/** An error carrying the API's message (so it can be shown to the user). */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = tokenStorage.get();

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Automatically attach the JWT, if there is one.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    // NestJS returns errors shaped like { message: string | string[] }
    const data = await response.json().catch(() => ({}));
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : (data.message ?? 'Something went wrong');
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}
