/**
 * ProtectedRoute — only lets authenticated users through. Now relies on
 * React Query: useMe() handles the request and the cache itself. Logic:
 *   no token                  → straight to /login (don't even ask the backend)
 *   token exists, still loading → show a loading state
 *   request finished with no user → to /login (token is invalid)
 *   there's a user             → render the content
 */
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useMe } from '../features/auth/hooks';
import { tokenStorage } from '../lib/api';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const hasToken = !!tokenStorage.get();
  const { data: user, isLoading } = useMe();

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <p className="text-slate-500">Loading…</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
