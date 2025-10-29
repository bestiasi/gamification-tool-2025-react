/**
 * Leaderboard Service
 * Handles leaderboard calculations and user points
 */

import type { PointRequest, UserPoints, Department } from '../models';
import { getApprovedRequestsByDepartment } from './requestService';
import { getDepartmentTasks } from './taskService';

/**
 * Calculate user points from approved requests
 */
export const calculateUserPoints = async (department: Department): Promise<UserPoints[]> => {
  try {
    // Fetch approved requests
    const requests = await getApprovedRequestsByDepartment(department);
    
    // Fetch department tasks to get points map
    const tasks = await getDepartmentTasks(department);
    const taskPointsMap = new Map<string, number>();
    
    tasks.forEach(task => {
      taskPointsMap.set(task.description, task.points);
    });

    // Calculate points per user
    const userPointsMap = new Map<string, UserPoints>();

    requests.forEach((request: PointRequest) => {
      const userEmail = request.userEmail;
      const userName = request.userName;
      const taskDescription = request.task || 'Task nespecificat';
      const taskNumber = parseInt(request.taskNumber || '1');
      
      // Get base points for task
      const basePoints = taskPointsMap.get(taskDescription) || 0;
      const pointsEarned = basePoints * taskNumber;

      if (!userPointsMap.has(userEmail)) {
        userPointsMap.set(userEmail, {
          name: userName,
          email: userEmail,
          totalPoints: 0,
          tasks: [],
        });
      }

      const userPoints = userPointsMap.get(userEmail)!;
      userPoints.totalPoints += pointsEarned;

      // Find or create task entry
      const existingTask = userPoints.tasks.find(t => t.task === taskDescription);
      if (existingTask) {
        existingTask.count = (existingTask.count || 0) + taskNumber;
        existingTask.points += pointsEarned;
      } else {
        userPoints.tasks.push({
          task: taskDescription,
          points: pointsEarned,
          count: taskNumber,
          basePoints,
        });
      }
    });

    // Convert to array and sort by total points
    const leaderboard = Array.from(userPointsMap.values());
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

    return leaderboard;
  } catch (error) {
    console.error('Error calculating user points:', error);
    throw error;
  }
};

/**
 * Get top users across all departments
 */
export const getGlobalLeaderboard = async (): Promise<UserPoints[]> => {
  // This would require fetching all departments
  // For now, return empty array as it's not currently used
  return [];
};
