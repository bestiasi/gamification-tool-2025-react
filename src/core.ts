/**
 * Core Library Export
 * Import everything you need from one place
 */

// Models & Types
export * from './models';

// Services
export * from './services';

// Custom Hooks
export * from './hooks';

// Utilities
export * from './utils';

// Constants (re-export specific items to avoid conflicts)
export {
  COLLECTIONS,
  DEPARTMENT_NAMES,
  VALIDATION,
  PAGINATION,
  STATUS_LABELS,
  STATUS_ICONS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './constants';

// Example usage:
// import { useAdmin, COLLECTIONS, formatDate, type PointRequest } from './core';
