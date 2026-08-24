import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export const base = tseslint.config(
  // *.timestamp-*.mjs: Vite writes these transiently while loading
  // vite.config.ts during a build, then deletes them — but if a build gets
  // interrupted, a stray one can be left on disk and linted by mistake.
  { ignores: ['dist', 'node_modules', '**/*.timestamp-*.mjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // A leading underscore is the conventional way to mark a destructured
      // var/arg as intentionally unused (e.g. omitting one key via rest
      // spread) — off by default, so without this the rule flags it anyway.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);

export const reactConfig = tseslint.config({
  plugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
});

export default base;
