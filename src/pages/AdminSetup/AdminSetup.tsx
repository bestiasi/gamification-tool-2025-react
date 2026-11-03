import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { accessibleDepartments } from '../../constants/departments';
import type { Department } from '../../models';
import { grantAdminRole } from '../../services/authService';
import './AdminSetup.css';

function AdminSetup() {
  const { isAdmin, departments: assigned } = useAuth();
  const available = accessibleDepartments(assigned);
  const [email, setEmail] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const busy = useRef(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (!isAdmin || departments.some(department => !available.includes(department))) {
        throw new Error('Poți acorda acces doar pentru departamentele administrate.');
      }
      await grantAdminRole(email.trim().toLowerCase(), departments);
      setMessage('Accesul de administrator a fost acordat.');
      setEmail('');
      setDepartments([]);
    } catch (error) {
      console.error('Error granting admin role:', error);
      setError(error instanceof Error ? error.message : 'Accesul nu a putut fi acordat.');
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };

  return (
    <main className="setup-page">
      <div className="setup-container"><div className="setup-content">
        <h1>Gestionare administratori</h1>
        {!isAdmin ? <p role="alert">Accesul este rezervat administratorilor cu departamente atribuite.</p> : (
          <>
            <p className="setup-subtitle">Acordă acces doar pentru departamentele pe care le administrezi. Accesul existent se păstrează.</p>
            <form onSubmit={submit} className="setup-form">
              <div className="form-group">
                <label htmlFor="admin-email">Email administrator (@bestis.ro)</label>
                <input id="admin-email" type="email" value={email} onChange={event => setEmail(event.target.value)}
                  className="setup-input" required disabled={loading} />
              </div>
              <fieldset disabled={loading}>
                <legend>Departamente</legend>
                <div className="departments-grid">{available.map(department => (
                  <button key={department} type="button" aria-pressed={departments.includes(department)}
                    className={`dept-btn ${departments.includes(department) ? 'selected' : ''}`}
                    onClick={() => setDepartments(current => current.includes(department)
                      ? current.filter(value => value !== department) : [...current, department])}>
                    {department}
                  </button>
                ))}</div>
              </fieldset>
              {error && <p className="setup-error" role="alert">{error}</p>}
              {message && <p className="setup-success" role="status">{message}</p>}
              <button type="submit" className="setup-button" disabled={loading || !departments.length}>
                {loading ? 'Se salvează...' : 'Acordă acces'}
              </button>
            </form>
          </>
        )}
      </div></div>
    </main>
  );
}

export default AdminSetup;
