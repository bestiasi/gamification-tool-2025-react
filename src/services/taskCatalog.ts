import { collection, onSnapshot, query, where } from 'firebase/firestore';
import type { DocumentData, Firestore, Unsubscribe } from 'firebase/firestore';
import { COLLECTIONS } from '../constants/index.ts';
import { REQUEST_DEPARTMENTS } from '../constants/departments.ts';
import type { Department, DepartmentTask } from '../models/index.ts';
import { positiveInteger } from '../utils/scoring.ts';

// The only place task documents are decoded.
export function readTask(id: string, data: DocumentData): DepartmentTask {
  const department = REQUEST_DEPARTMENTS.find(value => value === data.department);
  if (!department || typeof data.description !== 'string' || !data.description.trim() || typeof data.points !== 'number') {
    throw new Error(`Task-ul ${id} are date invalide.`);
  }
  return { id, department, description: data.description, points: positiveInteger(data.points, 'Punctajul actual al task-ului') };
}

export function subscribeToTaskCatalog(
  database: Firestore,
  onChange: (tasks: DepartmentTask[]) => void,
  onError: (error: Error, fromCache?: boolean) => void,
  department?: Department,
): Unsubscribe {
  const tasks = collection(database, COLLECTIONS.DEPARTMENT_TASKS);
  return onSnapshot(department ? query(tasks, where('department', '==', department)) : tasks,
    { includeMetadataChanges: true }, snapshot => {
      try {
        onChange(snapshot.docs.map(document => readTask(document.id, document.data())).sort((a, b) => b.points - a.points));
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)), snapshot.metadata.fromCache);
      }
    }, error => onError(error));
}
