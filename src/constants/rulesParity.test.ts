import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { REQUEST_DEPARTMENTS, VALIDATION } from './index';
import { ACADEMIC_YEAR_START_MONTH } from '../utils/requestCalendar';

// Firestore rules cannot import app code, so this test is what keeps both copies of each policy equal.
const rules = readFileSync('firestore.rules', 'utf8');
const ruleFunction = (name: string) => rules.match(new RegExp(`function ${name}\\(\\) \\{ return (.+?); \\}`))?.[1];

describe('firestore.rules policy matches the app constants', () => {
  it('uses the same request departments', () => {
    expect(ruleFunction('requestDepartments')).toBe(`[${REQUEST_DEPARTMENTS.map(value => `'${value}'`).join(', ')}]`);
  });

  it('uses the same limits', () => {
    expect(ruleFunction('maxPoints')).toBe(String(VALIDATION.MAX_POINTS));
    expect(ruleFunction('maxRepetitions')).toBe(String(VALIDATION.MAX_REPETITIONS));
    expect(ruleFunction('transferTtl')).toBe(`duration.value(${VALIDATION.TRANSFER_EXPIRY_HOURS}, 'h')`);
    expect(rules).toContain(`description.trim().size() >= ${VALIDATION.MIN_TASK_LENGTH}`);
    expect(rules).toContain(`description.size() <= ${VALIDATION.MAX_TASK_LENGTH}`);
  });

  it('starts the academic year in the same month', () => {
    const month = ACADEMIC_YEAR_START_MONTH + 1;
    expect(rules).toContain('request.time.month() < ' + month + ' ? 1 : 0');
    expect(rules).toContain("'-" + String(month).padStart(2, '0') + "-01'");
  });

  it('uses the same email domain', () => {
    expect(rules).toContain(`@${VALIDATION.EMAIL_DOMAIN.slice(1).replace('.', '[.]')}'`);
  });
});
