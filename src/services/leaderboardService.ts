import { collection, onSnapshot, query, where } from 'firebase/firestore';
import type { Firestore, Unsubscribe } from 'firebase/firestore';
import type { Department, DepartmentTask } from '../models';
import { COLLECTIONS } from '../constants/index.ts';
import { aggregateApprovedRequests } from '../utils/scoring.ts';
import type { LeaderboardResult, ScorableRequest } from '../utils/scoring.ts';
import { subscribeToTaskCatalog } from './taskCatalog.ts';
import { subscribeToMemberNames, type MemberNames } from './memberService.ts';
import { academicYearStart } from '../utils/requestCalendar.ts';
import { subscribeToScoringReset } from './scoringResetService.ts';
import type { ScoringReset } from './scoringResetService.ts';

export interface DepartmentLeaderboard extends LeaderboardResult {
  tasks: DepartmentTask[];
  reset: ScoringReset | null;
}

export const subscribeToLeaderboard = (
  database: Firestore,
  department: Department,
  onChange: (data: DepartmentLeaderboard) => void,
  onError: (error: Error) => void,
): Unsubscribe => {
  let active = true;
  const since = academicYearStart();
  let requests: ScorableRequest[] | undefined;
  let tasks: DepartmentTask[] | undefined;
  let names: MemberNames | undefined;
  let reset: ScoringReset | null | undefined;
  let requestRevision = 0;
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
    if (active && requests && tasks && names && reset !== undefined) {
      onChange({ ...aggregateApprovedRequests(requests, tasks, names), tasks, reset });
    }
  };

  const listenForRequests = (cutoff: ScoringReset | null) => {
    const revision = ++requestRevision;
    stopRequests?.();
    requests = undefined;
    stopRequests = onSnapshot(query(
      collection(database, COLLECTIONS.POINT_REQUESTS),
      where('department', '==', department),
      where('status', '==', 'approved'),
      ...(cutoff ? [where('reviewedAt', '>=', cutoff.resetAt)] : []),
    ), { includeMetadataChanges: true }, snapshot => {
      if (!active || revision !== requestRevision) return;
      requests = undefined;
      try {
        requests = snapshot.docs.filter(document => document.data().eventDate >= since).map(document => {
          const data = document.data();
          return {
            id: document.id, department, status: 'approved',
            taskId: data.taskId, taskNumber: data.taskNumber,
            userEmail: data.userEmail,
          };
        });
        publish();
      } catch (error) {
        fail(error, snapshot.metadata.fromCache);
      }
    }, error => { if (revision === requestRevision) fail(error); });
  };

  try {
    stopReset = subscribeToScoringReset(database, nextReset => {
      if (!active) return;
      reset = nextReset;
      try { listenForRequests(nextReset); } catch (error) { fail(error); }
    }, fail);
    stopTasks = subscribeToTaskCatalog(database, catalog => {
      if (!active) return;
      tasks = catalog;
      publish();
    }, (error, fromCache) => {
      tasks = undefined;
      fail(error, fromCache);
    }, department);
    stopNames = subscribeToMemberNames(database, memberNames => {
      if (!active) return;
      names = memberNames;
      publish();
    }, fail);
  } catch (error) {
    fail(error);
  }
  return stop;
};
