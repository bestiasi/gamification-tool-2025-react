/**
 * Application Constants
 * Centralized configuration and magic strings
 */

import type { Department } from '../models';

// ==================== FIREBASE COLLECTIONS ====================
export const COLLECTIONS = {
  POINT_REQUESTS: 'pointRequests',
  MEMBERS: 'members',
  ADMINS: 'admins',
  SECRETARIES: 'secretaries',
  DEPARTMENT_TASKS: 'departmentTasks',
  ADMIN_TRANSFERS: 'adminTransfers',
} as const;

// ==================== DEPARTMENTS ====================
export { DEPARTMENTS, REQUEST_DEPARTMENTS } from './departments.ts';

export const DEPARTMENT_NAMES: Record<Department, string> = {
  HR: 'Human Resources',
  PR: 'Public Relations',
  IT: 'Information Technology',
  FR: 'Fundraising',
  GENERAL: 'General',
};

// ==================== VALIDATION ====================
export const VALIDATION = {
  EMAIL_DOMAIN: '@bestis.ro',
  MIN_POINTS: 1,
  MAX_POINTS: 1000,
  MAX_REPETITIONS: 100,
  MIN_TASK_LENGTH: 3,
  MAX_TASK_LENGTH: 200,
  TRANSFER_EXPIRY_HOURS: 24,
} as const;

// ==================== PAGINATION ====================
export const PAGINATION = {
  REQUESTS_PER_PAGE: 15,
  TASKS_PER_PAGE: 20,
} as const;

// ==================== STATUS LABELS ====================
export const STATUS_LABELS = {
  pending: 'În așteptare',
  approved: 'Aprobate',
  rejected: 'Respinse',
  cancelled: 'Anulate',
} as const;

export const STATUS_ICONS = {
  pending: '⏳',
  approved: '✅',
  rejected: '❌',
  cancelled: '🚫',
} as const;

// ==================== ROUTES ====================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REQUEST: '/request',
  MY_REQUESTS: '/requests',
  SUCCESS: '/success',
  ADMIN: '/admin',
  ADMIN_SETUP: '/admin-setup',
  ADMIN_TRANSFER: '/admin-transfer',
  ACCEPT_TRANSFER: '/accept-transfer',
  HR: '/hr',
  PR: '/pr',
  IT: '/it',
  FR: '/fr',
} as const;

// ==================== ERROR MESSAGES ====================
export const ERROR_MESSAGES = {
  AUTH: {
    NOT_AUTHENTICATED: 'Nu ești autentificat!',
    NO_PERMISSION: 'Nu ai permisiuni de administrator.',
    INVALID_EMAIL: 'Email invalid',
    INVALID_DOMAIN: `Emailul trebuie să fie ${VALIDATION.EMAIL_DOMAIN}`,
  },
  REQUEST: {
    MISSING_FIELDS: 'Te rog completează toate câmpurile obligatorii!',
    SUBMIT_ERROR: 'Eroare la trimiterea cererii. Te rog încearcă din nou.',
    FETCH_ERROR: 'Eroare la încărcarea cererilor.',
  },
  TASK: {
    NO_TASKS: 'Nu există task-uri disponibile.',
    FETCH_ERROR: 'Eroare la încărcarea task-urilor.',
    CREATE_ERROR: 'Eroare la crearea task-ului.',
    UPDATE_ERROR: 'Eroare la actualizarea task-ului.',
    DELETE_ERROR: 'Eroare la ștergerea task-ului.',
  },
  TRANSFER: {
    SELF_TRANSFER: 'Nu poți transfera către tine însuți',
    EXPIRED: 'Cererea a expirat.',
    INVALID_TOKEN: 'Token invalid',
    ACCEPT_ERROR: 'Eroare la acceptarea cererii',
    REJECT_ERROR: 'Eroare la refuzarea cererii',
  },
} as const;

// ==================== SUCCESS MESSAGES ====================
export const SUCCESS_MESSAGES = {
  REQUEST: {
    CREATED: '✅ Cerere trimisă cu succes!',
    APPROVED: '✅ Cerere aprobată!',
    REJECTED: '❌ Cerere respinsă!',
  },
  TASK: {
    CREATED: '✅ Task adăugat cu succes!',
    UPDATED: '✅ Task actualizat cu succes!',
    DELETED: '✅ Task șters cu succes!',
  },
  TRANSFER: {
    CREATED: '✅ Link de transfer generat cu succes!',
    ACCEPTED: '✅ Ai devenit admin pentru departament!',
    REJECTED: '❌ Transfer refuzat!',
  },
  SECRETARY: {
    ADDED: '✅ Secretar adăugat cu succes!',
    REMOVED: '✅ Acces șters!',
  },
} as const;
