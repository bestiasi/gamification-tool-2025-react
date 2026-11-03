import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, Timestamp,
  updateDoc, where, writeBatch, type Firestore,
} from 'firebase/firestore';
import { localDateString } from '../../src/utils/scoring';
import { academicYearStart } from '../../src/utils/requestCalendar';

const MEMBER = 'ana@bestis.ro';
const OTHER = 'bob@bestis.ro';
const IT_ADMIN = 'it.admin@bestis.ro';
const HR_ADMIN = 'hr.admin@bestis.ro';
const GENERAL_ADMIN = 'boss@bestis.ro';
const IT_SECRETARY = 'it.sec@bestis.ro';
const HOUR = 3_600_000;
const TODAY = localDateString(new Date());
const LAST_YEAR = `${Number(academicYearStart().slice(0, 4)) - 1}-10-15`;

let env: RulesTestEnvironment;

const as = (email: string, verified = true): Firestore =>
  env.authenticatedContext(email, { email, email_verified: verified }).firestore();

const seed = (write: (db: Firestore) => Promise<unknown>) =>
  env.withSecurityRulesDisabled(context => write(context.firestore()).then(() => undefined));

const validRequest = (overrides: Record<string, unknown> = {}) => ({
  userEmail: MEMBER, department: 'IT', taskId: 'it-task', taskNumber: 2, eventDate: TODAY,
  status: 'pending', createdAt: serverTimestamp(), ...overrides,
});

const review = (email: string, status: 'approved' | 'rejected', extra: Record<string, unknown> = {}) => ({
  status, reviewedBy: email, reviewedAt: serverTimestamp(),
  ...(status === 'rejected' ? { adminComment: 'Lipsă dovadă' } : {}), ...extra,
});

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-gt-2025',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});

afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await seed(async db => {
    await setDoc(doc(db, 'departmentTasks/it-task'), { department: 'IT', description: 'Workshop', points: 10 });
    await setDoc(doc(db, 'departmentTasks/hr-task'), { department: 'HR', description: 'Interviu', points: 5 });
    await setDoc(doc(db, `admins/${IT_ADMIN}`), { departments: ['IT'] });
    await setDoc(doc(db, `admins/${HR_ADMIN}`), { departments: ['HR'] });
    await setDoc(doc(db, `admins/${GENERAL_ADMIN}`), { departments: ['GENERAL'] });
    await setDoc(doc(db, `secretaries/${IT_SECRETARY}`), { departments: ['IT'] });
    await setDoc(doc(db, 'pointRequests/it-pending'), { ...validRequest(), createdAt: Timestamp.now() });
    await setDoc(doc(db, 'pointRequests/hr-pending'), {
      ...validRequest({ userEmail: OTHER, department: 'HR', taskId: 'hr-task' }), createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, 'pointRequests/it-approved'), {
      ...validRequest({ userEmail: OTHER, status: 'approved' }), createdAt: Timestamp.now(),
    });
  });
});

describe('who counts as a member', () => {
  it('requires a verified @bestis.ro email', async () => {
    await assertSucceeds(getDoc(doc(as(MEMBER), 'pointRequests/it-approved')));
    await assertFails(getDoc(doc(as(MEMBER, false), 'pointRequests/it-approved')));
    await assertFails(getDoc(doc(as('ana@gmail.com'), 'pointRequests/it-approved')));
    await assertFails(getDoc(doc(as('ana@bestisxro'), 'pointRequests/it-approved')));
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'pointRequests/it-approved')));
  });
});

describe('member profiles', () => {
  it('lets a member write only their own name', async () => {
    await assertSucceeds(setDoc(doc(as(MEMBER), `members/${MEMBER}`), { name: 'Ana Pop' }));
    await assertFails(setDoc(doc(as(MEMBER), `members/${OTHER}`), { name: 'Bob' }));
    await assertFails(setDoc(doc(as(MEMBER), `members/${MEMBER}`), { name: '  ' }));
    await assertFails(setDoc(doc(as(MEMBER), `members/${MEMBER}`), { name: 'Ana', role: 'admin' }));
    await assertSucceeds(getDoc(doc(as(OTHER), `members/${MEMBER}`)));
  });
});

describe('creating point requests', () => {
  it('lets a member submit a valid request, with optional proof and details', async () => {
    await assertSucceeds(setDoc(doc(as(MEMBER), 'pointRequests/new'), validRequest()));
    await assertSucceeds(setDoc(doc(as(MEMBER), 'pointRequests/new2'),
      validRequest({ proofUrl: 'https://drive.google.com/x', details: 'Am ținut workshopul' })));
  });

  it.each([
    ['too many repetitions', { taskNumber: 101 }],
    ['repetitions as text', { taskNumber: '2' }],
    ['a pre-approved status', { status: 'approved' }],
    ['someone else as owner', { userEmail: OTHER }],
    ['a task from another department', { taskId: 'hr-task' }],
    ['a GENERAL request', { department: 'GENERAL' }],
    ['an impossible date', { eventDate: '2026-02-30' }],
    ['a date from an earlier academic year', { eventDate: LAST_YEAR }],
    ['an empty optional field', { details: '' }],
    ['a script link as proof', { proofUrl: 'javascript:alert(1)' }],
    ['a data link as proof', { proofUrl: 'data:text/html,hi' }],
    ['a copied name', { userName: 'Ana' }],
    ['a copied uid', { userId: 'abc' }],
  ])('rejects %s', async (_label, overrides) => {
    await assertFails(setDoc(doc(as(MEMBER), 'pointRequests/new'), validRequest(overrides)));
  });
});

describe('reading point requests', () => {
  it('lets every member read approved requests for the leaderboard', async () => {
    await assertSucceeds(getDocs(query(collection(as(MEMBER), 'pointRequests'),
      where('department', '==', 'IT'), where('status', '==', 'approved'))));
  });

  it('keeps other members\' pending requests private', async () => {
    await assertFails(getDoc(doc(as(OTHER), 'pointRequests/it-pending')));
    await assertFails(getDocs(query(collection(as(OTHER), 'pointRequests'), where('status', '==', 'pending'))));
  });

  it('lets a member read their own requests by email', async () => {
    await assertSucceeds(getDoc(doc(as(MEMBER), 'pointRequests/it-pending')));
    await assertSucceeds(getDocs(query(collection(as(MEMBER), 'pointRequests'), where('userEmail', '==', MEMBER))));
  });

  it('limits a department admin to their own departments', async () => {
    await assertSucceeds(getDocs(query(collection(as(IT_ADMIN), 'pointRequests'),
      where('status', '==', 'pending'), where('department', 'in', ['IT']))));
    await assertFails(getDocs(query(collection(as(IT_ADMIN), 'pointRequests'), where('status', '==', 'pending'))));
    await assertFails(getDoc(doc(as(IT_ADMIN), 'pointRequests/hr-pending')));
  });

  it('lets a GENERAL admin read every pending request', async () => {
    await assertSucceeds(getDocs(query(collection(as(GENERAL_ADMIN), 'pointRequests'), where('status', '==', 'pending'))));
  });
});

describe('reviewing point requests', () => {
  it('lets the department admin approve without a comment and reject with one', async () => {
    await assertSucceeds(updateDoc(doc(as(IT_ADMIN), 'pointRequests/it-pending'), review(IT_ADMIN, 'approved')));
    await assertSucceeds(updateDoc(doc(as(HR_ADMIN), 'pointRequests/hr-pending'), review(HR_ADMIN, 'rejected')));
  });

  it('lets a secretary review when they hold no admin role', async () => {
    await assertSucceeds(updateDoc(doc(as(IT_SECRETARY), 'pointRequests/it-pending'), review(IT_SECRETARY, 'approved')));
  });

  it('blocks members, other departments and self-review', async () => {
    await assertFails(updateDoc(doc(as(OTHER), 'pointRequests/it-pending'), review(OTHER, 'approved')));
    await assertFails(updateDoc(doc(as(HR_ADMIN), 'pointRequests/it-pending'), review(HR_ADMIN, 'approved')));
    await seed(db => setDoc(doc(db, `admins/${MEMBER}`), { departments: ['IT'] }));
    await assertFails(updateDoc(doc(as(MEMBER), 'pointRequests/it-pending'), review(MEMBER, 'approved')));
  });

  it('blocks a forged reviewer, changed scores, empty comments and second reviews', async () => {
    await assertFails(updateDoc(doc(as(IT_ADMIN), 'pointRequests/it-pending'), review(HR_ADMIN, 'approved')));
    await assertFails(updateDoc(doc(as(IT_ADMIN), 'pointRequests/it-pending'), review(IT_ADMIN, 'approved', { taskNumber: 100 })));
    await assertFails(updateDoc(doc(as(IT_ADMIN), 'pointRequests/it-pending'), review(IT_ADMIN, 'rejected', { adminComment: ' ' })));
    await assertFails(updateDoc(doc(as(IT_ADMIN), 'pointRequests/it-approved'), review(IT_ADMIN, 'rejected')));
  });

  it('blocks reviewing a request from an earlier academic year', async () => {
    await seed(db => setDoc(doc(db, 'pointRequests/old-pending'), { ...validRequest({ eventDate: LAST_YEAR }), createdAt: Timestamp.now() }));
    await assertFails(updateDoc(doc(as(IT_ADMIN), 'pointRequests/old-pending'), review(IT_ADMIN, 'approved')));
    await assertFails(updateDoc(doc(as(IT_ADMIN), 'pointRequests/old-pending'), review(IT_ADMIN, 'rejected')));
  });

  it('lets only the owner cancel a pending request', async () => {
    const cancel = { status: 'cancelled', cancelledAt: serverTimestamp() };
    await assertFails(updateDoc(doc(as(OTHER), 'pointRequests/it-pending'), cancel));
    await assertFails(updateDoc(doc(as(MEMBER), 'pointRequests/it-pending'), { ...cancel, cancelledBy: MEMBER }));
    await assertSucceeds(updateDoc(doc(as(MEMBER), 'pointRequests/it-pending'), cancel));
  });
});

describe('tasks', () => {
  const task = (department: string, points: number, description = 'Task nou') => ({ department, description, points });

  it('lets a department admin manage tasks within the limits', async () => {
    await assertSucceeds(setDoc(doc(as(IT_ADMIN), 'departmentTasks/t'), task('IT', 1000)));
    await assertFails(setDoc(doc(as(IT_ADMIN), 'departmentTasks/t2'), task('IT', 1001)));
    await assertFails(setDoc(doc(as(IT_ADMIN), 'departmentTasks/t3'), task('IT', 10, 'ab')));
    await assertFails(setDoc(doc(as(IT_ADMIN), 'departmentTasks/t4'), { ...task('IT', 10), createdAt: serverTimestamp() }));
    await assertFails(setDoc(doc(as(GENERAL_ADMIN), 'departmentTasks/t5'), task('GENERAL', 10)));
  });

  it('blocks members and other departments', async () => {
    await assertFails(setDoc(doc(as(MEMBER), 'departmentTasks/t'), task('IT', 10)));
    await assertFails(setDoc(doc(as(IT_ADMIN), 'departmentTasks/t'), task('HR', 10)));
    await assertFails(updateDoc(doc(as(IT_ADMIN), 'departmentTasks/it-task'), { department: 'HR' }));
    await assertFails(deleteDoc(doc(as(HR_ADMIN), 'departmentTasks/it-task')));
  });
});

describe('roles', () => {
  it('blocks a member from granting themselves a role', async () => {
    await assertFails(setDoc(doc(as(MEMBER), `admins/${MEMBER}`), { departments: ['IT'] }));
    await assertFails(setDoc(doc(as(MEMBER), `secretaries/${MEMBER}`), { departments: ['IT'] }));
  });

  it('lets an admin appoint secretaries only in their departments, with no extra fields', async () => {
    await assertFails(setDoc(doc(as(IT_ADMIN), `secretaries/${OTHER}`), { departments: ['HR'] }));
    await assertFails(setDoc(doc(as(IT_ADMIN), `secretaries/${OTHER}`), { departments: ['IT'], email: OTHER }));
    await assertFails(setDoc(doc(as(IT_ADMIN), 'secretaries/Bob@bestis.ro'), { departments: ['IT'] }));
    await assertSucceeds(setDoc(doc(as(IT_ADMIN), `secretaries/${OTHER}`), { departments: ['IT'] }));
  });

  it('lets a GENERAL admin appoint department admins', async () => {
    await assertSucceeds(setDoc(doc(as(GENERAL_ADMIN), `admins/${OTHER}`), { departments: ['HR'] }));
    await assertFails(setDoc(doc(as(IT_ADMIN), `admins/${MEMBER}`), { departments: ['HR'] }));
    await assertFails(updateDoc(doc(as(IT_ADMIN), `admins/${OTHER}`), { departments: ['IT'] }));
  });
});

describe('admin transfers', () => {
  const transfer = (from: string, to: string) => ({
    fromEmail: from, toEmail: to, department: 'IT', token: 'secret-token-0123456789', status: 'pending',
    createdAt: serverTimestamp(),
  });

  const accept = (db: Firestore, id: string, to: string) => {
    const batch = writeBatch(db);
    batch.set(doc(db, `admins/${to}`), { departments: ['IT'], acceptedTransferId: id });
    batch.delete(doc(db, `admins/${IT_ADMIN}`));
    batch.update(doc(db, `adminTransfers/${id}`), { status: 'accepted' });
    return batch.commit();
  };

  const seedTransfer = (createdAt = Timestamp.now()) => seed(db =>
    setDoc(doc(db, 'adminTransfers/x'), { ...transfer(IT_ADMIN, OTHER), createdAt }));

  it('lets an admin offer only a department they hold, without a stored expiry', async () => {
    await assertSucceeds(setDoc(doc(as(IT_ADMIN), 'adminTransfers/a'), transfer(IT_ADMIN, OTHER)));
    await assertFails(setDoc(doc(as(IT_ADMIN), 'adminTransfers/b'),
      { ...transfer(IT_ADMIN, OTHER), expiresAt: Timestamp.fromMillis(Date.now() + HOUR) }));
    await assertFails(setDoc(doc(as(MEMBER), 'adminTransfers/c'), transfer(MEMBER, OTHER)));
    await assertFails(setDoc(doc(as(IT_ADMIN), 'adminTransfers/d'), transfer(HR_ADMIN, OTHER)));
  });

  it('moves the role atomically when the recipient accepts', async () => {
    await seedTransfer();
    await assertSucceeds(accept(as(OTHER), 'x', OTHER));
  });

  it('lets the recipient reject, and nobody else read or accept', async () => {
    await seedTransfer();
    await assertFails(accept(as(MEMBER), 'x', MEMBER));
    await assertFails(getDoc(doc(as(MEMBER), 'adminTransfers/x')));
    await assertSucceeds(updateDoc(doc(as(OTHER), 'adminTransfers/x'), { status: 'rejected' }));
  });

  it('expires 24 hours after the server creation time', async () => {
    await seedTransfer(Timestamp.fromMillis(Date.now() - 25 * HOUR));
    await assertFails(accept(as(OTHER), 'x', OTHER));
    await assertFails(updateDoc(doc(as(OTHER), 'adminTransfers/x'), { status: 'rejected' }));
  });
});
