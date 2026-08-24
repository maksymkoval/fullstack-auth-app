/**
 * ProtectedRoute — only lets authenticated users through. Relies on React
 * Query: useMe() handles the request and the cache itself. The access
 * token is an httpOnly cookie, invisible to JS, so there's no client-side
 * check to short-circuit on — every mount just asks the backend:
 *   still loading                 → show a loading state
 *   request finished with no user (401) → to /login
 *   there's a user                → render the content
 */
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useMe } from '../features/auth/hooks';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return <p className="text-slate-500">Loading…</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
