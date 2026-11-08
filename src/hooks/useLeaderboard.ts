import { useState, useEffect, useCallback } from 'react';
import type { Department, DepartmentTask } from '../models';
import { db } from '../firebase/config';
import { subscribeToLeaderboard } from '../services/leaderboardService';
import type { LeaderboardResult } from '../utils/scoring';
import type { ScoringReset } from '../services/scoringResetService';

export const useLeaderboard = (department: Department) => {
  const [result, setResult] = useState<LeaderboardResult>({
    leaderboard: [], issues: [], excludedRequests: 0,
  });
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [reset, setReset] = useState<ScoringReset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const fetchLeaderboard = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    setLoading(true);
    setError('');
    setResult({ leaderboard: [], issues: [], excludedRequests: 0 });
    setTasks([]);
    setReset(null);
    return subscribeToLeaderboard(db, department, ({ tasks, reset, ...data }) => {
      setError('');
      setResult(data);
      setTasks(tasks);
      setReset(reset);
      setLoading(false);
    }, error => {
      console.error('Error subscribing to leaderboard:', error);
      setError(error.message);
      setResult({ leaderboard: [], issues: [], excludedRequests: 0 });
      setTasks([]);
      setReset(null);
      setLoading(false);
    });
  }, [department, revision]);

  return { ...result, tasks, reset, loading, error, fetchLeaderboard };
};
