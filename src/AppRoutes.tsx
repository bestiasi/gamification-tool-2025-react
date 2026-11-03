import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/useAuth';
import Header from './layout/Header';
import Footer from './layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';
import PageErrorBoundary from './components/PageErrorBoundary';
import { departmentPages } from './constants/departments';
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

function AppRoutes() {
  const { user, roleError, retryRoles } = useAuth();
  const location = useLocation();

  return (
    <>
      <Header 
        logo="/icons/logo best.png"
        links={[
          ...departmentPages.map(({ department, path }) => ({ text: department, url: path })),
          { text: 'REQUESTS', url: '/requests' },
          { text: 'ADMIN', url: '/admin' }
        ]}
      />
      
      <PageErrorBoundary>
      <Suspense fallback={<main role="status" style={{ padding: 40, textAlign: 'center' }}>Se încarcă pagina...</main>}>
      {roleError ? (
        <main className={ui.page} role="alert">
          <p>Permisiunile nu au putut fi încărcate: {roleError}</p>
          <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={retryRoles}>Reîncearcă</button>
        </main>
      ) : <Routes>
        {!user ? (
          // Not logged in - show only login
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to={loginPath(location.pathname + location.search + location.hash)} replace />} />
          </>
        ) : (
          // Logged in - show all pages
          <>
            <Route path="/" element={
              <ProtectedRoute>
                <HomeRedirect />
              </ProtectedRoute>
            } />
            <Route path="/welcome" element={
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            } />
            <Route path="/success" element={
              <ProtectedRoute>
                <Success />
              </ProtectedRoute>
            } />
            {departmentPages.map(({ department, path }) => (
              <Route key={path} path={path} element={
                <ProtectedRoute>
                  <DepartmentPage key={department} department={department} />
                </ProtectedRoute>
              } />
            ))}
            <Route path="/requests" element={
              <ProtectedRoute>
                <Requests key={user.uid} />
              </ProtectedRoute>
            } />
            <Route path="/my-requests" element={<Navigate to="/requests" replace />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/admin/transfer" element={
              <ProtectedRoute>
                <AdminTransfer />
              </ProtectedRoute>
            } />
            <Route path="/accept-transfer" element={
              <ProtectedRoute>
                <AcceptTransfer />
              </ProtectedRoute>
            } />
            <Route path="/admin/setup" element={
              <ProtectedRoute>
                <AdminSetup />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Navigate to={loginDestination(location.search)} replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>}
      </Suspense>
      </PageErrorBoundary>
      
      <Footer />
    </>
  );
}

export default AppRoutes;