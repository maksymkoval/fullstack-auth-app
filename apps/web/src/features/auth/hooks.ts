/**
 * React Query — manages "server state" (data that actually lives on the backend).
 *
 * The idea: instead of manually juggling useState + useEffect + loading + error
 * in every component, we describe a QUERY once as a hook, and React Query gives
 * us the cache, isLoading / isError states, deduping identical requests,
 * refetching and invalidation for free. The React Query cache becomes our
 * "source of truth" for the current user — so a separate AuthContext is no longer needed.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "./api";
import type { User } from "@fullstack-auth-app/shared";

// Cache keys collected in one place so we don't typo a string somewhere.
export const authKeys = {
  me: ["auth", "me"] as const,
};

/**
 * "Who am I?" — the main query. The access token is an httpOnly cookie, so
 * the frontend can't check for it before asking; it always fires, and a
 * missing/invalid cookie just comes back as a 401 (no user).
 */
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    retry: false, // no point retrying a 401
    staleTime: Infinity, // "who am I" data doesn't go stale on its own
  });
}

/** Login mutation. onSuccess puts the user straight into the cache — no extra refetch. */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user: User) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}

/** Register mutation — same logic as login. */
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (user: User) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}

/**
 * Logout: the cookie is httpOnly, so JS can't clear it directly — has to
 * ask the server to do it via Set-Cookie with an expired maxAge.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await authApi.logout();
    queryClient.clear();
    navigate("/login");
  };
}
