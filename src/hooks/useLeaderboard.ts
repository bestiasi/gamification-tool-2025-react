import { useState, useEffect, useCallback } from 'react';
import type { Department, DepartmentTask } from '../models';
import { db } from '../firebase/config';
import { subscribeToLeaderboard } from '../services/leaderboardService';
import type { LeaderboardResult } from '../utils/scoring';

export const useLeaderboard = (department: Department) => {
  const [result, setResult] = useState<LeaderboardResult>({
    leaderboard: [], issues: [], excludedRequests: 0,
  });
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const fetchLeaderboard = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    setLoading(true);
    setError('');
    setResult({ leaderboard: [], issues: [], excludedRequests: 0 });
    setTasks([]);
    return subscribeToLeaderboard(db, department, ({ tasks, ...data }) => {
      setError('');
      setResult(data);
      setTasks(tasks);
      setLoading(false);
    }, error => {
      console.error('Error subscribing to leaderboard:', error);
      setError(error.message);
      setResult({ leaderboard: [], issues: [], excludedRequests: 0 });
      setTasks([]);
      setLoading(false);
    });
  }, [department, revision]);

  return { ...result, tasks, loading, error, fetchLeaderboard };
};
