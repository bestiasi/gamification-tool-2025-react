import { useAuth } from '../contexts/AuthContext';

export const useAdmin = () => {
  const context = useAuth();
  return { ...context, isAuthenticated: Boolean(context.user) };
};
