import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/useAuth';
import Header from './layout/Header';
import Footer from './layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';
import PageErrorBoundary from './components/PageErrorBoundary';
import { leaderboardPages } from './constants/departments';
import { loginDestination, loginPath } from './utils/navigation';
import ui from './styles/ui.module.css';

// Keep unscoped legacy styles in their original order while route code loads on demand.
import './pages/Login/Login.css';
import './pages/Welcome/Welcome.css';
import './pages/Success/Success.css';
import './pages/Admin/Admin.css';
import './pages/AdminTransfer/AdminTransfer.css';
import './pages/AdminSetup/AdminSetup.css';
import './pages/AcceptTransfer/AcceptTransfer.css';
import './App.css';

const Login = lazy(() => import('./pages/Login/Login'));
const Welcome = lazy(() => import('./pages/Welcome/Welcome'));
const Success = lazy(() => import('./pages/Success/Success'));
const Admin = lazy(() => import('./pages/Admin/Admin'));
const AdminTransfer = lazy(() => import('./pages/AdminTransfer/AdminTransfer'));
const AdminSetup = lazy(() => import('./pages/AdminSetup/AdminSetup'));
const AcceptTransfer = lazy(() => import('./pages/AcceptTransfer/AcceptTransfer'));
const Requests = lazy(() => import('./pages/Requests/Requests'));
const DepartmentPage = lazy(() => import('./pages/Department/DepartmentPage'));

function RoleLoadError() {
  const { roleError, retryRoles } = useAuth();
  return (
    <main className={ui.page} role="alert">
      <p>Permisiunile nu au putut fi încărcate: {roleError}</p>
      <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={retryRoles}>Reîncearcă</button>
    </main>
  );
}

function SignedOutRoutes() {
  const location = useLocation();
  const destination = location.pathname + location.search + location.hash;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to={loginPath(destination)} replace />} />
    </Routes>
  );
}

function SignedInRoutes({ userId }: { userId: string }) {
  const location = useLocation();
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/success" element={<Success />} />
        {leaderboardPages.map(({ department, path }) => (
          <Route key={path} path={path} element={<DepartmentPage key={department} department={department} />} />
        ))}
        <Route path="/requests" element={<Requests key={userId} />} />
        <Route path="/my-requests" element={<Navigate to="/requests" replace />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/transfer" element={<AdminTransfer />} />
        <Route path="/accept-transfer" element={<AcceptTransfer />} />
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/login" element={<Navigate to={loginDestination(location.search)} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProtectedRoute>
  );
}

function RouteContent() {
  const { user, roleError } = useAuth();
  if (roleError) return <RoleLoadError />;
  if (!user) return <SignedOutRoutes />;
  return <SignedInRoutes userId={user.uid} />;
}

function AppRoutes() {
  return (
    <>
      <Header
        logo="/icons/logo best.png"
        links={[
          ...leaderboardPages.map(({ department, path }) => ({ text: department, url: path })),
          { text: 'REQUESTS', url: '/requests' },
          { text: 'ADMIN', url: '/admin' }
        ]}
      />
      <PageErrorBoundary>
        <Suspense fallback={<main role="status" style={{ padding: 40, textAlign: 'center' }}>Se încarcă pagina...</main>}>
          <RouteContent />
        </Suspense>
      </PageErrorBoundary>
      <Footer />
    </>
  );
}

export default AppRoutes;