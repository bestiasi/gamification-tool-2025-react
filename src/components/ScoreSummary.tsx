import { requestScore } from '../utils/scoring';
import type { ScorableRequest } from '../utils/scoring';
import type { DepartmentTask } from '../models';
import styles from './ScoreSummary.module.css';

export default function ScoreSummary({ request, task }: { request: ScorableRequest; task: DepartmentTask | undefined }) {
  if (request.status !== 'approved') return null;
  const score = requestScore(request, task);
  if (!score.valid) {
    return score.excluded
      ? <p className={styles.summary}>Exclus din punctaj: {score.reason}</p>
      : <p className={styles.summary} role="alert">Punctaj de verificat: {score.reason}</p>;
  }
  return (
    <p className={styles.summary}>
      <strong>Punctaj actual: {score.points}</strong> = {score.repetitions} × {score.basePoints}
    </p>
  );
}
