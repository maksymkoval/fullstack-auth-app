/**
 * RegisterPage — the same idea as LoginPage, but with three fields and the
 * registerSchema. Notice how little code this is: RHF + Zod + React Query
 * remove almost all the manual boilerplate (field state, validation, loading, error handling).
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterInput } from './schemas';
import { useRegister } from './hooks';
import { ApiError } from '../../lib/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data, { onSuccess: () => navigate('/') });
  };

  const serverError =
    registerMutation.error instanceof ApiError
      ? registerMutation.error.message
      : null;

  const inputClass =
    'rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Register</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            autoComplete="name"
            {...register('name')}
            className={inputClass}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            className={inputClass}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">
            Password (min. 6 characters)
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className={inputClass}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {registerMutation.isPending ? 'Creating…' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
