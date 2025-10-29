/**
 * Authentication Service
 * Handles user authentication and role management
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../constants';
import type { Admin, Secretary, UserRole } from '../models';

export interface UserRoleInfo {
  isAuthenticated: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  isSecretary: boolean;
  departments: string[];
}

/**
 * Check if user has admin or secretary role
 */
export const checkUserRole = async (email: string): Promise<UserRoleInfo> => {
  if (!email) {
    return {
      isAuthenticated: false,
      role: null,
      isAdmin: false,
      isSecretary: false,
      departments: [],
    };
  }

  try {
    // Check if user is admin
    const adminDoc = await getDoc(doc(db, COLLECTIONS.ADMINS, email));
    if (adminDoc.exists()) {
      const adminData = adminDoc.data() as Admin;
      return {
        isAuthenticated: true,
        role: 'admin',
        isAdmin: true,
        isSecretary: false,
        departments: adminData.departments || [],
      };
    }

    // Check if user is secretary
    const secretaryDoc = await getDoc(doc(db, COLLECTIONS.SECRETARIES, email));
    if (secretaryDoc.exists()) {
      const secretaryData = secretaryDoc.data() as Secretary;
      return {
        isAuthenticated: true,
        role: 'secretary',
        isAdmin: false,
        isSecretary: true,
        departments: secretaryData.departments || [],
      };
    }

    // Regular user
    return {
      isAuthenticated: true,
      role: 'user',
      isAdmin: false,
      isSecretary: false,
      departments: [],
    };
  } catch (error) {
    console.error('Error checking user role:', error);
    return {
      isAuthenticated: false,
      role: null,
      isAdmin: false,
      isSecretary: false,
      departments: [],
    };
  }
};

/**
 * Check if user is admin
 */
export const isUserAdmin = async (email: string): Promise<boolean> => {
  const roleInfo = await checkUserRole(email);
  return roleInfo.isAdmin;
};

/**
 * Check if user has access to admin panel (admin or secretary)
 */
export const hasAdminAccess = async (email: string): Promise<boolean> => {
  const roleInfo = await checkUserRole(email);
  return roleInfo.isAdmin || roleInfo.isSecretary;
};
