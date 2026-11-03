import type { DepartmentTask, SortConfig, UserPoints } from '../../models/index.ts';
import { completedTaskCount } from '../../utils/scoring.ts';

export type LeaderboardSort = SortConfig<'name' | 'points' | 'tasks'>;
export type TaskSort = SortConfig<'description' | 'points'>;

export function sortLeaderboard(people: UserPoints[], sort: LeaderboardSort): UserPoints[] {
  return [...people].sort((a, b) => {
    let comparison: number;
    if (sort.key === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sort.key === 'points') {
      comparison = a.totalPoints - b.totalPoints;
    } else {
      comparison = completedTaskCount(a) - completedTaskCount(b);
    }
    return sort.direction === 'asc' ? comparison : -comparison;
  });
}

export function sortTasks(tasks: DepartmentTask[], sort: TaskSort): DepartmentTask[] {
  return [...tasks].sort((a, b) => {
    const comparison = sort.key === 'description'
      ? a.description.localeCompare(b.description)
      : a.points - b.points;
    return sort.direction === 'asc' ? comparison : -comparison;
  });
}
