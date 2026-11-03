import { describe, expect, it } from 'vitest';
import type { DepartmentTask } from '../models';
import {
  aggregateApprovedRequests, cappedInteger, positiveInteger, requestScore,
  ScoreValidationError, validEventDate,
} from './scoring';
import type { ScorableRequest } from './scoring';

const task = (id: string, points: number, department: DepartmentTask['department'] = 'IT'): DepartmentTask =>
  ({ id, points, department, description: `Task ${id}` });

const request = (overrides: Partial<ScorableRequest> = {}): ScorableRequest => ({
  id: 'r1', status: 'approved', taskId: 't1', department: 'IT', taskNumber: 1,
  userEmail: 'ana@bestis.ro', ...overrides,
});

describe('integer validation', () => {
  it('accepts positive integers and digit strings', () => {
    expect(positiveInteger(5, 'x')).toBe(5);
    expect(positiveInteger('12', 'x')).toBe(12);
  });

  it.each([0, -1, 1.5, '1.5', '', 'abc', null, Number.MAX_SAFE_INTEGER + 1])('rejects %s', value => {
    expect(() => positiveInteger(value, 'x')).toThrow(ScoreValidationError);
  });

  it('caps values at the maximum', () => {
    expect(cappedInteger(100, 'x', 100)).toBe(100);
    expect(() => cappedInteger(101, 'x', 100)).toThrow('cel mult 100');
  });
});

describe('validEventDate', () => {
  it.each(['2024-02-29', '2025-12-31', '2026-01-01'])('accepts %s', value => {
    expect(validEventDate(value)).toBe(true);
  });

  it.each(['2025-02-29', '2025-13-01', '2025-04-31', '0999-01-01', '2025-1-01', ''])('rejects %s', value => {
    expect(validEventDate(value)).toBe(false);
  });
});

describe('requestScore', () => {
  it('multiplies current catalog points by repetitions', () => {
    const score = requestScore(request({ taskNumber: 3 }), task('t1', 10));
    expect(score).toMatchObject({ valid: true, points: 30, basePoints: 10, repetitions: 3 });
  });

  it('excludes requests whose task is missing or from another department', () => {
    expect(requestScore(request(), undefined)).toMatchObject({ valid: false, excluded: true });
    expect(requestScore(request(), task('t1', 10, 'HR'))).toMatchObject({ valid: false, excluded: true });
  });

  it('ignores requests that are not approved', () => {
    expect(requestScore(request({ status: 'pending' }), task('t1', 10))).toMatchObject({ valid: false, excluded: false });
  });
});

describe('aggregateApprovedRequests', () => {
  it('sums per user, takes names from members, and sorts by points', () => {
    const result = aggregateApprovedRequests([
      request({ id: 'a', taskNumber: 2 }),
      request({ id: 'b' }),
      request({ id: 'c', userEmail: 'bob@bestis.ro', taskId: 't2' }),
    ], [task('t1', 10), task('t2', 50)], new Map([['ana@bestis.ro', 'Ana Pop']]));

    expect(result.leaderboard.map(user => [user.email, user.name, user.totalPoints])).toEqual([
      ['bob@bestis.ro', 'bob', 50],
      ['ana@bestis.ro', 'Ana Pop', 30],
    ]);
    expect(result.leaderboard[1].tasks).toEqual([
      { taskId: 't1', task: 'Task t1', points: 30, count: 3, basePoints: 10 },
    ]);
  });

  it('reports invalid requests instead of scoring them', () => {
    const result = aggregateApprovedRequests([
      request({ id: 'missing', taskId: 'gone' }),
      request({ id: 'bad', taskNumber: -2 }),
    ], [task('t1', 10)]);

    expect(result.leaderboard).toEqual([]);
    expect(result.excludedRequests).toBe(1);
    expect(result.issues.map(issue => issue.requestId)).toEqual(['bad']);
  });
});
