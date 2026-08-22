/**
 * Shown when Sentry's ErrorBoundary catches a render error — the fallback
 * for "the app has crashed", not a per-request error message.
 */
export function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-gray-500">
        The error has been reported. Try reloading the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Reload
      </button>
    </div>
  );
}
