import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export default function HomeRedirect() {
  const { isAdmin, isSecretary } = useAuth();
  return <Navigate to={isAdmin || isSecretary ? '/admin' : '/requests'} replace />;
}
