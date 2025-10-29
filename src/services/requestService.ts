/**
 * Request Service
 * Handles point request operations
 */

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS, PAGINATION } from '../constants';
import type { PointRequest, RequestFormData, RequestStatus, Department } from '../models';
import { timestampToDate } from '../utils';

/**
 * Create a new point request
 */
export const createPointRequest = async (
  userId: string,
  userEmail: string,
  userName: string,
  formData: RequestFormData
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.POINT_REQUESTS), {
      userId,
      userEmail,
      userName,
      department: formData.department,
      task: formData.task,
      eventDate: formData.eventDate || null,
      proofUrl: formData.proofUrl || null,
      taskNumber: formData.taskNumber || null,
      details: formData.details || null,
      status: 'pending' as RequestStatus,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating point request:', error);
    throw error;
  }
};

/**
 * Get user's requests with pagination
 */
export const getUserRequests = async (
  userId: string,
  lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<{ requests: PointRequest[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean }> => {
  try {
    let q = query(
      collection(db, COLLECTIONS.POINT_REQUESTS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(PAGINATION.REQUESTS_PER_PAGE)
    );

    if (lastDoc) {
      q = query(
        collection(db, COLLECTIONS.POINT_REQUESTS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGINATION.REQUESTS_PER_PAGE)
      );
    }

    const snapshot = await getDocs(q);
    const requests: PointRequest[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        reviewedAt: data.reviewedAt ? timestampToDate(data.reviewedAt) : undefined,
      } as PointRequest);
    });

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    const hasMore = snapshot.docs.length === PAGINATION.REQUESTS_PER_PAGE;

    return { requests, lastDoc: newLastDoc, hasMore };
  } catch (error) {
    console.error('Error fetching user requests:', error);
    throw error;
  }
};

/**
 * Get requests by status for admin
 */
export const getRequestsByStatus = async (
  status: RequestStatus,
  department?: Department | 'all'
): Promise<PointRequest[]> => {
  try {
    let q = query(
      collection(db, COLLECTIONS.POINT_REQUESTS),
      where('status', '==', status)
    );

    if (department && department !== 'all') {
      q = query(
        collection(db, COLLECTIONS.POINT_REQUESTS),
        where('status', '==', status),
        where('department', '==', department)
      );
    }

    const snapshot = await getDocs(q);
    const requests: PointRequest[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        reviewedAt: data.reviewedAt ? timestampToDate(data.reviewedAt) : undefined,
      } as PointRequest);
    });

    // Sort client-side
    requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return requests;
  } catch (error) {
    console.error('Error fetching requests by status:', error);
    throw error;
  }
};

/**
 * Approve a request
 */
export const approveRequest = async (
  requestId: string,
  adminEmail: string,
  comment?: string
): Promise<void> => {
  try {
    const updateData: any = {
      status: 'approved',
      reviewedBy: adminEmail,
      reviewedAt: serverTimestamp(),
    };

    if (comment) {
      updateData.adminComment = comment;
    }

    await updateDoc(doc(db, COLLECTIONS.POINT_REQUESTS, requestId), updateData);
  } catch (error) {
    console.error('Error approving request:', error);
    throw error;
  }
};

/**
 * Reject a request
 */
export const rejectRequest = async (
  requestId: string,
  adminEmail: string,
  comment: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.POINT_REQUESTS, requestId), {
      status: 'rejected',
      reviewedBy: adminEmail,
      reviewedAt: serverTimestamp(),
      adminComment: comment,
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    throw error;
  }
};

/**
 * Cancel a request
 */
export const cancelRequest = async (requestId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.POINT_REQUESTS, requestId), {
      status: 'cancelled',
    });
  } catch (error) {
    console.error('Error cancelling request:', error);
    throw error;
  }
};

/**
 * Get approved requests for leaderboard
 */
export const getApprovedRequestsByDepartment = async (
  department: Department
): Promise<PointRequest[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.POINT_REQUESTS),
      where('department', '==', department),
      where('status', '==', 'approved')
    );

    const snapshot = await getDocs(q);
    const requests: PointRequest[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        reviewedAt: data.reviewedAt ? timestampToDate(data.reviewedAt) : undefined,
      } as PointRequest);
    });

    return requests;
  } catch (error) {
    console.error('Error fetching approved requests:', error);
    throw error;
  }
};
