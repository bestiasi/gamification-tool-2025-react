// Production Firestore maintenance: back up, wipe, and seed the first admin.
// Uses your own login from "npx firebase login", or a service-account key if GOOGLE_APPLICATION_CREDENTIALS is set:
//   node scripts/firestore-reset.mjs backup
//   node scripts/firestore-reset.mjs wipe --yes-delete-everything
//   node scripts/firestore-reset.mjs seed-admin first.admin@bestis.ro
//   node scripts/firestore-reset.mjs migrate backups/<file>.json            (report + converted copy only)
//   node scripts/firestore-reset.mjs migrate backups/<file>.json --write    (imports into an empty database)
// With FIRESTORE_EMULATOR_HOST set, every command targets the local emulator instead.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const PROJECT = process.env.FIRESTORE_EMULATOR_HOST ? 'demo-gt-2025' : 's2ws2w';

// The Admin SDK's Firestore only takes key files or application-default credentials, so the CLI login
// is handed over as a short-lived authorized_user file that is deleted when the script exits.
if (!process.env.FIRESTORE_EMULATOR_HOST && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const require = createRequire(import.meta.url);
  const account = require('firebase-tools/lib/auth').getGlobalDefaultAccount();
  const api = require('firebase-tools/lib/api');
  if (!account?.tokens?.refresh_token) throw new Error('Not signed in. Run "npx firebase login" first.');
  const file = join(tmpdir(), `gt-firestore-login-${process.pid}.json`);
  writeFileSync(file, JSON.stringify({
    type: 'authorized_user', client_id: api.clientId(), client_secret: api.clientSecret(),
    refresh_token: account.tokens.refresh_token, quota_project_id: PROJECT,
  }), { mode: 0o600 });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = file;
  process.on('exit', () => rmSync(file, { force: true }));
  console.log(`Using the Firebase CLI login of ${account.user.email}.`);
}
initializeApp(process.env.FIRESTORE_EMULATOR_HOST ? { projectId: PROJECT } : { credential: applicationDefault(), projectId: PROJECT });
const db = getFirestore();
const [command, argument] = process.argv.slice(2);

async function dump(parent) {
  const result = {};
  for (const collection of await parent.listCollections()) {
    result[collection.id] = {};
    for (const document of (await collection.get()).docs) {
      result[collection.id][document.id] = { data: document.data(), subcollections: await dump(document.ref) };
    }
  }
  return result;
}

async function backup() {
  const data = await dump(db);
  mkdirSync('backups', { recursive: true });
  const file = `backups/${PROJECT}-${new Date().toISOString().replaceAll(':', '-')}.json`;
  writeFileSync(file, JSON.stringify(data, null, 2));
  const counts = Object.entries(data).map(([name, documents]) => `${name}: ${Object.keys(documents).length}`);
  console.log(`Backed up ${PROJECT} to ${file}\n  ${counts.join('\n  ') || '(empty database)'}`);
}

async function wipe() {
  if (argument !== '--yes-delete-everything') {
    throw new Error('Refusing to wipe without --yes-delete-everything. Run "backup" first.');
  }
  const collections = await db.listCollections();
  for (const collection of collections) await db.recursiveDelete(collection);
  console.log(`Deleted ${collections.length} collections from ${PROJECT}: ${collections.map(c => c.id).join(', ')}`);
}

async function seedAdmin() {
  const email = argument?.trim().toLowerCase();
  if (!email || !/^[a-z0-9._%+-]+@bestis\.ro$/.test(email)) throw new Error('Usage: seed-admin name@bestis.ro');
  // The rules only let existing admins create admins, so the first GENERAL admin is seeded here.
  await db.doc(`admins/${email}`).set({ departments: ['GENERAL'] });
  console.log(`${email} is now a GENERAL admin in ${PROJECT}.`);
}

const DEPARTMENTS = ['HR', 'PR', 'IT', 'FR'];
const lower = value => String(value).trim().toLowerCase();
// Old requests stored the task text with a trailing " (N puncte)"; descriptions may contain brackets themselves.
const taskName = value => String(value ?? '').replace(/\s*\(\d+ puncte\)\s*$/, '').trim().toLowerCase();
const toTimestamp = value => value && typeof value._seconds === 'number' ? new Timestamp(value._seconds, value._nanoseconds ?? 0) : undefined;
const text = value => typeof value === 'string' && value.trim() ? value.trim() : undefined;
const defined = object => Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

// Converts a backup made before the single-source-of-truth schema into documents the new rules accept.
function convert(backup) {
  const notes = [];
  const out = { departmentTasks: {}, admins: {}, secretaries: {}, members: {}, pointRequests: {} };
  const tasks = Object.entries(backup.departmentTasks ?? {}).map(([id, { data }]) => ({ id, ...data }));
  for (const task of tasks) {
    const points = Number(task.points);
    const description = String(task.description ?? '').trim();
    if (!DEPARTMENTS.includes(task.department) || !Number.isInteger(points) || points < 1 || points > 1000 ||
      description.length < 3 || description.length > 200) {
      notes.push(`task ${task.id} dropped: invalid (${task.department}, ${points}, "${description}")`);
      continue;
    }
    out.departmentTasks[task.id] = { department: task.department, description, points };
  }
  for (const role of ['admins', 'secretaries']) {
    for (const [id, { data }] of Object.entries(backup[role] ?? {})) {
      const departments = [...new Set(data.departments ?? [])].filter(value => [...DEPARTMENTS, 'GENERAL'].includes(value));
      if (departments.length) out[role][lower(id)] = { departments };
      else notes.push(`${role}/${id} dropped: no valid departments`);
    }
  }
  const findTask = request => {
    const byId = out.departmentTasks[request.taskId] ? request.taskId : undefined;
    const byCode = tasks.find(task => task.taskId && task.taskId === request.taskId && out.departmentTasks[task.id])?.id;
    const byName = tasks.filter(task => out.departmentTasks[task.id] && task.department === request.department &&
      taskName(task.description) === taskName(request.task));
    return byId ?? byCode ?? (byName.length === 1 ? byName[0].id : undefined);
  };
  const latestName = new Map();
  for (const [id, { data }] of Object.entries(backup.pointRequests ?? {})) {
    const taskId = findTask(data);
    const rawCount = Number(data.taskNumber ?? 1);
    const taskNumber = Number.isInteger(rawCount) ? rawCount : Math.round(rawCount);
    if (taskNumber !== rawCount) notes.push(`request ${id}: repetitions ${data.taskNumber} rounded to ${taskNumber}`);
    let eventDate = data.eventDate;
    if (typeof eventDate === 'string' && /^\d{4}-\d{2}-$/.test(eventDate)) {
      eventDate = `${eventDate}01`;
      notes.push(`request ${id}: event date "${data.eventDate}" had no day, set to ${eventDate}`);
    }
    if (!taskId || !DEPARTMENTS.includes(data.department) || !Number.isInteger(taskNumber) || taskNumber < 1 ||
      typeof eventDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || !text(data.userEmail) || !toTimestamp(data.createdAt)) {
      notes.push(`request ${id} dropped: cannot convert (${data.status}, ${data.department}, "${data.task}")`);
      continue;
    }
    const userEmail = lower(data.userEmail);
    const createdAt = toTimestamp(data.createdAt);
    out.pointRequests[id] = defined({
      userEmail, department: data.department, taskId, taskNumber, eventDate,
      proofUrl: text(data.proofUrl), details: text(data.details), status: data.status, createdAt,
      reviewedBy: data.reviewedBy ? lower(data.reviewedBy) : undefined, reviewedAt: toTimestamp(data.reviewedAt),
      adminComment: text(data.adminComment),
      cancelledAt: data.status === 'cancelled' ? toTimestamp(data.cancelledAt) ?? createdAt : undefined,
    });
    const name = text(data.userName);
    if (name && (!latestName.has(userEmail) || latestName.get(userEmail).at < createdAt.toMillis())) {
      latestName.set(userEmail, { name: name.slice(0, 100), at: createdAt.toMillis() });
    }
  }
  for (const [email, { name }] of latestName) out.members[email] = { name };
  for (const collection of Object.keys(backup)) {
    if (!(collection in out)) notes.push(`collection ${collection} (${Object.keys(backup[collection]).length} docs) not imported`);
  }
  return { out, notes };
}

function scoreTotals(collections) {
  const totals = {};
  for (const request of Object.values(collections.pointRequests)) {
    if (request.status !== 'approved') continue;
    const points = collections.departmentTasks[request.taskId].points * request.taskNumber;
    totals[request.department] = (totals[request.department] ?? 0) + points;
  }
  return totals;
}

async function migrate() {
  if (!argument) throw new Error('Usage: migrate backups/<file>.json [--write]');
  const { out, notes } = convert(JSON.parse(readFileSync(argument, 'utf8')));
  console.log(`Converted: ${Object.entries(out).map(([name, docs]) => `${name} ${Object.keys(docs).length}`).join(', ')}`);
  console.log(`Approved points per department: ${JSON.stringify(scoreTotals(out))}`);
  console.log(notes.length ? `Notes:\n  ${notes.join('\n  ')}` : 'Notes: none');
  if (!process.argv.includes('--write')) {
    const file = argument.replace(/\.json$/, '.converted.json');
    writeFileSync(file, JSON.stringify(out, null, 2));
    console.log(`Dry run only. Converted copy: ${file}`);
    return;
  }
  if ((await db.listCollections()).length) throw new Error(`${PROJECT} is not empty. Run "wipe" first.`);
  const writer = db.bulkWriter();
  for (const [collection, docs] of Object.entries(out)) {
    for (const [id, data] of Object.entries(docs)) writer.create(db.doc(`${collection}/${id}`), data);
  }
  await writer.close();
  console.log(`Imported into ${PROJECT}.`);
}

const commands = { backup, wipe, 'seed-admin': seedAdmin, migrate };
if (!commands[command]) {
  console.error('Usage: node scripts/firestore-reset.mjs backup | wipe --yes-delete-everything | seed-admin <email> | migrate <backup.json> [--write]');
  process.exit(1);
}
await commands[command]();
