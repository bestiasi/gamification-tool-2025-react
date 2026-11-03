import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { acceptTransfer, getTransferById, rejectTransfer } from '../../services/transferService';
import type { AdminTransfer } from '../../models';
import { formatDateTime } from '../../utils';
import './AcceptTransfer.css';

export default function AcceptTransfer() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get('id') ?? '';
  const token = params.get('token') ?? '';
  const [transfer, setTransfer] = useState<AdminTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState<'accepted' | 'rejected' | null>(null);
  const [revision, setRevision] = useState(0);
  const running = useRef(false);
  const validationRevision = useRef(0);
  const invalidateValidation = useCallback(() => { validationRevision.current++; }, []);

  useEffect(() => {
    if (!outcome) return;
    const timer = window.setTimeout(() => navigate(outcome === 'accepted' ? '/admin' : '/'), 3000);
    return () => window.clearTimeout(timer);
  }, [outcome, navigate]);

  useEffect(() => {
    invalidateValidation();
    let active = true;
    setTransfer(null);
    setError('');
    setOutcome(null);
    if (!id || id.includes('/') || !token) {
      setError('Link invalid - lipsește ID-ul sau token-ul.');
      setLoading(false);
      return;
    }
    setLoading(true);
    getTransferById(id, token).then(transfer => {
      if (active) setTransfer(transfer);
    }).catch((error: unknown) => {
      console.error('Error validating transfer:', error);
      if (active) setError(error instanceof Error ? error.message : 'Transferul nu a putut fi verificat.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; invalidateValidation(); };
  }, [id, token, user?.uid, revision, invalidateValidation]);

  const respond = async (outcome: 'accepted' | 'rejected') => {
    if (running.current) return;
    running.current = true;
    const currentRevision = validationRevision.current;
    setBusy(true);
    setError('');
    try {
      if (outcome === 'accepted') await acceptTransfer(id, token);
      else await rejectTransfer(id, token);
      if (currentRevision === validationRevision.current) setOutcome(outcome);
    } catch (error) {
      console.error('Error responding to transfer:', error);
      if (currentRevision === validationRevision.current) {
        setError(error instanceof Error ? error.message : 'Transferul nu a putut fi procesat.');
      }
    } finally {
      running.current = false;
      setBusy(false);
    }
  };

  return (
    <main className="accept-transfer-page">
      <div className="accept-transfer-container"><div className="accept-transfer-content">
        {loading ? <p role="status">Se verifică link-ul de transfer...</p> : outcome ? <>
          <h1>{outcome === 'accepted' ? 'Transfer acceptat' : 'Transfer refuzat'}</h1>
          <p role="status">{outcome === 'accepted' ? 'Permisiunile au fost transferate.' : 'Permisiunile expeditorului nu s-au schimbat.'}</p>
          <button type="button" className="back-button" onClick={() => navigate(outcome === 'accepted' ? '/admin' : '/')}>Continuă</button>
        </> : <>
          <h1>Transfer Admin</h1>
          {error && <div role="alert" className="transfer-error">
            <p>{error}</p>
            <button type="button" onClick={() => setRevision(value => value + 1)} disabled={busy}>Reîncearcă verificarea</button>
          </div>}
          {transfer && !error && <>
            <div className="transfer-details">
              <p>De la: {transfer.fromEmail}</p><p>Către: {transfer.toEmail}</p>
              <p>Departament: {transfer.department}</p><p>Expiră: {formatDateTime(transfer.expiresAt)}</p>
            </div>
            <p>Prin acceptare primești rolul, iar expeditorul pierde departamentul transferat.</p>
            <button type="button" className="accept-button" disabled={busy} onClick={() => void respond('accepted')}>Acceptă Oferta</button>
            <button type="button" className="cancel-button" disabled={busy} onClick={() => void respond('rejected')}>Refuză Oferta</button>
          </>}
          <button type="button" className="back-button" disabled={busy} onClick={() => navigate('/')}>Înapoi</button>
        </>}
      </div></div>
    </main>
  );
}
