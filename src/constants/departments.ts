import type { Department } from '../models';

export const departmentPages = [
  { department: 'FR', path: '/fr' },
  { department: 'PR', path: '/pr' },
  { department: 'HR', path: '/hr' },
  { department: 'IT', path: '/it' },
] as const;

export type LeaderboardDepartment = typeof departmentPages[number]['department'];

export const REQUEST_DEPARTMENTS: readonly LeaderboardDepartment[] = departmentPages.map(({ department }) => department);
export const DEPARTMENTS: readonly Department[] = [...REQUEST_DEPARTMENTS, 'GENERAL'];

export function accessibleDepartments(assigned: readonly Department[]): readonly Department[] {
  return assigned.includes('GENERAL') ? DEPARTMENTS : assigned;
}
