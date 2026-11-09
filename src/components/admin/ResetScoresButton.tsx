import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { db } from '../../firebase/config';
import { resetScores } from '../../services/scoringResetService';
import ui from '../../styles/ui.module.css';

export default function ResetScoresButton() {
  const { user, isAdmin, departments } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const submitting = useRef(false);
  const allowed = isAdmin && departments.includes('IT');

  const reset = async () => {
    if (submitting.current) return;
    setError(''); setMessage('');
    if (!allowed || !user?.email) {
      setError('Resetarea este permisă doar administratorilor IT.');
      return;
    }
    if (!window.confirm('Resetezi toate clasamentele, inclusiv GENERAL? Vor conta doar aprobările din acest moment. Istoricul și task-urile se păstrează.')) return;
    submitting.current = true;
    setBusy(true);
    try {
      await resetScores(db, user.email);
      setMessage('Clasamentele au fost resetate. Se numără aprobările din acest moment.');
    } catch (error) {
      console.error('Error resetting scores:', error);
      setError(error instanceof Error ? error.message : 'Punctajele nu au putut fi resetate.');
    } finally { submitting.current = false; setBusy(false); }
  };

  if (!allowed) return null;
  return (
    <div className="admin-subtitle">
      <button type="button" className={`${ui.button} ${ui.danger}`} disabled={busy} onClick={() => void reset()}>
        {busy ? 'Se resetează...' : 'Resetează toate punctajele'}
      </button>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
