import {
  collection, addDoc, doc, getDoc, getDocs, query, where,
  runTransaction, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { COLLECTIONS, DEPARTMENTS, VALIDATION } from '../constants';
import type { AdminTransfer, TransferFormData } from '../models';
import { generateToken } from '../utils';
import { parseDepartments } from '../utils/roles';
import { normalizeEmail } from './memberService';

const TTL_MS = VALIDATION.TRANSFER_EXPIRY_HOURS * 60 * 60 * 1000;

function currentEmail(): string {
  const email = auth.currentUser?.email;
  if (!email) throw new Error('Autentificarea este obligatorie.');
  return normalizeEmail(email);
}

function readTransfer(id: string, data: DocumentData): AdminTransfer {
  const department = DEPARTMENTS.find(value => value === data.department);
  const status = (['pending', 'accepted', 'rejected'] as const).find(value => value === data.status);
  if (!department || !status || typeof data.fromEmail !== 'string' ||
    typeof data.toEmail !== 'string' || typeof data.token !== 'string' || !(data.createdAt instanceof Timestamp)) {
    throw new Error('Cererea de transfer conține date invalide.');
  }
  const createdAt = data.createdAt.toDate();
  return {
    id, department, status, fromEmail: data.fromEmail, toEmail: data.toEmail, token: data.token,
    createdAt, expiresAt: new Date(createdAt.getTime() + TTL_MS),
  };
}

const isExpired = (transfer: AdminTransfer) => transfer.expiresAt.getTime() <= Date.now();

function validateRecipient(transfer: AdminTransfer, token?: string) {
  if (transfer.toEmail !== currentEmail()) throw new Error('Acest transfer este destinat altui cont.');
  if (token !== undefined && transfer.token !== token) throw new Error('Token-ul transferului este invalid.');
  if (transfer.status !== 'pending') throw new Error('Transferul nu mai este în așteptare.');
  if (isExpired(transfer)) throw new Error('Link-ul a expirat. Cere un link nou de la adminul curent.');
}

export async function createTransferRequest(
  fromEmail: string, formData: TransferFormData,
): Promise<{ transferId: string; token: string }> {
  const sender = normalizeEmail(fromEmail);
  const toEmail = normalizeEmail(formData.toEmail);
  if (sender !== currentEmail() || !toEmail.endsWith(VALIDATION.EMAIL_DOMAIN) ||
    toEmail === sender || !DEPARTMENTS.includes(formData.department)) {
    throw new Error('Destinatarul sau departamentul transferului este invalid.');
  }
  const token = generateToken();
  const reference = await addDoc(collection(db, COLLECTIONS.ADMIN_TRANSFERS), {
    fromEmail: sender, toEmail, department: formData.department, token, status: 'pending',
    createdAt: serverTimestamp(),
  });
  return { transferId: reference.id, token };
}

async function getTransfers(email: string, field: 'toEmail' | 'fromEmail'): Promise<AdminTransfer[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.ADMIN_TRANSFERS),
    where(field, '==', normalizeEmail(email)), where('status', '==', 'pending')));
  return snapshot.docs.map(document => readTransfer(document.id, document.data())).filter(transfer => !isExpired(transfer));
}

export const getIncomingTransfers = (email: string) => getTransfers(email, 'toEmail');
export const getPendingTransfers = (email: string) => getTransfers(email, 'fromEmail');

export async function getTransferById(id: string, token: string): Promise<AdminTransfer> {
  if (!id || id.includes('/') || !token) throw new Error('Link invalid - lipsește ID-ul sau token-ul.');
  const snapshot = await getDoc(doc(db, COLLECTIONS.ADMIN_TRANSFERS, id));
  if (!snapshot.exists()) throw new Error('Cererea de transfer nu a fost găsită.');
  const transfer = readTransfer(id, snapshot.data());
  validateRecipient(transfer, token);
  return transfer;
}

export async function acceptTransfer(id: string, token?: string): Promise<void> {
  const reference = doc(db, COLLECTIONS.ADMIN_TRANSFERS, id);
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error('Transferul nu mai există.');
    const transfer = readTransfer(id, snapshot.data());
    validateRecipient(transfer, token);
    const senderRef = doc(db, COLLECTIONS.ADMINS, transfer.fromEmail);
    const recipientRef = doc(db, COLLECTIONS.ADMINS, transfer.toEmail);
    const sender = await transaction.get(senderRef);
    const recipient = await transaction.get(recipientRef);
    if (!sender.exists()) throw new Error('Expeditorul nu mai este administrator.');
    const previousDepartments = parseDepartments(sender.data().departments);
    if (!previousDepartments.includes(transfer.department)) {
      throw new Error('Expeditorul nu mai deține departamentul transferat.');
    }
    if (previousDepartments.includes('GENERAL') && transfer.department !== 'GENERAL') {
      throw new Error('Rolul GENERAL se transferă integral, nu pe departamente separate.');
    }
    const recipientDepartments = recipient.exists() ? parseDepartments(recipient.data().departments) : [];
    const departments = [...new Set([...recipientDepartments, transfer.department])];
    if (recipient.exists()) transaction.update(recipientRef, { departments, acceptedTransferId: id });
    else transaction.set(recipientRef, { departments, acceptedTransferId: id });
    const remaining = previousDepartments.filter(department => department !== transfer.department);
    if (remaining.length) transaction.update(senderRef, { departments: remaining });
    else transaction.delete(senderRef);
    transaction.update(reference, { status: 'accepted' });
  });
}

export async function rejectTransfer(id: string, token?: string): Promise<void> {
  const reference = doc(db, COLLECTIONS.ADMIN_TRANSFERS, id);
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error('Transferul nu mai există.');
    validateRecipient(readTransfer(id, snapshot.data()), token);
    transaction.update(reference, { status: 'rejected' });
  });
}
