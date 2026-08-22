/**
 * App — routing. There's no auth provider here anymore:
 * user state now lives in the React Query cache (see main.tsx and hooks.ts),
 * and components read it through the useMe() hook.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DebugSentryPage } from './pages/DebugSentryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/debug-sentry" element={<DebugSentryPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
