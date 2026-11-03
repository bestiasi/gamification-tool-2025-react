import { describe, expect, it } from 'vitest';
import { academicYearStart } from './requestCalendar';

describe('academicYearStart', () => {
  it('starts the academic year on 1 September', () => {
    expect(academicYearStart(new Date(2026, 8, 1))).toBe('2026-09-01');
    expect(academicYearStart(new Date(2026, 10, 3))).toBe('2026-09-01');
  });

  it('keeps the previous academic year until the end of August', () => {
    expect(academicYearStart(new Date(2026, 7, 31))).toBe('2025-09-01');
    expect(academicYearStart(new Date(2027, 0, 15))).toBe('2026-09-01');
  });
});
