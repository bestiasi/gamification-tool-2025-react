/**
 * Central Models/Types Export
 * All TypeScript interfaces and types for the application
 */

// ==================== USER & AUTH ====================
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export type UserRole = 'admin' | 'secretary' | 'user';

// ==================== DEPARTMENTS ====================
export type Department = 'HR' | 'PR' | 'IT' | 'FR' | 'GENERAL';

export type RequestDepartment = Exclude<Department, 'GENERAL'>;

// ==================== TASKS ====================
export interface DepartmentTask {
  id: string;
  department: Department;
  description: string;
  points: number;
}

// ==================== POINT REQUESTS ====================
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// userEmail is the owner's lowercased email; their display name lives in members/{email}.
export interface PointRequest {
  id: string;
  userEmail: string;
  department: RequestDepartment;
  taskId: string;
  eventDate: string;
  taskNumber: number;
  proofUrl?: string;
  details?: string;
  status: RequestStatus;
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  adminComment?: string;
  cancelledAt?: Date;
}

// ==================== TRANSFERS ====================
export type TransferStatus = 'pending' | 'accepted' | 'rejected';

export interface AdminTransfer {
  id: string;
  fromEmail: string;
  toEmail: string;
  department: Department;
  token: string;
  status: TransferStatus;
  createdAt: Date;
  /** Derived: createdAt + VALIDATION.TRANSFER_EXPIRY_HOURS. Never stored. */
  expiresAt: Date;
}

// ==================== LEADERBOARD ====================
export interface UserPoints {
  name: string;
  email: string;
  totalPoints: number;
  tasks: TaskSummary[];
}

export interface TaskSummary {
  taskId: string;
  task: string;
  points: number;
  count: number;
  basePoints: number;
}

// ==================== UI STATE ====================
export interface SortConfig<T = string> {
  key: T;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  status?: RequestStatus;
  department?: Department | 'all';
  searchQuery?: string;
}

// ==================== FORM DATA ====================
export interface RequestFormData {
  department: RequestDepartment;
  taskId: string;
  eventDate: string;
  taskNumber: number;
  details?: string;
  proofUrl?: string;
}

export interface TransferFormData {
  toEmail: string;
  department: Department;
}

export interface TaskFormData {
  department: Department;
  description: string;
  points: number;
}
