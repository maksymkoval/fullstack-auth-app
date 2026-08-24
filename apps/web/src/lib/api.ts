/**
 * A thin HTTP client — the ONLY place in the frontend that knows about
 * fetch and the backend's base URL. Components never call fetch directly,
 * they go through this layer instead (the frontend's equivalent of a repository).
 *
 * The payoff: one place to handle errors and credentials, and swapping in
 * axios or adding logging means touching a single file.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

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
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // The access token lives in an httpOnly cookie now — JS never sees it,
    // so there's nothing to attach manually. `include` is what makes the
    // browser send that cookie on a cross-origin request in the first place.
    credentials: 'include',
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
