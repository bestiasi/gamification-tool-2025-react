import type { ScoreIssue } from '../utils/scoring';
import ui from '../styles/ui.module.css';

interface Props {
  error: string;
  issues: ScoreIssue[];
  excludedRequests: number;
  retry: () => void;
}

export default function LeaderboardNotices({ error, issues, excludedRequests, retry }: Props) {
  return (
    <div className={ui.notices}>
      {error && (
        <div className={ui.notice} role="alert">
          <p>{error}</p><button type="button" className={`${ui.button} ${ui.secondary}`} onClick={retry}>Reîncearcă</button>
        </div>
      )}
      {excludedRequests > 0 && (
        <p className={ui.notice}>{excludedRequests} cereri excluse din punctaj: fără task asociat în catalogul departamentului.</p>
      )}
      {issues.length > 0 && (
        <div className={ui.notice} role="alert">
          <p>Totaluri provizorii: {issues.length} cereri nu pot fi calculate și necesită verificare.</p>
          <ul>{issues.map(issue => (
            <li key={issue.requestId}>{issue.userEmail} · {issue.requestId}: {issue.reason}</li>
          ))}</ul>
        </div>
      )}
    </div>
  );
}
