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
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS, PAGINATION, REQUEST_DEPARTMENTS, VALIDATION } from '../constants';
import type { Department, PointRequest, RequestFormData, RequestStatus } from '../models';
import { approvePointRequest, rejectPointRequest } from './requestReview';
import { normalizeEmail } from './memberService';
import { cappedInteger, validEventDate } from '../utils/scoring';
import { academicYearStart } from '../utils/requestCalendar';

const STATUSES: readonly RequestStatus[] = ['pending', 'approved', 'rejected', 'cancelled'];

function optionalDate(value: unknown): Date | undefined {
  return value instanceof Timestamp ? value.toDate() : undefined;
}

function optionalText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

// The only place request documents are decoded; malformed data fails loudly instead of being guessed.
export function readRequest(id: string, data: DocumentData): PointRequest {
  const department = REQUEST_DEPARTMENTS.find(value => value === data.department);
  const status = STATUSES.find(value => value === data.status);
  if (!department || !status || typeof data.userEmail !== 'string' || typeof data.taskId !== 'string' ||
    typeof data.eventDate !== 'string' || typeof data.taskNumber !== 'number' || !(data.createdAt instanceof Timestamp)) {
    throw new Error(`Cererea ${id} conține date invalide.`);
  }
  // A request still pending from an earlier academic year can no longer be reviewed, so it counts as cancelled.
  const stale = status === 'pending' && data.eventDate < academicYearStart();
  return {
    id, department, status: stale ? 'cancelled' : status,
    userEmail: data.userEmail, taskId: data.taskId, eventDate: data.eventDate, taskNumber: data.taskNumber,
    proofUrl: optionalText(data.proofUrl), details: optionalText(data.details),
    createdAt: data.createdAt.toDate(),
    reviewedBy: optionalText(data.reviewedBy), reviewedAt: optionalDate(data.reviewedAt),
    adminComment: optionalText(data.adminComment), cancelledAt: optionalDate(data.cancelledAt),
  };
}

export const createPointRequest = async (userEmail: string, formData: RequestFormData): Promise<string> => {
  if (!userEmail || !formData.taskId.trim()) throw new Error('Utilizatorul și task-ul sunt obligatorii.');
  if (!REQUEST_DEPARTMENTS.includes(formData.department)) {
    throw new Error('Selectează unul dintre departamentele FR, PR, HR sau IT.');
  }
  if (!validEventDate(formData.eventDate)) {
    throw new Error('Data evenimentului trebuie să fie o dată calendaristică validă.');
  }
  const proofUrl = formData.proofUrl?.trim();
  const details = formData.details?.trim();
  const docRef = await addDoc(collection(db, COLLECTIONS.POINT_REQUESTS), {
    userEmail: normalizeEmail(userEmail),
    department: formData.department,
    taskId: formData.taskId,
    eventDate: formData.eventDate,
    taskNumber: cappedInteger(formData.taskNumber, 'Numărul de repetări', VALIDATION.MAX_REPETITIONS),
    ...(proofUrl ? { proofUrl } : {}),
    ...(details ? { details } : {}),
    status: 'pending' satisfies RequestStatus,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getUserRequests = async (
  userEmail: string,
  lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<{ requests: PointRequest[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean }> => {
  const constraints = [
    where('userEmail', '==', normalizeEmail(userEmail)),
    orderBy('createdAt', 'desc'),
    ...(lastDoc ? [startAfter(lastDoc)] : []),
    limit(PAGINATION.REQUESTS_PER_PAGE),
  ];
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.POINT_REQUESTS), ...constraints));
  return {
    requests: snapshot.docs.map(document => readRequest(document.id, document.data())),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
    hasMore: snapshot.docs.length === PAGINATION.REQUESTS_PER_PAGE,
  };
};

/**
 * Get requests by status within the reviewer's departments
 */
export const getRequestsByStatus = async (
  status: RequestStatus,
  departments: readonly Department[]
): Promise<PointRequest[]> => {
  if (!departments.length) throw new Error('Nu ai departamente asignate pentru revizuire.');
  // Rules only allow reading other users' non-approved requests in reviewed departments.
  const filters = departments.includes('GENERAL')
    ? [where('status', '==', status)]
    : [where('status', '==', status), where('department', 'in', [...departments])];
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.POINT_REQUESTS), ...filters));
  return snapshot.docs
    .map(document => readRequest(document.id, document.data()))
    .filter(request => request.status === status)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const approveRequest = (requestId: string, reviewerEmail: string, comment?: string): Promise<void> =>
  approvePointRequest(db, requestId, normalizeEmail(reviewerEmail), comment);

export const rejectRequest = (requestId: string, reviewerEmail: string, comment: string): Promise<void> =>
  rejectPointRequest(db, requestId, normalizeEmail(reviewerEmail), comment);

export const cancelRequest = async (requestId: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.POINT_REQUESTS, requestId), {
    status: 'cancelled' satisfies RequestStatus,
    cancelledAt: serverTimestamp(),
  });
};
