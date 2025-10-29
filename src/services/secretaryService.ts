/**
 * Secretary Service
 * Handles secretary management operations
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../constants';
import type { Secretary, Department } from '../models';

export interface SecretaryInfo {
  email: string;
  departments: Department[];
}

/**
 * Add a new secretary
 */
export const addSecretary = async (
  email: string,
  department: Department,
  createdBy: string
): Promise<void> => {
  try {
    // Check if already exists
    const secretaryDoc = await getDoc(doc(db, COLLECTIONS.SECRETARIES, email));
    if (secretaryDoc.exists()) {
      throw new Error('Secretary already exists');
    }

    // Check if is admin
    const adminDoc = await getDoc(doc(db, COLLECTIONS.ADMINS, email));
    if (adminDoc.exists()) {
      throw new Error('User is already an admin');
    }

    await setDoc(doc(db, COLLECTIONS.SECRETARIES, email), {
      email,
      departments: [department],
      role: 'secretary',
      createdBy,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding secretary:', error);
    throw error;
  }
};

/**
 * Remove a secretary
 */
export const removeSecretary = async (email: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.SECRETARIES, email));
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
      const data = doc.data() as Secretary;
      secretaries.push({
        email: data.email,
        departments: data.departments,
      });
    });

    return secretaries;
  } catch (error) {
    console.error('Error fetching secretaries:', error);
    throw error;
  }
};
