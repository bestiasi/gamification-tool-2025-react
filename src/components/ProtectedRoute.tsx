import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { loginPath } from '../utils/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={loginPath(location.pathname + location.search + location.hash)} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
