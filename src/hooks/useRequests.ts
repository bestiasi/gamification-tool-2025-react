/**
 * useRequests Hook
 * Custom hook for managing point requests
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { PointRequest, RequestStatus, Department } from '../models';
import {
  getUserRequests,
  getRequestsByStatus,
  approveRequest,
  rejectRequest,
  cancelRequest,
} from '../services/requestService';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export const useUserRequests = (userEmail: string) => {
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [error, setError] = useState<string>('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  // Refreshing or leaving the page invalidates older asynchronous reads.
  const revision = useRef(0);
  const fetchingMore = useRef(false);
  const cancelling = useRef(false);
  const invalidateRequests = useCallback(() => { revision.current++; }, []);

  const fetchInitialRequests = useCallback(async () => {
    const currentRevision = ++revision.current;
    fetchingMore.current = false;
    setLoading(true);
    setLoadingMore(false);
    setError('');

    try {
      if (!userEmail) throw new Error('Autentificarea este obligatorie.');
      const { requests: fetchedRequests, lastDoc: newLastDoc, hasMore: moreAvailable } = 
        await getUserRequests(userEmail);
      if (currentRevision !== revision.current) return;
      setRequests(fetchedRequests);
      setLastDoc(newLastDoc);
      setHasMore(moreAvailable);
    } catch (err) {
      console.error('Error fetching requests:', err);
      if (currentRevision === revision.current) {
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea cererilor.');
      }
    } finally {
      if (currentRevision === revision.current) setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    void fetchInitialRequests();
    return invalidateRequests;
  }, [fetchInitialRequests, invalidateRequests]);

  const fetchMoreRequests = useCallback(async () => {
    if (!userEmail || !lastDoc || !hasMore || loading || fetchingMore.current) return;
    const currentRevision = revision.current;
    fetchingMore.current = true;
    setLoadingMore(true);
    setError('');

    try {
      const { requests: newRequests, lastDoc: newLastDoc, hasMore: moreAvailable } = 
        await getUserRequests(userEmail, lastDoc);
      if (currentRevision !== revision.current) return;
      setRequests(previous => {
        const existingIds = new Set(previous.map(request => request.id));
        return [...previous, ...newRequests.filter(request => !existingIds.has(request.id))];
      });
      setLastDoc(newLastDoc);
      setHasMore(moreAvailable);
    } catch (err) {
      console.error('Error fetching more requests:', err);
      if (currentRevision === revision.current) {
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea cererilor.');
      }
    } finally {
      if (currentRevision === revision.current) {
        fetchingMore.current = false;
        setLoadingMore(false);
      }
    }
  }, [userEmail, lastDoc, hasMore, loading]);

  const cancel = async (requestId: string) => {
    if (cancelling.current) return;
    cancelling.current = true;
    setCancellingId(requestId);
    setError('');
    const currentRevision = revision.current;
    try {
      await cancelRequest(requestId);
      if (currentRevision === revision.current) await fetchInitialRequests();
    } catch (err) {
      console.error('Error cancelling request:', err);
      if (currentRevision === revision.current) {
        setError(err instanceof Error ? err.message : 'Eroare la anularea cererii.');
      }
    } finally {
      cancelling.current = false;
      setCancellingId(null);
    }
  };

  return {
    requests,
    loading,
    loadingMore,
    hasMore,
    error,
    cancellingId,
    fetchInitialRequests,
    fetchMoreRequests,
    cancel,
  };
};

export const useAdminRequests = (status: RequestStatus | null, departments: readonly Department[]) => {
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const revision = useRef(0);
  const invalidateRequests = useCallback(() => { revision.current++; }, []);

  const fetchRequests = useCallback(async () => {
    const currentRevision = ++revision.current;
    setRequests([]);
    if (!status) {
      setLoading(false);
      setError('');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const fetchedRequests = await getRequestsByStatus(status, departments);
      if (currentRevision === revision.current) setRequests(fetchedRequests);
    } catch (err) {
      if (currentRevision === revision.current) setError(err instanceof Error ? err.message : 'Eroare la încărcarea cererilor.');
      console.error('Error fetching requests:', err);
    } finally {
      if (currentRevision === revision.current) setLoading(false);
    }
  }, [status, departments]);

  useEffect(() => {
    void fetchRequests();
    return invalidateRequests;
  }, [fetchRequests, invalidateRequests]);

  const approve = async (requestId: string, adminEmail: string, comment?: string) => {
    const currentRevision = revision.current;
    try {
      await approveRequest(requestId, adminEmail, comment);
      if (currentRevision === revision.current) await fetchRequests();
    } catch (err) {
      if (currentRevision === revision.current) setError(err instanceof Error ? err.message : 'Eroare la aprobare.');
      throw err;
    }
  };

  const reject = async (requestId: string, adminEmail: string, comment: string) => {
    const currentRevision = revision.current;
    try {
      await rejectRequest(requestId, adminEmail, comment);
      if (currentRevision === revision.current) await fetchRequests();
    } catch (err) {
      if (currentRevision === revision.current) setError(err instanceof Error ? err.message : 'Eroare la respingere.');
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
