import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';

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
      <App />
      {/* Query debugging panel (dev mode only) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
