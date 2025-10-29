/**
 * useAdmin Hook
 * Custom hook for admin functionality
 */

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { checkUserRole, type UserRoleInfo } from '../services';

export const useAdmin = () => {
  const [user] = useAuthState(auth);
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo>({
    isAuthenticated: false,
    role: null,
    isAdmin: false,
    isSecretary: false,
    departments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        const info = await checkUserRole(user.email);
        setRoleInfo(info);
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return {
    user,
    ...roleInfo,
    loading,
  };
};
