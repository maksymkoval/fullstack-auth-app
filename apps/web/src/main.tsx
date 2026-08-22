import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as Sentry from '@sentry/react';
import App from './App';
import { ErrorFallback } from './components/ErrorFallback';
import './index.css';

const dsn = import.meta.env.VITE_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    // Ties events to the deployed commit, so a spike after a release
    // points straight at what shipped.
    release: import.meta.env.VITE_COMMIT_SHA,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
    beforeSend(event) {
      // The JWT never belongs in an error report.
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
      }
      return event;
    },
  });
}

// One QueryClient for the whole app — it holds the cache for every query.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // don't refetch every time the tab regains focus
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* The Provider makes the cache available to every component via hooks */}
    <QueryClientProvider client={queryClient}>
      <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
        <App />
      </Sentry.ErrorBoundary>
      {/* Query debugging panel (dev mode only) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
