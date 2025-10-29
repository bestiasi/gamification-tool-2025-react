/**
 * useRequests Hook
 * Custom hook for managing point requests
 */

import { useState, useCallback } from 'react';
import type { PointRequest, RequestStatus, Department } from '../models';
import {
  getUserRequests,
  getRequestsByStatus,
  approveRequest,
  rejectRequest,
  cancelRequest,
} from '../services';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export const useUserRequests = (userId: string) => {
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [error, setError] = useState<string>('');

  const fetchInitialRequests = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError('');

    try {
      const { requests: fetchedRequests, lastDoc: newLastDoc, hasMore: moreAvailable } = 
        await getUserRequests(userId);
      
      setRequests(fetchedRequests);
      setLastDoc(newLastDoc);
      setHasMore(moreAvailable);
    } catch (err: any) {
      setError(err.message || 'Error fetching requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchMoreRequests = useCallback(async () => {
    if (!userId || !hasMore || loadingMore) return;

    setLoadingMore(true);
    setError('');

    try {
      const { requests: newRequests, lastDoc: newLastDoc, hasMore: moreAvailable } = 
        await getUserRequests(userId, lastDoc);
      
      setRequests(prev => [...prev, ...newRequests]);
      setLastDoc(newLastDoc);
      setHasMore(moreAvailable);
    } catch (err: any) {
      setError(err.message || 'Error fetching more requests');
      console.error('Error fetching more requests:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [userId, lastDoc, hasMore, loadingMore]);

  const cancel = async (requestId: string) => {
    try {
      await cancelRequest(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      setError(err.message || 'Error cancelling request');
      throw err;
    }
  };

  return {
    requests,
    loading,
    loadingMore,
    hasMore,
    error,
    fetchInitialRequests,
    fetchMoreRequests,
    cancel,
  };
};

export const useAdminRequests = (status: RequestStatus, department?: Department | 'all') => {
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const fetchedRequests = await getRequestsByStatus(status, department);
      setRequests(fetchedRequests);
    } catch (err: any) {
      setError(err.message || 'Error fetching requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }, [status, department]);

  const approve = async (requestId: string, adminEmail: string, comment?: string) => {
    try {
      await approveRequest(requestId, adminEmail, comment);
      await fetchRequests(); // Refresh
    } catch (err: any) {
      setError(err.message || 'Error approving request');
      throw err;
    }
  };

  const reject = async (requestId: string, adminEmail: string, comment: string) => {
    try {
      await rejectRequest(requestId, adminEmail, comment);
      await fetchRequests(); // Refresh
    } catch (err: any) {
      setError(err.message || 'Error rejecting request');
      throw err;
    }
  };

  return {
    requests,
    loading,
    error,
    fetchRequests,
    approve,
    reject,
  };
};
