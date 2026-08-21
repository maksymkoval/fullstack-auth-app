/**
 * LoginPage — a form built with React Hook Form + Zod, data via React Query.
 *
 * RHF manages field state and submission (no pile of useState).
 * zodResolver plugs our Zod schema in as the validator: errors show up
 * in formState.errors automatically. The actual request is the useLogin() mutation.
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginInput } from './schemas';
import { useLogin } from './hooks';
import { ApiError } from '../../lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // handleSubmit validates via Zod itself and only calls onSubmit with valid data.
  const onSubmit = (data: LoginInput) => {
    login.mutate(data, { onSuccess: () => navigate('/') });
  };

  const serverError =
    login.error instanceof ApiError ? login.error.message : null;

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Log in</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={login.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {login.isPending ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-indigo-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
