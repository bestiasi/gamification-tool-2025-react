import { createContext, useContext } from 'react';
import type { User } from 'firebase/auth';
import type { Department, UserRole } from '../models';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole | null;
  departments: Department[];
  isAdmin: boolean;
  isSecretary: boolean;
  roleError: string;
  retryRoles: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
