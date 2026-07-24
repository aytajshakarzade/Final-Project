import { lazy, Suspense, useMemo, useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import createAppTheme from './theme/index';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ROUTES, getRoleBase } from './constants/routes';
import { STORAGE_KEYS } from './constants/storageKeys';
import SilentInterviewEngine from './features/silentInterview/SilentInterviewEngine';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';

// Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';

// Eager public pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Error pages (tiny, always needed)
import { NotFoundPage, UnauthorizedPage, ForbiddenPage } from './pages/errors/ErrorPages';

// Lazy-loaded pages — code-split per route
const RecruiterDashboard = lazy(() => import('./pages/dashboard/RecruiterDashboard'));
const CandidateDashboard = lazy(() => import('./pages/dashboard/CandidateDashboard'));
const JobsPage = lazy(() => import('./pages/jobs/JobsPage'));
const CandidatesPage = lazy(() => import('./pages/candidates/CandidatesPage'));
const CompaniesPage = lazy(() => import('./pages/companies/CompaniesPage'));
const RecruiterInterviews = lazy(() => import('./pages/recruiter/InterviewsPage'));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const RecruiterProfilePage = lazy(() => import('./pages/profile/RecruiterProfilePage'));
const AvailableInterviews = lazy(() => import('./pages/interviews/AvailableInterviewsPage'));
const LiveInterviewPage = lazy(() => import('./pages/interviews/LiveInterviewPage'));
const ResultPage = lazy(() => import('./pages/interviews/ResultPage'));
const ReportsPage = lazy(() => import('./pages/interviews/ReportsPage'));
const CandidateProfilePage = lazy(() => import('./pages/profile/CandidateProfilePage'));

// ─── Page loading fallback ────────────────────────────────────────────────────
function PageLoader() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <CircularProgress size={36} thickness={3} />
    </Box>
  );
}

// ─── "/" redirect — sends user to the right dashboard or login ────────────────
function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Navigate to={getRoleBase(user?.role)} replace />;
}

// ─── Settings wrappers (pass colorMode props) ─────────────────────────────────
const makeSettingsWrapper = (props) => () => <SettingsPage {...props} />;

// ─── Inner router — has access to AuthContext ─────────────────────────────────
function Router({ colorMode, toggleColorMode }) {
  const layoutProps = { colorMode, toggleColorMode };

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* Public / guest-only */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.LOGIN} element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path={ROUTES.REGISTER} element={<GuestRoute><RegisterPage /></GuestRoute>} />
        </Route>

        {/*  Landing Page */}
        <Route path={ROUTES.HOME} element={<SilentInterviewEngine />} />
        {/* ── Recruiter area ─────────────────────────────────── */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute roles={['RECRUITER', 'ADMIN']}>
              <AppLayout {...layoutProps} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={ROUTES.RECRUITER_DASHBOARD} replace />} />
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="interviews" element={<RecruiterInterviews />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage colorMode={colorMode} toggleColorMode={toggleColorMode} />} />
          <Route path="profile" element={<RecruiterProfilePage />} />
        </Route>

        {/* ── Candidate area ─────────────────────────────────── */}
        <Route
          path="/candidate"
          element={
            <ProtectedRoute roles={['CANDIDATE']}>
              <AppLayout {...layoutProps} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={ROUTES.CANDIDATE_INTERVIEWS} replace />} />
          <Route path="dashboard" element={<CandidateDashboard />} />
          <Route path="interviews" element={<AvailableInterviews />} />
          <Route path="interviews/:id" element={<LiveInterviewPage />} />
          <Route path="results" element={<ResultPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="profile" element={<CandidateProfilePage />} />
          <Route path="settings" element={<SettingsPage colorMode={colorMode} toggleColorMode={toggleColorMode} />} />
        </Route>

        {/* Error pages */}
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [colorMode, setColorMode] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEYS.theme) ?? 'light'; }
    catch { return 'light'; }
  });

  const toggleColorMode = useCallback(() => {
    setColorMode(m => {
      const next = m === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(STORAGE_KEYS.theme, next); } catch { }
      return next;
    });
  }, []);

  const theme = useMemo(() => createAppTheme(colorMode), [colorMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
        }}
      />
      <ErrorBoundary>
        <AuthProvider>
          <Router colorMode={colorMode} toggleColorMode={toggleColorMode} />
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
