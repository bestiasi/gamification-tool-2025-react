import { useState } from 'react';
import { useRequestModeration } from '../../hooks/useRequestModeration';
import { resolveRequestTask } from '../../utils/scoring';
import { formatDate, formatDateTime } from '../../utils';
import ScoreSummary from '../ScoreSummary';

export default function AdminRequests({ active = true }: { active?: boolean } = {}) {
  const controller = useRequestModeration(active);
  const { requests, catalog, filtered, status, department, search, reviewing, comment, error, busy } = controller;
  const [expanded, setExpanded] = useState<string | null>(null);
  const loading = requests.loading || catalog.loading;
  const readError = requests.error || catalog.error;

  return (
    <section className="tab-content" aria-label="Moderare cereri">
      <div className="admin-filters">
        <div className="filter-group">
          <label htmlFor="review-status">Status</label>
          <select id="review-status" className="admin-select" value={status} onChange={event => {
            const value = event.target.value;
            if (value === 'pending' || value === 'approved' || value === 'rejected') controller.setStatus(value);
          }}>
            <option value="pending">În așteptare</option><option value="approved">Aprobate</option><option value="rejected">Respinse</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="review-department">Departament</label>
          <select id="review-department" className="admin-select" value={department} onChange={event => controller.setDepartment(event.target.value)}>
            <option value="all">Toate</option>
            {controller.availableDepartments.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="review-search">Caută</label>
          <input id="review-search" className="admin-select search-input" value={search}
            placeholder="Nume utilizator sau task..." onChange={event => controller.setSearch(event.target.value)} />
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="requests-list">
        {loading ? <p role="status">Se încarcă cererile și task-urile...</p> : readError ? (
          <div role="alert"><p>{readError}</p><button type="button" onClick={() => {
            if (requests.error) void requests.fetchRequests();
            if (catalog.error) catalog.retry();
          }}>Reîncearcă încărcarea</button></div>
        ) : filtered.length === 0 ? <p className="no-requests">Nu există cereri.</p> : filtered.map(request => {
          const isExpanded = expanded === request.id;
          const isReviewing = reviewing === request.id;
          const task = resolveRequestTask(request, catalog.tasks);
          const canReview = controller.canReview(request);
          return (
            <article key={request.id} className={`request-card ${isExpanded ? 'expanded' : ''}`}>
              <button type="button" className="request-header request-toggle" aria-expanded={isExpanded}
                aria-controls={`admin-request-${request.id}`} onClick={() => setExpanded(isExpanded ? null : request.id)}>
                <span className="request-user">{controller.nameOf(request)}</span>
                <span className="request-header-right"><span className="request-dept">{request.department}</span>
                  <span className="expand-icon" aria-hidden="true">{isExpanded ? '▼' : '▶'}</span>
                </span>
              </button>
              <div className="request-body">
                <p className="request-task">{task?.description ?? 'Task indisponibil'}</p>
                <ScoreSummary request={request} task={task} />
                <div id={`admin-request-${request.id}`} hidden={!isExpanded}>
                  <p className="request-number"><strong>Repetări:</strong> {request.taskNumber}</p>
                  <p className="request-event-date"><strong>Data Eveniment:</strong> {formatDate(request.eventDate)}</p>
                  {request.proofUrl && <p className="request-proof"><strong>Dovadă:</strong> <a className="proof-link"
                    href={request.proofUrl} target="_blank" rel="noopener noreferrer">Vezi dovada</a></p>}
                  {request.details && <p className="request-details-full"><strong>Detalii:</strong> {request.details}</p>}
                  <p className="request-date"><strong>Email:</strong> {request.userEmail}</p>
                  <p className="request-date"><strong>Data cererii:</strong> {formatDateTime(request.createdAt)}</p>
                  {request.reviewedBy && <p className="request-reviewed"><strong>Revizuit de:</strong> {request.reviewedBy}
                    {request.reviewedAt && ` • ${formatDateTime(request.reviewedAt)}`}</p>}
                  {request.adminComment && <div className={`admin-comment ${status}`}><strong>Comentariu:</strong><p>{request.adminComment}</p></div>}
                </div>
                {!isExpanded && <>
                  <p className="request-number">{request.taskNumber}x</p>
                  <p className="request-event-date">{formatDate(request.eventDate)}</p>
                </>}
              </div>
              {status === 'pending' && !canReview && <p>Propria cerere trebuie revizuită de alt responsabil al departamentului.</p>}
              {status === 'pending' && canReview && (!isReviewing ? (
                <div className="quick-actions">
                  <button type="button" className="quick-approve-btn" onClick={() => {
                    controller.setReviewing(request.id); controller.setComment(''); setExpanded(request.id);
                  }}>Aprobă / Respinge</button>
                </div>
              ) : (
                <div className="review-section">
                  <label htmlFor={`review-comment-${request.id}`} className="review-label">Comentariu (obligatoriu pentru respingere)</label>
                  <textarea id={`review-comment-${request.id}`} className="review-textarea" value={comment}
                    onChange={event => controller.setComment(event.target.value)} rows={3} disabled={busy} autoFocus />
                  <div className="review-form-actions">
                    <button type="button" className="approve-btn" disabled={busy} onClick={() => void controller.review(request, 'approved')}>Confirmă Aprobare</button>
                    <button type="button" className="reject-btn" disabled={busy} onClick={() => void controller.review(request, 'rejected')}>Confirmă Respingere</button>
                    <button type="button" className="cancel-review-btn" disabled={busy} onClick={() => {
                      controller.setReviewing(null); controller.setComment('');
                    }}>Anulează</button>
                  </div>
                </div>
              ))}
            </article>
          );
        })}
      </div>
    </section>
  );
}
