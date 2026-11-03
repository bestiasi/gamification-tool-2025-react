import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdminRequests } from './useRequests';
import { useTaskCatalog } from './useTasks';
import { useMemberNames } from './useMemberNames';
import { displayName, normalizeEmail } from '../services/memberService';
import { accessibleDepartments } from '../constants/departments';
import { hasDepartmentAccess } from '../utils/roles';
import { resolveRequestTask } from '../utils/scoring';
import type { PointRequest, RequestStatus } from '../models';

export function useRequestModeration(active = true) {
  const { user, departments } = useAuth();
  const availableDepartments = accessibleDepartments(departments);
  const [status, setStatus] = useState<RequestStatus>('pending');
  const [selectedDepartment, setDepartment] = useState('all');
  const department = selectedDepartment === 'all' || availableDepartments.some(value => value === selectedDepartment)
    ? selectedDepartment : 'all';
  const [search, setSearch] = useState('');
  const requests = useAdminRequests(active ? status : null, departments);
  const catalog = useTaskCatalog(active);
  const members = useMemberNames(active);
  const nameOf = useCallback((request: PointRequest) => displayName(members.names, request.userEmail), [members.names]);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const generation = useRef(0);
  const invalidate = useCallback(() => { generation.current++; }, []);

  useEffect(() => {
    invalidate();
    setReviewing(null);
    setComment('');
    setError('');
    return invalidate;
  }, [status, department, departments, invalidate]);

  const filtered = useMemo(() => requests.requests.filter(request =>
    hasDepartmentAccess(departments, request.department)
    && (department === 'all' || request.department === department)
    && (!search.trim() || nameOf(request).toLowerCase().includes(search.trim().toLowerCase())
      || resolveRequestTask(request, catalog.tasks)?.description.toLowerCase().includes(search.trim().toLowerCase()))
  ), [requests.requests, departments, department, search, catalog.tasks, nameOf]);

  const canReview = (request: PointRequest) => request.userEmail !== normalizeEmail(user?.email ?? '');
  const review = async (request: PointRequest, nextStatus: 'approved' | 'rejected') => {
    if (submitting.current) return;
    const current = generation.current;
    setError('');
    if (!user?.email || !canReview(request) || !hasDepartmentAccess(departments, request.department)) {
      setError('Cererea trebuie revizuită de alt responsabil autorizat al departamentului.');
      return;
    }
    if (nextStatus === 'rejected' && !comment.trim()) {
      setError('Introdu un motiv pentru respingere.');
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      if (nextStatus === 'approved') await requests.approve(request.id, user.email, comment);
      else await requests.reject(request.id, user.email, comment);
      if (current === generation.current) { setReviewing(null); setComment(''); }
    } catch (error) {
      console.error('Error reviewing request:', error);
      if (current === generation.current) setError(error instanceof Error ? error.message : 'Cererea nu a putut fi revizuită.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  return {
    requests, catalog, nameOf, filtered, availableDepartments, status, setStatus, department, setDepartment,
    search, setSearch, reviewing, setReviewing, comment, setComment, error, busy, canReview, review,
  };
}
