import { base } from '@fullstack-auth-app/config/eslint';

export default [
  ...base,
  {
    rules: {
      // Nest decorators and Prisma payloads make `any` unavoidable in a few spots.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
