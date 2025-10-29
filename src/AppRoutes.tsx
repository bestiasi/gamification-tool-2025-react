import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Login from './pages/Login/Login';
import Welcome from './pages/Welcome/Welcome';
import Success from './pages/Success/Success';
import Admin from './pages/Admin';
import AdminTransfer from './pages/AdminTransfer';
import AdminSetup from './pages/AdminSetup';
import AcceptTransfer from './pages/AcceptTransfer';
import Requests from './pages/Requests';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';

// Import department pages
import HR from './pages/HR/index.tsx';
import IT from './pages/IT/index.tsx';
import PR from './pages/PR/index.tsx';
import FR from './pages/FR/index.tsx';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Header 
        logo="/icons/logo best.png"
        links={[
          { text: 'HR', url: '/hr' },
          { text: 'PR', url: '/pr' },
          { text: 'IT', url: '/it' },
          { text: 'FR', url: '/fr' },
          { text: 'REQUESTS', url: '/requests' },
          { text: 'ADMIN', url: '/admin' }
        ]}
      />
      
      <Routes>
        {!user ? (
          // Not logged in - show only login
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
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
            <Route path="/hr" element={
              <ProtectedRoute>
                <HR />
              </ProtectedRoute>
            } />
            <Route path="/it" element={
              <ProtectedRoute>
                <IT />
              </ProtectedRoute>
            } />
            <Route path="/pr" element={
              <ProtectedRoute>
                <PR />
              </ProtectedRoute>
            } />
            <Route path="/fr" element={
              <ProtectedRoute>
                <FR />
              </ProtectedRoute>
            } />
            <Route path="/requests" element={
              <ProtectedRoute>
                <Requests />
              </ProtectedRoute>
            } />
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
            <Route path="/login" element={<Navigate to="/welcome" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
      
      <Footer />
    </>
  );
}

export default AppRoutes;