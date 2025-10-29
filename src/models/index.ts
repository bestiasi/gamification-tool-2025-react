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

// ==================== ADMIN & SECRETARY ====================
export interface Admin {
  email: string;
  role: 'admin';
  departments: Department[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Secretary {
  email: string;
  role: 'secretary';
  departments: Department[];
  createdBy: string;
  createdAt: Date;
}

// ==================== DEPARTMENTS ====================
export type Department = 'HR' | 'PR' | 'IT' | 'FR' | 'GENERAL';

export const DEPARTMENTS: Department[] = ['HR', 'PR', 'IT', 'FR', 'GENERAL'];

// ==================== TASKS ====================
export interface DepartmentTask {
  id: string;
  department: Department;
  description: string;
  points: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ==================== POINT REQUESTS ====================
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface PointRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  department: Department;
  task: string;
  eventDate?: string;
  proofUrl?: string;
  taskNumber: string | null;
  details: string | null;
  status: RequestStatus;
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  adminComment?: string;
}

// ==================== TRANSFERS ====================
export type TransferStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface AdminTransfer {
  id: string;
  fromEmail: string;
  toEmail: string;
  department: Department;
  token: string;
  status: TransferStatus;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectedBy?: string;
}

// ==================== LEADERBOARD ====================
export interface UserPoints {
  name: string;
  email: string;
  totalPoints: number;
  tasks: TaskSummary[];
}

export interface TaskSummary {
  task: string;
  points: number;
  count?: number;
  basePoints?: number;
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
  department: Department;
  task: string;
  eventDate?: string;
  taskNumber?: string;
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
