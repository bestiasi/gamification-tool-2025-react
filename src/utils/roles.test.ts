import { describe, expect, it } from 'vitest';
import { hasDepartmentAccess, resolveRoles } from './roles';

describe('resolveRoles', () => {
  it('gives a member without role documents no departments', () => {
    expect(resolveRoles(undefined, undefined)).toMatchObject({ role: 'user', departments: [], isAdmin: false });
  });

  it('lets admin departments win over secretary departments, matching the rules', () => {
    expect(resolveRoles({ departments: ['IT'] }, { departments: ['HR'] }))
      .toMatchObject({ role: 'admin', departments: ['IT'] });
  });

  it('uses secretary departments when there is no admin role', () => {
    expect(resolveRoles(undefined, { departments: ['HR', 'PR'] }))
      .toMatchObject({ role: 'secretary', isSecretary: true });
  });

  it('fails loudly on malformed role documents', () => {
    expect(() => resolveRoles({ departments: ['XX'] }, undefined)).toThrow();
    expect(() => resolveRoles({ nope: true }, undefined)).toThrow();
  });
});

describe('hasDepartmentAccess', () => {
  it('grants GENERAL access to every department', () => {
    expect(hasDepartmentAccess(['GENERAL'], 'FR')).toBe(true);
    expect(hasDepartmentAccess(['IT'], 'FR')).toBe(false);
    expect(hasDepartmentAccess(['IT'], 'IT')).toBe(true);
  });
});
