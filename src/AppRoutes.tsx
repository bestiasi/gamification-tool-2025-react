import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import Login from './Login/Login';
import Welcome from './Welcome/Welcome';
import Request from './Request/Request';
import Success from './Success/Success';
import Admin from './Admin';
import AdminTransfer from './AdminTransfer';
import AdminSetup from './AdminSetup';
import MyRequests from './MyRequests';
import ProtectedRoute from './components/ProtectedRoute';
import App from './App';

// Import department pages
import HR from './HR/index.tsx';
import IT from './IT/index.tsx';
import PR from './PR/index.tsx';
import FR from './FR/index.tsx';

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
          { text: 'REQUESTS', url: '/my-requests' },
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
                <App />
              </ProtectedRoute>
            } />
            <Route path="/welcome" element={
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            } />
            <Route path="/request" element={
              <ProtectedRoute>
                <Request />
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
            <Route path="/my-requests" element={
              <ProtectedRoute>
                <MyRequests />
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