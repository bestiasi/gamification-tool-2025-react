import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { useUserRequests } from '../../hooks/useRequests';
import { useTaskCatalog } from '../../hooks/useTasks';
import { resolveRequestTask } from '../../utils/scoring';
import type { RequestStatus } from '../../models';
import RequestCard from './RequestCard';
import ui from '../../styles/ui.module.css';
import styles from './Requests.module.css';

const RequestModal = lazy(() => import('../../components/RequestModal'));
const statusLabels: Record<RequestStatus, string> = {
  pending: 'În așteptare',
  approved: 'Aprobate',
  rejected: 'Respinse',
  cancelled: 'Anulate',
};

export default function Requests() {
  const { user } = useAuth();
  const {
    requests, loading, loadingMore, hasMore, error, cancellingId,
    fetchInitialRequests, fetchMoreRequests, cancel,
  } = useUserRequests(user?.email ?? '');
  const { tasks, loading: catalogLoading, error: catalogError, retry: retryCatalog } = useTaskCatalog(Boolean(user));
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || loading || loadingMore || !hasMore || error) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) void fetchMoreRequests();
    }, { threshold: 0.1 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, error, fetchMoreRequests]);

  const counts = { all: requests.length, pending: 0, approved: 0, rejected: 0, cancelled: 0 };
  for (const request of requests) counts[request.status]++;
  const totalLabel = hasMore ? 'Cereri încărcate' : 'Total Cereri';
  const filtered = filterStatus === 'all' ? requests : requests.filter(request => request.status === filterStatus);
  const cancelRequest = (requestId: string) => {
    if (window.confirm('Ești sigur că vrei să anulezi această cerere?')) void cancel(requestId);
  };

  return (
    <main className={`${ui.page} ${styles['requests-page']}`}>
      <div className={styles['requests-container']}>
        {loading || catalogLoading ? <p className={styles['loading-text']} role="status">Se încarcă...</p> : (
          <div className={styles['requests-content']}>
            <h1><span aria-hidden="true">📋 </span>Cererile Mele</h1>
            <button type="button" className={`${ui.button} ${styles['add-request-btn']}`} onClick={() => setIsModalOpen(true)}><span aria-hidden="true">➕</span> Adaugă Cerere Nouă</button>
            <p className={styles['requests-subtitle']}>Istoricul tuturor cererilor tale de puncte</p>
            {error && (
              <div role="alert" className={ui.notice}>
                <p>{error}</p>
                <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={() => void fetchInitialRequests()}>Reîncearcă</button>
              </div>
            )}
            {catalogError && (
              <div role="alert" className={ui.notice}>
                <p>{catalogError}</p>
                <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={retryCatalog}>Reîncearcă încărcarea task-urilor</button>
              </div>
            )}
            <div className={styles['stats-cards']}>
              {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                <div key={status} className={`${styles['stat-card']} ${status === 'all' ? '' : styles[`status-${status}`]}`}>
                  <div className={styles['stat-number']}>{counts[status]}</div>
                  <div className={styles['stat-label']}>{status === 'all' ? totalLabel : statusLabels[status]}</div>
                </div>
              ))}
            </div>
            {hasMore && (
              <p className={styles['requests-subtitle']}>
                Statisticile și filtrele se aplică cererilor încărcate. Încarcă toate cererile pentru istoricul complet.
              </p>
            )}
            <div className={styles['filter-section']}>
              <label htmlFor="request-status">Filtrează după status:</label>
              <select
                id="request-status"
                value={filterStatus}
                onChange={event => {
                  const value = event.target.value;
                  if (value === 'all' || value === 'pending' || value === 'approved' || value === 'rejected' || value === 'cancelled') {
                    setFilterStatus(value);
                  }
                }}
                className={`${ui.field} ${styles['filter-select']}`}
              >
                <option value="all">Toate ({counts.all})</option>
                {(['pending', 'approved', 'rejected', 'cancelled'] as const).map(status => (
                  <option key={status} value={status}>{statusLabels[status]} ({counts[status]})</option>
                ))}
              </select>
            </div>
            <div className={styles['requests-list']}>
              {filtered.length === 0 ? (
                !error && <p className={styles['no-requests']}><span aria-hidden="true">📭 </span>Nu ai cereri {filterStatus === 'all' ? '' : `cu statusul "${filterStatus}"`}</p>
              ) : !catalogError && filtered.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  task={resolveRequestTask(request, tasks)}
                  expanded={expandedCard === request.id}
                  cancelling={cancellingId !== null}
                  onToggle={() => setExpandedCard(expandedCard === request.id ? null : request.id)}
                  onCancel={cancelRequest}
                />
              ))}
            </div>
            {hasMore && (
              <div ref={observerTarget} className={styles['loading-trigger']}>
                {loadingMore && <p className={styles['loading-more-text']} role="status">Se încarcă mai multe...</p>}
                <button type="button" className={`${ui.button} ${ui.secondary}`} disabled={loadingMore || Boolean(error)} onClick={() => void fetchMoreRequests()}>Încarcă mai multe</button>
              </div>
            )}
            {!hasMore && requests.length > 0 && <p className={styles['end-of-list']}>Toate cererile au fost încărcate</p>}
          </div>
        )}
      </div>
      {isModalOpen && (
        <Suspense fallback={<p role="status">Se încarcă formularul...</p>}>
          <RequestModal isOpen onClose={() => setIsModalOpen(false)} onSuccess={() => void fetchInitialRequests()} />
        </Suspense>
      )}
    </main>
  );
}
