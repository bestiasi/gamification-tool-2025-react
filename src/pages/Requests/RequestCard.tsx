import type { DepartmentTask, PointRequest } from '../../models';
import ScoreSummary from '../../components/ScoreSummary';
import { formatDate, formatDateTime } from '../../utils';
import RequestStatusBadge from './RequestStatusBadge';
import ui from '../../styles/ui.module.css';
import styles from './Requests.module.css';

interface Props {
  request: PointRequest;
  task: DepartmentTask | undefined;
  expanded: boolean;
  cancelling: boolean;
  onToggle: () => void;
  onCancel: (requestId: string) => void;
}

export default function RequestCard({ request, task, expanded, cancelling, onToggle, onCancel }: Props) {
  return (
    <article className={`${styles['request-card']} ${styles[`status-${request.status}`]} ${expanded ? styles.expanded : ''}`}>
      <button
        type="button"
        className={`${styles['request-header']} ${styles['request-toggle']}`}
        aria-expanded={expanded}
        aria-controls={`request-${request.id}`}
        onClick={onToggle}
      >
        <span className={styles['request-dept']}>{request.department}</span>
        <span className={styles['request-header-right']}>
          <RequestStatusBadge status={request.status} />
          <span className={styles['expand-icon']} aria-hidden="true">{expanded ? '▼' : '▶'}</span>
        </span>
      </button>
      <div className={styles['request-body']} id={`request-${request.id}`}>
        <p className={styles['request-task']}>
          {task?.description ?? 'Task indisponibil'}
        </p>
        <ScoreSummary request={request} task={task} />
        <p className={styles['request-number']}>
          {expanded ? <><strong>Repetări:</strong> {request.taskNumber}</> : `${request.taskNumber}x`}
        </p>
        <p className={styles['request-event-date']}>
          {expanded ? <strong>Data Eveniment:</strong> : 'Data:'} {formatDate(request.eventDate)}
        </p>
        {!expanded && request.adminComment && request.status !== 'pending' && (
          <div className={styles['admin-comment-preview']}>
            {request.adminComment.slice(0, 60)}{request.adminComment.length > 60 ? '...' : ''}
          </div>
        )}
        {expanded && (
          <>
            {request.proofUrl && (
              <div className={styles['request-proof']}>
                <strong>Dovadă:</strong>
                <a href={request.proofUrl} target="_blank" rel="noopener noreferrer" className={`${ui.button} ${ui.secondary} ${styles['proof-link']}`}>
                  Vezi Dovada
                </a>
              </div>
            )}
            {request.details && <p className={styles['request-details-full']}><strong>Detalii:</strong> {request.details}</p>}
            <p className={styles['request-date']}><strong>Data cererii:</strong> {formatDateTime(request.createdAt)}</p>
            {request.reviewedBy && (
              <p className={styles['request-reviewed']}>
                <strong>Revizuit de:</strong> {request.reviewedBy}
                {request.reviewedAt && ` • ${formatDateTime(request.reviewedAt)}`}
              </p>
            )}
            {request.adminComment && (
              <div className={styles['admin-comment']}>
                <strong>
                  {request.status === 'approved' ? 'Mesaj Admin:' : request.status === 'rejected' ? 'Motiv Respingere:' : 'Comentariu Admin:'}
                </strong>
                <p>{request.adminComment}</p>
              </div>
            )}
          </>
        )}
      </div>
      {request.status === 'pending' && expanded && (
        <div className={styles['request-actions']}>
          <button type="button" className={`${ui.button} ${ui.danger} ${styles['cancel-request-btn']}`} disabled={cancelling} onClick={() => onCancel(request.id)}>
            {cancelling ? 'Se anulează...' : 'Anulează Cererea'}
          </button>
        </div>
      )}
    </article>
  );
}
