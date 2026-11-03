/**
 * Task Service
 * Handles department task operations
 */

import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS, VALIDATION } from '../constants';
import type { DepartmentTask, TaskFormData, Department } from '../models';
import { validateTaskDescription } from '../utils';
import { cappedInteger } from '../utils/scoring';
import { readTask } from './taskCatalog';

function validTask(description: string, points: number): { description: string; points: number } {
  if (!validateTaskDescription(description)) {
    throw new Error(`Denumirea task-ului trebuie să aibă ${VALIDATION.MIN_TASK_LENGTH}-${VALIDATION.MAX_TASK_LENGTH} caractere.`);
  }
  return { description: description.trim(), points: cappedInteger(points, 'Punctajul task-ului', VALIDATION.MAX_POINTS) };
}

export const getDepartmentTasks = async (department: Department): Promise<DepartmentTask[]> => {
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.DEPARTMENT_TASKS), where('department', '==', department)));
  return snapshot.docs.map(document => readTask(document.id, document.data())).sort((a, b) => b.points - a.points);
};

export const createTask = async (formData: TaskFormData): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.DEPARTMENT_TASKS), {
    department: formData.department, ...validTask(formData.description, formData.points),
  });
  return docRef.id;
};

export const updateTask = async (taskId: string, description: string, points: number): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.DEPARTMENT_TASKS, taskId), validTask(description, points));
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.DEPARTMENT_TASKS, taskId));
};
