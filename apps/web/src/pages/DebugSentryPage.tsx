/**
 * TEMPORARY — verifies the Sentry wiring actually reports errors from the
 * deployed frontend. Remove once confirmed in the Sentry dashboard.
 */
export function DebugSentryPage(): never {
  throw new Error('Sentry test error (frontend) — safe to ignore');
}
