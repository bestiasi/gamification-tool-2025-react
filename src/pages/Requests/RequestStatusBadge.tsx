import type { RequestStatus } from '../../models';
import styles from './Requests.module.css';

const labels: Record<RequestStatus, string> = {
  pending: 'În așteptare',
  approved: 'Aprobat',
  rejected: 'Respins',
  cancelled: 'Anulat',
};

export default function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`${styles['status-badge']} ${styles[`status-${status}`]}`}>
      {labels[status]}
    </span>
  );
}
