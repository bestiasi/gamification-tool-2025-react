import { DEPARTMENTS } from '../constants/departments';
import type { Department, UserRole } from '../models';

export function parseDepartments(value: unknown): Department[] {
  if (!Array.isArray(value)) throw new Error('Departamentele rolului sunt invalide.');
  return value.map(item => {
    const department = DEPARTMENTS.find(candidate => candidate === item);
    if (!department) throw new Error('Departamentele rolului sunt invalide.');
    return department;
  });
}

function documentDepartments(data: unknown): Department[] {
  if (data === null || data === undefined) return [];
  if (typeof data !== 'object' || !('departments' in data)) {
    throw new Error('Documentul rolului este invalid.');
  }
  return parseDepartments(data.departments);
}

export function resolveRoles(admin: unknown, secretary: unknown) {
  const adminDepartments = documentDepartments(admin);
  const secretaryDepartments = documentDepartments(secretary);
  const role: UserRole = adminDepartments.length ? 'admin' : secretaryDepartments.length ? 'secretary' : 'user';
  const assigned = role === 'admin' ? adminDepartments : role === 'secretary' ? secretaryDepartments : [];
  return {
    role,
    departments: DEPARTMENTS.filter(department => assigned.includes(department)),
    isAdmin: role === 'admin',
    isSecretary: role === 'secretary',
  };
}

export function hasDepartmentAccess(assigned: readonly Department[], department: Department): boolean {
  return assigned.includes('GENERAL') || assigned.includes(department);
}
