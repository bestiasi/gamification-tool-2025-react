import { useAuth } from '../contexts/useAuth';

export const useAdmin = () => {
  const context = useAuth();
  return { ...context, isAuthenticated: Boolean(context.user) };
};
