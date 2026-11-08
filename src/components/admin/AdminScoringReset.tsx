import { useScoringReset } from '../../hooks/useScoringReset';
import { formatDateTime } from '../../utils';
import ui from '../../styles/ui.module.css';
import styles from './AdminScoringReset.module.css';

export default function AdminScoringReset() {
  const { allowed, reset, loading, busy, error, message, retry, resetAll } = useScoringReset();
  if (!allowed) return null;
  return (
    <section className={`${ui.surface} ${styles.card}`} aria-labelledby="score-reset-title">
      <div className={styles.content}>
        <div className={styles.heading}>
          <h2 id="score-reset-title">Resetare punctaje</h2>
          <span className={styles.scope}>FR / PR / HR / IT</span>
        </div>
        <p className={styles.description}>Toate cele patru clasamente pornesc de la zero. Vor conta aprobările din momentul resetării, inclusiv cererile trimise anterior, dacă evenimentul este din anul academic curent.</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={`${ui.button} ${ui.danger} ${styles.resetButton}`}
          disabled={loading || busy || Boolean(error)} aria-busy={busy} onClick={() => void resetAll()}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" />
          </svg>
          {busy ? 'Se resetează...' : 'Resetează toate punctajele'}
        </button>
        <p className={styles.hint}>Istoricul și punctajele task-urilor se păstrează.</p>
      </div>
      <div className={styles.metadata}>
        {loading ? <p role="status">Se încarcă perioada de punctaj...</p> : reset ? (
          <p><span className={styles.metadataLabel}>Ultima resetare:</span> {formatDateTime(reset.resetAt.toDate())} · {reset.resetBy}</p>
        ) : !error && <p>Nu a fost efectuată nicio resetare manuală.</p>}
        {error && <div className={ui.notice} role="alert"><p>{error}</p><button type="button" className={`${ui.button} ${ui.secondary}`} onClick={retry} disabled={busy}>Reîncearcă</button></div>}
        {message && <p role="status" className={styles.success}>{message}</p>}
      </div>
    </section>
  );
}
