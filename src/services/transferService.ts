/**
 * Transfer Service
 * Handles admin role transfer operations
 */

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS, VALIDATION } from '../constants';
import type { AdminTransfer, TransferFormData, Department } from '../models';
import { timestampToDate, generateToken, addHours, isDateExpired } from '../utils';

/**
 * Create a transfer request
 */
export const createTransferRequest = async (
  fromEmail: string,
  formData: TransferFormData
): Promise<{ transferId: string; token: string }> => {
  try {
    const token = generateToken();
    const expiresAt = addHours(new Date(), VALIDATION.TRANSFER_EXPIRY_HOURS);

    const docRef = await addDoc(collection(db, COLLECTIONS.ADMIN_TRANSFERS), {
      fromEmail,
      toEmail: formData.toEmail.trim().toLowerCase(),
      department: formData.department,
      token,
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt,
    });

    return { transferId: docRef.id, token };
  } catch (error) {
    console.error('Error creating transfer request:', error);
    throw error;
  }
};

/**
 * Get incoming transfers for a user
 */
export const getIncomingTransfers = async (email: string): Promise<AdminTransfer[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ADMIN_TRANSFERS),
      where('toEmail', '==', email),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    const transfers: AdminTransfer[] = [];

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const expiresAt = timestampToDate(data.expiresAt);

      // Check if expired
      if (isDateExpired(expiresAt)) {
        await updateDoc(docSnapshot.ref, { status: 'expired' });
        continue;
      }

      transfers.push({
        id: docSnapshot.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        expiresAt,
        acceptedAt: data.acceptedAt ? timestampToDate(data.acceptedAt) : undefined,
        rejectedAt: data.rejectedAt ? timestampToDate(data.rejectedAt) : undefined,
      } as AdminTransfer);
    }

    return transfers;
  } catch (error) {
    console.error('Error fetching incoming transfers:', error);
    throw error;
  }
};

/**
 * Get pending transfers sent by a user
 */
export const getPendingTransfers = async (email: string): Promise<AdminTransfer[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ADMIN_TRANSFERS),
      where('fromEmail', '==', email),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    const transfers: AdminTransfer[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      transfers.push({
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        expiresAt: timestampToDate(data.expiresAt),
      } as AdminTransfer);
    });

    return transfers;
  } catch (error) {
    console.error('Error fetching pending transfers:', error);
    throw error;
  }
};

/**
 * Get transfer by ID and validate token
 */
export const getTransferById = async (
  transferId: string,
  token: string
): Promise<AdminTransfer | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.ADMIN_TRANSFERS, transferId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();

    // Validate token
    if (data.token !== token) {
      return null;
    }

    return {
      id: docSnap.id,
      ...data,
      createdAt: timestampToDate(data.createdAt),
      expiresAt: timestampToDate(data.expiresAt),
      acceptedAt: data.acceptedAt ? timestampToDate(data.acceptedAt) : undefined,
      rejectedAt: data.rejectedAt ? timestampToDate(data.rejectedAt) : undefined,
    } as AdminTransfer;
  } catch (error) {
    console.error('Error fetching transfer:', error);
    throw error;
  }
};

/**
 * Accept a transfer request
 */
export const acceptTransfer = async (
  transferId: string,
  transfer: AdminTransfer
): Promise<void> => {
  try {
    // Check if expired
    if (isDateExpired(transfer.expiresAt)) {
      await updateDoc(doc(db, COLLECTIONS.ADMIN_TRANSFERS, transferId), {
        status: 'expired',
      });
      throw new Error('Transfer expired');
    }

    // Add new admin permissions
    const newAdminRef = doc(db, COLLECTIONS.ADMINS, transfer.toEmail);
    const newAdminDoc = await getDoc(newAdminRef);

    if (newAdminDoc.exists()) {
      const existingDepts = newAdminDoc.data().departments || [];
      if (!existingDepts.includes(transfer.department)) {
        existingDepts.push(transfer.department);
      }
      await updateDoc(newAdminRef, {
        departments: existingDepts,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(newAdminRef, {
        email: transfer.toEmail,
        role: 'admin',
        departments: [transfer.department],
        createdAt: serverTimestamp(),
      });
    }

    // Remove department from old admin
    const oldAdminRef = doc(db, COLLECTIONS.ADMINS, transfer.fromEmail);
    const oldAdminDoc = await getDoc(oldAdminRef);

    if (oldAdminDoc.exists()) {
      const depts = oldAdminDoc.data().departments || [];
      const updatedDepts = depts.filter((d: Department) => d !== transfer.department);

      await updateDoc(oldAdminRef, {
        departments: updatedDepts,
        updatedAt: serverTimestamp(),
      });
    }

    // Mark transfer as accepted
    await updateDoc(doc(db, COLLECTIONS.ADMIN_TRANSFERS, transferId), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error accepting transfer:', error);
    throw error;
  }
};

/**
 * Reject a transfer request
 */
export const rejectTransfer = async (
  transferId: string,
  rejectedBy: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.ADMIN_TRANSFERS, transferId), {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      rejectedBy,
    });
  } catch (error) {
    console.error('Error rejecting transfer:', error);
    throw error;
  }
};
