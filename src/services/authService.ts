import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS, VALIDATION } from '../constants';
import { normalizeEmail } from './memberService';
import type { Department, UserRole } from '../models';
import { parseDepartments, resolveRoles } from '../utils/roles';

export interface UserRoleInfo {
  isAuthenticated: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  isSecretary: boolean;
  departments: Department[];
}

export const checkUserRole = async (email: string): Promise<UserRoleInfo> => {
  if (!email) return { isAuthenticated: false, role: null, isAdmin: false, isSecretary: false, departments: [] };
  const [admin, secretary] = await Promise.all([
    getDoc(doc(db, COLLECTIONS.ADMINS, normalizeEmail(email))),
    getDoc(doc(db, COLLECTIONS.SECRETARIES, normalizeEmail(email))),
  ]);
  return {
    isAuthenticated: true,
    ...resolveRoles(admin.exists() ? admin.data() : null, secretary.exists() ? secretary.data() : null),
  };
};

export const isUserAdmin = async (email: string): Promise<boolean> => (await checkUserRole(email)).isAdmin;

export const hasAdminAccess = async (email: string): Promise<boolean> => {
  const role = await checkUserRole(email);
  return role.isAdmin || role.isSecretary;
};

export async function grantAdminRole(rawEmail: string, departments: Department[]): Promise<void> {
  const email = normalizeEmail(rawEmail);
  if (!email.endsWith(VALIDATION.EMAIL_DOMAIN) || !departments.length) {
    throw new Error('Emailul și departamentele administratorului sunt obligatorii.');
  }
  const reference = doc(db, COLLECTIONS.ADMINS, email);
  await runTransaction(db, async transaction => {
    const current = await transaction.get(reference);
    const previous = current.exists() ? parseDepartments(current.data().departments) : [];
    const assigned = [...new Set([...previous, ...departments])];
    if (current.exists()) transaction.update(reference, { departments: assigned });
    else transaction.set(reference, { departments: assigned });
  });
}
