import { collection, onSnapshot, query, Timestamp, where } from 'firebase/firestore';
import type { Firestore, Unsubscribe } from 'firebase/firestore';
import type { Department, DepartmentTask } from '../models';
import { COLLECTIONS } from '../constants/index.ts';
import { aggregateApprovedRequests } from '../utils/scoring.ts';
import type { LeaderboardResult, ScorableRequest } from '../utils/scoring.ts';
import { subscribeToTaskCatalog } from './taskCatalog.ts';
import { subscribeToMemberNames, type MemberNames } from './memberService.ts';
import { academicYearStart } from '../utils/requestCalendar.ts';
import { REQUEST_DEPARTMENTS } from '../constants/departments.ts';
import { subscribeToScoringReset } from './scoringResetService.ts';

export interface DepartmentLeaderboard extends LeaderboardResult {
  tasks: DepartmentTask[];
  resetAt: Timestamp | null;
}

export const subscribeToLeaderboard = (
  database: Firestore,
  department: Department,
  onChange: (data: DepartmentLeaderboard) => void,
  onError: (error: Error) => void,
): Unsubscribe => {
  let active = true;
  const since = academicYearStart();
  let requests: (ScorableRequest & { reviewedAt?: Timestamp })[] | undefined;
  let tasks: DepartmentTask[] | undefined;
  let names: MemberNames | undefined;
  let resetAt: Timestamp | null | undefined;
  let stopRequests: Unsubscribe | undefined;
  let stopTasks: Unsubscribe | undefined;
  let stopNames: Unsubscribe | undefined;
  let stopReset: Unsubscribe | undefined;
  const stop = () => {
    active = false;
    stopRequests?.();
    stopTasks?.();
    stopNames?.();
    stopReset?.();
  };
  const fail = (error: unknown, fromCache = false) => {
    if (!active) return;
    // Keep listening for a server correction when only the cached data is invalid.
    if (!fromCache) stop();
    onError(error instanceof Error ? error : new Error(String(error)));
  };
  const publish = () => {
    if (active && requests && tasks && names && resetAt !== undefined) {
      const cutoff = resetAt;
      const eligible = cutoff
        ? requests.filter(request => request.reviewedAt && request.reviewedAt.valueOf() >= cutoff.valueOf())
        : requests;
      onChange({ ...aggregateApprovedRequests(eligible, tasks, names), tasks, resetAt });
    }
  };

  try {
    stopRequests = onSnapshot(query(
      collection(database, COLLECTIONS.POINT_REQUESTS),
      department === 'GENERAL'
        ? where('department', 'in', REQUEST_DEPARTMENTS)
        : where('department', '==', department),
      where('status', '==', 'approved'),
    ), { includeMetadataChanges: true }, snapshot => {
      if (!active) return;
      requests = undefined;
      try {
        requests = snapshot.docs.filter(document => document.data().eventDate >= since).map(document => {
          const data = document.data();
          return {
            id: document.id, department: data.department, status: 'approved',
            taskId: data.taskId, taskNumber: data.taskNumber,
            userEmail: data.userEmail,
            reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt : undefined,
          };
        });
        publish();
      } catch (error) {
        fail(error, snapshot.metadata.fromCache);
      }
    }, fail);
    stopTasks = subscribeToTaskCatalog(database, catalog => {
      if (!active) return;
      tasks = catalog;
      publish();
    }, (error, fromCache) => {
      tasks = undefined;
      fail(error, fromCache);
    }, department === 'GENERAL' ? undefined : department);
    stopNames = subscribeToMemberNames(database, memberNames => {
      if (!active) return;
      names = memberNames;
      publish();
    }, fail);
    stopReset = subscribeToScoringReset(database, cutoff => {
      if (!active) return;
      resetAt = cutoff;
      publish();
    }, fail);
  } catch (error) {
    fail(error);
  }
  return stop;
};
