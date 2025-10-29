/**
 * Task Service
 * Handles department task operations
 */

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../constants';
import type { DepartmentTask, TaskFormData, Department } from '../models';
import { timestampToDate } from '../utils';

/**
 * Get tasks for a specific department
 */
export const getDepartmentTasks = async (department: Department): Promise<DepartmentTask[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.DEPARTMENT_TASKS),
      where('department', '==', department)
    );

    const snapshot = await getDocs(q);
    const tasks: DepartmentTask[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        department: data.department,
        description: data.description,
        points: data.points,
        createdAt: data.createdAt ? timestampToDate(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? timestampToDate(data.updatedAt) : undefined,
      } as DepartmentTask);
    });

    // Sort by points descending
    tasks.sort((a, b) => b.points - a.points);

    return tasks;
  } catch (error) {
    console.error('Error fetching department tasks:', error);
    throw error;
  }
};

/**
 * Create a new task
 */
export const createTask = async (formData: TaskFormData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.DEPARTMENT_TASKS), {
      department: formData.department,
      description: formData.description.trim(),
      points: formData.points,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (
  taskId: string,
  description: string,
  points: number
): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.DEPARTMENT_TASKS, taskId), {
      description: description.trim(),
      points,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.DEPARTMENT_TASKS, taskId));
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

/**
 * Get all tasks across all departments (for admin overview)
 */
export const getAllTasks = async (): Promise<DepartmentTask[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.DEPARTMENT_TASKS));
    const tasks: DepartmentTask[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        department: data.department,
        description: data.description,
        points: data.points,
        createdAt: data.createdAt ? timestampToDate(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? timestampToDate(data.updatedAt) : undefined,
      } as DepartmentTask);
    });

    return tasks;
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    throw error;
  }
};
