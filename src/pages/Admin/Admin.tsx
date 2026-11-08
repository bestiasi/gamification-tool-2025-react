import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import AdminRequests from '../../components/admin/AdminRequests';
import AdminTasks from '../../components/admin/AdminTasks';
import AdminSecretaries from '../../components/admin/AdminSecretaries';
import AdminTransfer from '../AdminTransfer/AdminTransfer';
import './Admin.css';

type AdminTab = 'requests' | 'tasks' | 'secretaries' | 'transfer';

export default function Admin() {
  const { isAdmin, isSecretary, departments } = useAuth();
  const [tab, setTab] = useState<AdminTab>('requests');
  useEffect(() => { if (!isAdmin) setTab('requests'); }, [isAdmin]);

  return (
    <main className="admin-page">
      <div className="admin-container"><div className="admin-content">
        {!isAdmin && !isSecretary ? (
          <><h1>Acces Interzis</h1><p>Nu ai permisiuni de administrator.</p></>
        ) : (
          <>
            <h1>Panou {isAdmin ? 'Admin' : 'Secretar'}</h1>
            <p className="admin-subtitle">Rol: <strong>{isAdmin ? 'Administrator' : 'Secretar'}</strong> | Departamente: {departments.join(', ')}</p>
            <nav className="admin-tabs" aria-label="Secțiuni administrare">
              <button type="button" className={`tab-btn ${tab === 'requests' ? 'active' : ''}`} aria-pressed={tab === 'requests'} onClick={() => setTab('requests')}>REQUESTS</button>
              {isAdmin && <>
                <button type="button" className={`tab-btn ${tab === 'tasks' ? 'active' : ''}`} aria-pressed={tab === 'tasks'} onClick={() => setTab('tasks')}>TASKS</button>
                <button type="button" className={`tab-btn ${tab === 'secretaries' ? 'active' : ''}`} aria-pressed={tab === 'secretaries'} onClick={() => setTab('secretaries')}>SECRETARI</button>
                <button type="button" className={`tab-btn ${tab === 'transfer' ? 'active' : ''}`} aria-pressed={tab === 'transfer'} onClick={() => setTab('transfer')}>TRANSFER</button>
              </>}
            </nav>
            <div hidden={tab !== 'requests'}><AdminRequests active={tab === 'requests'} /></div>
            {isAdmin && <>
              <div hidden={tab !== 'tasks'}><AdminTasks active={tab === 'tasks'} /></div>
              <section className="tab-content" hidden={tab !== 'secretaries'}><AdminSecretaries active={tab === 'secretaries'} /></section>
              <section className="tab-content" hidden={tab !== 'transfer'}>
                <p><Link to="/admin/setup">Acordă acces de administrator</Link></p>
                {tab === 'transfer' && <AdminTransfer embedded />}
              </section>
            </>}
          </>
        )}
      </div></div>
    </main>
  );
}
