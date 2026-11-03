/**
 * Secretary Service
 * Handles secretary management operations
 */

import {
  collection,
  doc,
  getDocs,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS, VALIDATION } from '../constants';
import { normalizeEmail } from './memberService';
import type { Department } from '../models';
import { hasDepartmentAccess, parseDepartments } from '../utils/roles';

export interface SecretaryInfo {
  email: string;
  departments: Department[];
}

/**
 * Add a new secretary
 */
export const addSecretary = async (rawEmail: string, department: Department): Promise<void> => {
  const email = normalizeEmail(rawEmail);
  if (!email.endsWith(VALIDATION.EMAIL_DOMAIN)) throw new Error('Emailul trebuie să fie @bestis.ro.');
  try {
    const reference = doc(db, COLLECTIONS.SECRETARIES, email);
    await runTransaction(db, async transaction => {
      const current = await transaction.get(reference);
      const admin = await transaction.get(doc(db, COLLECTIONS.ADMINS, email));
      if (admin.exists() && parseDepartments(admin.data().departments).length) {
        throw new Error('Acest email este deja administrator.');
      }
      const previous = current.exists() ? parseDepartments(current.data().departments) : [];
      if (previous.includes(department)) throw new Error('Secretarul are deja acces la acest departament.');
      if (current.exists()) transaction.update(reference, { departments: [...previous, department] });
      else transaction.set(reference, { departments: [department] });
    });
  } catch (error) {
    console.error('Error adding secretary:', error);
    throw error;
  }
};

/**
 * Remove a secretary
 */
export const removeSecretary = async (email: string, managedDepartments: readonly Department[]): Promise<void> => {
  try {
    const reference = doc(db, COLLECTIONS.SECRETARIES, email);
    await runTransaction(db, async transaction => {
      const current = await transaction.get(reference);
      if (!current.exists()) throw new Error('Secretarul nu mai există.');
      const assigned = parseDepartments(current.data().departments);
      const remaining = assigned.filter(department => !hasDepartmentAccess(managedDepartments, department));
      if (remaining.length === assigned.length) throw new Error('Nu administrezi departamentele acestui secretar.');
      if (remaining.length) transaction.update(reference, { departments: remaining });
      else transaction.delete(reference);
    });
  } catch (error) {
    console.error('Error removing secretary:', error);
    throw error;
  }
};

/**
 * Get all secretaries
 */
export const getAllSecretaries = async (): Promise<SecretaryInfo[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.SECRETARIES));
    const secretaries: SecretaryInfo[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      secretaries.push({
        email: doc.id,
        departments: parseDepartments(data.departments),
      });
    });

    return secretaries;
  } catch (error) {
    console.error('Error fetching secretaries:', error);
    throw error;
  }
};
