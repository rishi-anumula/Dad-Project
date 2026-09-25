import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard:
 *  1. Waits for the auth session to hydrate from storage (avoids false redirects).
 *  2. Unauthenticated users -> /login
 *  3. Feature "Login page -> Shop preferences": authenticated users who have
 *     not completed the Shop Preferences onboarding yet are routed to the
 *     OnboardingWizard (/onboarding) before they can reach the dashboard.
 */
export function AuthGuard({ children }) {
  const { isAuthenticated, shopProfile, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const needsOnboarding = shopProfile && !shopProfile.preferencesCompleted;
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
