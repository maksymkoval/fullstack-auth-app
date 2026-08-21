/**
 * DashboardPage — a protected page.
 * useMe()  → the current user (from the React Query cache, request already made).
 * useUsers() → the list of all users (React Query gives isLoading/isError for free).
 * No useState/useEffect at all — React Query owns all the server state.
 */
import { useMe, useLogout } from "../features/auth/hooks";
import { useUsers } from "../features/users/hooks";

export function DashboardPage() {
  const { data: user } = useMe();
  const { data: users, isLoading, isError, error } = useUsers();
  const logout = useLogout();

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          Hi, {user?.name}! 👋
        </h1>
        <button
          onClick={logout}
          className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
        >
          Log out
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">Signed in as {user?.email}</p>

      <h2 className="mt-6 mb-3 text-lg font-semibold text-slate-800">
        All users
      </h2>

      {isLoading && <p className="text-slate-500">Loading…</p>}
      {isError && (
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : "Failed to load"}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {users?.map((u) => (
          <li key={u.id} className="rounded-lg bg-slate-100 px-3 py-2 text-sm">
            <span className="font-semibold">{u.name}</span> — {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
