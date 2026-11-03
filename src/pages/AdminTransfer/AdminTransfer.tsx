import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import {
  acceptTransfer, createTransferRequest, getIncomingTransfers, getPendingTransfers, rejectTransfer,
} from '../../services/transferService';
import type { AdminTransfer as Transfer, Department } from '../../models';
import { buildAcceptanceLink, formatDateTime } from '../../utils';
import './AdminTransfer.css';

export default function AdminTransfer({ embedded = false }: { embedded?: boolean }) {
  const { user, isAdmin, departments } = useAuth();
  const [incoming, setIncoming] = useState<Transfer[]>([]);
  const [outgoing, setOutgoing] = useState<Transfer[]>([]);
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<Department | ''>('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const running = useRef(false);
  const transferable = departments.includes('GENERAL') ? departments.filter(value => value === 'GENERAL') : departments;

  useEffect(() => {
    let active = true;
    setIncoming([]);
    setOutgoing([]);
    setLoading(true);
    setError('');
    if (!user?.email) {
      setLoading(false);
      setError('Autentificarea este obligatorie.');
      return;
    }
    Promise.all([
      getIncomingTransfers(user.email),
      isAdmin ? getPendingTransfers(user.email) : Promise.resolve([]),
    ]).then(([received, sent]) => {
      if (active) { setIncoming(received); setOutgoing(sent); }
    }).catch((error: unknown) => {
      console.error('Error loading transfers:', error);
      if (active) setError(error instanceof Error ? error.message : 'Transferurile nu au putut fi încărcate.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.uid, user?.email, isAdmin, revision]);

  const perform = async (operation: () => Promise<string>) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      setMessage(await operation());
      setRevision(value => value + 1);
    } catch (error) {
      console.error('Transfer operation failed:', error);
      setError(error instanceof Error ? error.message : 'Operația de transfer a eșuat.');
    } finally {
      running.current = false;
      setBusy(false);
    }
  };

  const create = (event: React.FormEvent) => {
    event.preventDefault();
    void perform(async () => {
      if (!user?.email || !department) throw new Error('Selectează un departament.');
      const result = await createTransferRequest(user.email, { toEmail: email, department });
      setGeneratedLink(buildAcceptanceLink(window.location.origin, result.transferId, result.token));
      setEmail('');
      setDepartment('');
      return 'Link de transfer generat. Trimite-l destinatarului.';
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setMessage('Link copiat în clipboard.');
    } catch (error) {
      console.error('Error copying transfer link:', error);
      setError('Link-ul nu a putut fi copiat. Selectează-l și copiază-l manual.');
    }
  };

  const content = (
    <>
      {embedded ? <h2>Transfer Admin</h2> : <h1>Transfer Admin</h1>}
      {error && <div role="alert" className="transfer-error">
        <p>{error}</p>
        <button type="button" onClick={() => setRevision(value => value + 1)} disabled={busy}>Reîncearcă încărcarea</button>
      </div>}
      {message && <p role="status" className="transfer-success">{message}</p>}
      {loading ? <p role="status">Se încarcă transferurile...</p> : (
        <section className="incoming-transfers">
          <h3>Oferte primite</h3>
          {!error && incoming.length === 0 && <p>Nu ai oferte de transfer în așteptare.</p>}
          {incoming.map(transfer => (
            <div key={transfer.id} className="transfer-card">
              <p>De la: {transfer.fromEmail}</p>
              <p>Departament: {transfer.department}</p>
              <p>Expiră: {formatDateTime(transfer.expiresAt)}</p>
              <div className="transfer-actions">
                <button type="button" className="accept-btn" disabled={busy} onClick={() => void perform(async () => {
                  await acceptTransfer(transfer.id);
                  return `Transfer acceptat pentru ${transfer.department}.`;
                })}>Acceptă</button>
                <button type="button" className="reject-btn" disabled={busy} onClick={() => {
                  if (window.confirm('Refuzi acest transfer?')) void perform(async () => {
                    await rejectTransfer(transfer.id);
                    return 'Transfer refuzat.';
                  });
                }}>Refuză</button>
              </div>
            </div>
          ))}
        </section>
      )}
      {isAdmin && <>
        <form className="transfer-form" onSubmit={create}>
          <h3>Transferă rolul de administrator</h3>
          <label htmlFor="transfer-email">Email destinatar (@bestis.ro)</label>
          <input id="transfer-email" type="email" className="transfer-input" required value={email}
            onChange={event => setEmail(event.target.value)} disabled={busy} />
          <label htmlFor="transfer-department">Departament</label>
          <select id="transfer-department" className="transfer-select" required value={department} disabled={busy}
            onChange={event => setDepartment(transferable.find(value => value === event.target.value) ?? '')}>
            <option value="">Selectează...</option>
            {transferable.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <button type="submit" className="transfer-button" disabled={busy}>{busy ? 'Se procesează...' : 'Generează Link de Transfer'}</button>
        </form>
        {generatedLink && <div className="transfer-success">
          <p style={{ overflowWrap: 'anywhere' }}>{generatedLink}</p>
          <button type="button" className="copy-link-btn" onClick={() => void copyLink()}>Copiază Link-ul</button>
        </div>}
        {!loading && outgoing.length > 0 && <section className="pending-transfers">
          <h3>Link-uri generate</h3>
          {outgoing.map(transfer => <div key={transfer.id} className="transfer-card">
            <p>Către: {transfer.toEmail}</p><p>Departament: {transfer.department}</p>
            <p>Expiră: {formatDateTime(transfer.expiresAt)}</p>
          </div>)}
        </section>}
      </>}
    </>
  );
  return embedded ? <section>{content}</section> : (
    <main className="transfer-page"><div className="transfer-container"><div className="transfer-content">{content}</div></div></main>
  );
}
