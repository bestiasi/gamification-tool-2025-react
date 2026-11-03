import type { DepartmentTask, UserPoints } from '../models/index.ts';
import { displayName, type MemberNames } from '../services/memberService.ts';

export interface ScorableRequest {
  id: string;
  status: string;
  taskId?: string;
  department: string;
  taskNumber: unknown;
  userEmail: string;
}

export type RequestScore =
  | { valid: true; task: DepartmentTask; basePoints: number; repetitions: number; points: number }
  | { valid: false; reason: string; excluded: boolean };

export interface ScoreIssue {
  requestId: string;
  userEmail: string;
  reason: string;
}

export interface LeaderboardResult {
  leaderboard: UserPoints[];
  issues: ScoreIssue[];
  excludedRequests: number;
}

export class ScoreValidationError extends Error {}

export function positiveInteger(value: unknown, label: string): number {
  const number = typeof value === 'string' && /^[0-9]+$/.test(value) ? Number(value) : value;
  if (typeof number !== 'number' || !Number.isSafeInteger(number) || number <= 0) {
    throw new ScoreValidationError(`${label} trebuie să fie un număr întreg pozitiv.`);
  }
  return number;
}

export function cappedInteger(value: unknown, label: string, max: number): number {
  const number = positiveInteger(value, label);
  if (number > max) throw new ScoreValidationError(`${label} poate fi cel mult ${max}.`);
  return number;
}

export function taskTotal(basePoints: number, count: number): number {
  positiveInteger(basePoints, 'Punctajul de bază');
  positiveInteger(count, 'Numărul de repetări');
  return positiveInteger(basePoints * count, 'Punctajul total');
}

export function resolveRequestTask(
  request: Pick<ScorableRequest, 'taskId' | 'department'>,
  tasks: readonly DepartmentTask[],
): DepartmentTask | undefined {
  return tasks.find(task => task.id === request.taskId && task.department === request.department);
}

export function validEventDate(value: string): boolean {
  if (!/^[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function localDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function completedTaskCount(user: Pick<UserPoints, 'tasks'>): number {
  return user.tasks.reduce((sum, task) => sum + (task.count ?? 0), 0);
}

export function requestScore(request: ScorableRequest, task: DepartmentTask | undefined): RequestScore {
  if (request.status !== 'approved') {
    return { valid: false, reason: 'Cererea nu este aprobată.', excluded: false };
  }
  if (typeof request.taskId !== 'string' || !request.taskId) {
    return { valid: false, reason: 'Cererea nu conține un taskId.', excluded: true };
  }
  if (!task || task.id !== request.taskId) {
    return { valid: false, reason: 'Task-ul referit de cerere nu există în catalog.', excluded: true };
  }
  if (task.department !== request.department) {
    return { valid: false, reason: 'Task-ul aparține altui departament.', excluded: true };
  }
  try {
    const count = positiveInteger(request.taskNumber, 'Numărul de repetări');
    if (typeof task.points !== 'number') throw new ScoreValidationError('Punctajul task-ului este invalid.');
    const basePoints = positiveInteger(task.points, 'Punctajul actual al task-ului');
    return { valid: true, task, basePoints, repetitions: count, points: taskTotal(basePoints, count) };
  } catch (error) {
    if (!(error instanceof ScoreValidationError)) throw error;
    return { valid: false, reason: error.message, excluded: false };
  }
}

export function aggregateApprovedRequests(
  requests: readonly ScorableRequest[], tasks: readonly DepartmentTask[], names: MemberNames = new Map(),
): LeaderboardResult {
  const users = new Map<string, UserPoints>();
  const taskCatalog = new Map(tasks.map(task => [task.id, task]));
  const issues: ScoreIssue[] = [];
  let excludedRequests = 0;
  for (const request of requests) {
    if (request.status !== 'approved') continue;
    const score = requestScore(request, request.taskId ? taskCatalog.get(request.taskId) : undefined);
    if (!score.valid && score.excluded) {
      excludedRequests++;
      continue;
    }
    if (!score.valid || typeof request.userEmail !== 'string' || !request.userEmail.trim()) {
      issues.push({
        requestId: request.id,
        userEmail: request.userEmail,
        reason: score.valid ? 'Identitatea utilizatorului lipsește.' : score.reason,
      });
      continue;
    }
    const { task } = score;
    const email = request.userEmail.trim().toLowerCase();
    let user = users.get(email);
    if (!user) {
      user = { email, name: displayName(names, email), totalPoints: 0, tasks: [] };
      users.set(email, user);
    }
    const total = user.totalPoints + score.points;
    if (!Number.isSafeInteger(total)) throw new Error(`Punctajul total depășește limita numerică pentru ${email}.`);
    user.totalPoints = total;
    const existing = user.tasks.find(item => item.taskId === task.id);
    if (existing) {
      existing.count = (existing.count ?? 0) + score.repetitions;
      existing.points += score.points;
    } else {
      user.tasks.push({
        taskId: task.id,
        task: task.description,
        points: score.points,
        count: score.repetitions,
        basePoints: score.basePoints,
      });
    }
  }
  return {
    leaderboard: [...users.values()].sort((a, b) => b.totalPoints - a.totalPoints || a.email.localeCompare(b.email)),
    issues,
    excludedRequests,
  };
}
