import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { db } from '../firebase/config';
import { resetScores, subscribeToScoringReset } from '../services/scoringResetService';
import type { ScoringReset } from '../services/scoringResetService';

export function useScoringReset() {
  const { user, isAdmin, departments } = useAuth();
  const allowed = isAdmin && departments.includes('IT');
  const [reset, setReset] = useState<ScoringReset | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const submitting = useRef(false);
  const generation = useRef(0);
  const invalidate = useCallback(() => { generation.current++; }, []);
  const retry = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    invalidate();
    setReset(null); setError(''); setMessage(''); setLoading(allowed);
    if (!allowed) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    const fail = (error: Error) => {
      console.error('Error reading score reset:', error);
      if (active) { setError(error.message); setLoading(false); }
    };
    try {
      unsubscribe = subscribeToScoringReset(db, value => {
        if (!active) return;
        setReset(value); setLoading(false); setError('');
      }, fail);
    } catch (error) { fail(error instanceof Error ? error : new Error(String(error))); }
    return () => { active = false; unsubscribe?.(); invalidate(); };
  }, [allowed, user?.uid, revision, invalidate]);

  const resetAll = async () => {
    if (submitting.current) return;
    setError(''); setMessage('');
    if (!allowed || !user?.email) {
      setError('Resetarea este permisă doar administratorilor cu IT atribuit explicit.');
      return;
    }
    if (!window.confirm('Resetezi toate cele patru clasamente? Vor conta doar cererile aprobate din acest moment. Istoricul și task-urile se păstrează.')) return;
    submitting.current = true;
    const current = generation.current;
    setBusy(true);
    try {
      await resetScores(db, user.email);
      if (current === generation.current) setMessage('Clasamentele au fost resetate. Se numără doar aprobările din noua perioadă.');
    } catch (error) {
      console.error('Error resetting scores:', error);
      if (current === generation.current) setError(error instanceof Error ? error.message : 'Punctajele nu au putut fi resetate.');
    } finally { submitting.current = false; setBusy(false); }
  };

  return { allowed, reset, loading, busy, error, message, retry, resetAll };
}
