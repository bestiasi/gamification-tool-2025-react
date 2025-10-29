/**
 * useTasks Hook
 * Custom hook for managing department tasks
 */

import { useState, useCallback } from 'react';
import type { DepartmentTask, Department, TaskFormData } from '../models';
import {
  getDepartmentTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services';

export const useTasks = (department?: Department) => {
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchTasks = useCallback(async (dept?: Department) => {
    const targetDept = dept || department;
    if (!targetDept) return;

    setLoading(true);
    setError('');

    try {
      const fetchedTasks = await getDepartmentTasks(targetDept);
      setTasks(fetchedTasks);
    } catch (err: any) {
      setError(err.message || 'Error fetching tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [department]);

  const create = async (formData: TaskFormData) => {
    try {
      await createTask(formData);
      await fetchTasks(formData.department);
    } catch (err: any) {
      setError(err.message || 'Error creating task');
      throw err;
    }
  };

  const update = async (taskId: string, description: string, points: number) => {
    try {
      await updateTask(taskId, description, points);
      await fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Error updating task');
      throw err;
    }
  };

  const remove = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      await fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Error deleting task');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    create,
    update,
    remove,
  };
};
