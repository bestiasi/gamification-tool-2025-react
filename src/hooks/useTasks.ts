/**
 * useTasks Hook
 * Custom hook for managing department tasks
 */

import { useState, useCallback, useEffect } from 'react';
import { db } from '../firebase/config';
import { subscribeToTaskCatalog } from '../services/taskCatalog';
import type { DepartmentTask, Department, TaskFormData } from '../models';
import {
  getDepartmentTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services';

export const useTaskCatalog = (enabled = true) => {
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    setTasks([]);
    setError('');
    setLoading(enabled);
    if (!enabled) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    const stop = () => { active = false; unsubscribe?.(); };
    try {
      unsubscribe = subscribeToTaskCatalog(db, catalog => {
        if (!active) return;
        setTasks(catalog);
        setError('');
        setLoading(false);
      }, (error, fromCache) => {
        if (!active) return;
        console.error('Error subscribing to task catalog:', error);
        if (!fromCache) stop();
        setTasks([]);
        setError(error.message);
        setLoading(false);
      });
    } catch (error) {
      stop();
      console.error('Error subscribing to task catalog:', error);
      setError(error instanceof Error ? error.message : String(error));
      setLoading(false);
    }
    return stop;
  }, [enabled, revision]);

  return { tasks, loading, error, retry };
};

export const useTasks = (department?: Department) => {
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [revision, setRevision] = useState(0);

  const fetchTasks = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    let active = true;
    setTasks([]);
    setError('');
    setLoading(Boolean(department));
    if (!department) return;
    getDepartmentTasks(department).then(fetchedTasks => {
      if (active) setTasks(fetchedTasks);
    }).catch((error: unknown) => {
      console.error('Error fetching tasks:', error);
      if (active) setError(error instanceof Error ? error.message : 'Eroare la încărcarea task-urilor.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [department, revision]);

  const create = async (formData: TaskFormData) => {
    await createTask(formData);
    fetchTasks();
  };

  const update = async (taskId: string, description: string, points: number) => {
    await updateTask(taskId, description, points);
    fetchTasks();
  };

  const remove = async (taskId: string) => {
    await deleteTask(taskId);
    fetchTasks();
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
