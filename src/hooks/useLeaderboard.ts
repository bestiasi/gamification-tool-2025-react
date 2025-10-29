/**
 * useLeaderboard Hook
 * Custom hook for leaderboard data
 */

import { useState, useCallback } from 'react';
import type { UserPoints, Department } from '../models';
import { calculateUserPoints } from '../services';

export const useLeaderboard = (department: Department) => {
  const [leaderboard, setLeaderboard] = useState<UserPoints[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await calculateUserPoints(department);
      setLeaderboard(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [department]);

  return {
    leaderboard,
    loading,
    error,
    fetchLeaderboard,
  };
};
