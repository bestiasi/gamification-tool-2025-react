import {
  doc, runTransaction, serverTimestamp,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { positiveInteger, taskTotal, validEventDate } from '../utils/scoring.ts';

export async function approvePointRequest(
  database: Firestore, requestId: string, reviewerEmail: string, comment = '',
): Promise<void> {
  if (!reviewerEmail) throw new Error('Autentificarea este obligatorie pentru aprobare.');
  const reference = doc(database, 'pointRequests', requestId);
  await runTransaction(database, async transaction => {
    const request = await transaction.get(reference);
    if (!request.exists() || request.data().status !== 'pending') {
      throw new Error('Cererea a fost deja revizuită sau anulată.');
    }
    const data = request.data();
    if (data.userEmail === reviewerEmail) {
      throw new Error('Propria cerere trebuie revizuită de alt responsabil al departamentului.');
    }
    if (typeof data.userEmail !== 'string' || !data.userEmail.trim()) {
      throw new Error('Identitatea utilizatorului necesită verificare manuală.');
    }
    if (typeof data.taskId !== 'string' || !data.taskId || data.taskId.includes('/')) {
      throw new Error('Cererea nu are un taskId valid. Nu se caută task-uri după denumire.');
    }
    const task = await transaction.get(doc(database, 'departmentTasks', data.taskId));
    if (!task.exists() || task.data().department !== data.department) {
      throw new Error('Task-ul cererii a fost șters sau modificat. Reîncarcă lista.');
    }
    if (typeof data.eventDate !== 'string' || !validEventDate(data.eventDate)) {
      throw new Error('Data evenimentului este invalidă; cererea necesită verificare.');
    }
    const count = positiveInteger(data.taskNumber, 'Numărul de repetări');
    if (typeof task.data().points !== 'number') throw new Error('Punctajul task-ului este invalid.');
    const basePoints = positiveInteger(task.data().points, 'Punctajul task-ului');
    taskTotal(basePoints, count);
    transaction.update(reference, {
      status: 'approved',
      reviewedBy: reviewerEmail,
      reviewedAt: serverTimestamp(),
      ...(comment.trim() ? { adminComment: comment.trim() } : {}),
    });
  });
}

export async function rejectPointRequest(
  database: Firestore, requestId: string, reviewerEmail: string, comment: string,
): Promise<void> {
  if (!reviewerEmail || !comment.trim()) throw new Error('Autentificarea și motivul respingerii sunt obligatorii.');
  await runTransaction(database, async transaction => {
    const reference = doc(database, 'pointRequests', requestId);
    const request = await transaction.get(reference);
    if (!request.exists() || request.data().status !== 'pending') {
      throw new Error('Cererea a fost deja revizuită sau anulată.');
    }
    if (request.data().userEmail === reviewerEmail) {
      throw new Error('Propria cerere trebuie revizuită de alt responsabil al departamentului.');
    }
    transaction.update(reference, {
      status: 'rejected',
      reviewedBy: reviewerEmail,
      reviewedAt: serverTimestamp(),
      adminComment: comment.trim(),
    });
  });
}
