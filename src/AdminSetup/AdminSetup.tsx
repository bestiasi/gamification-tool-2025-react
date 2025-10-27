import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import './AdminSetup.css';

function AdminSetup() {
  const [email, setEmail] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const availableDepartments = ['HR', 'PR', 'IT', 'FR', 'GENERAL'];

  const toggleDepartment = (dept: string) => {
    if (departments.includes(dept)) {
      setDepartments(departments.filter(d => d !== dept));
    } else {
      setDepartments([...departments, dept]);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.endsWith('@bestis.ro')) {
      setError('Email-ul trebuie să fie @bestis.ro');
      return;
    }

    if (departments.length === 0) {
      setError('Selectează cel puțin un departament');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await setDoc(doc(db, 'admins', email), {
        email: email,
        departments: departments,
        createdAt: serverTimestamp()
      });

      setMessage(`✅ Admin creat cu succes! ${email} are acces la: ${departments.join(', ')}`);
      setEmail('');
      setDepartments([]);
    } catch (err: any) {
      setError('Eroare: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page">
      <div className="setup-container">
        <div className="setup-content">
          <h1>🔧 Setup Admin</h1>
          <p className="setup-subtitle">
            Creează primul admin pentru sistemul de gamificare
          </p>

          <div className="warning-box">
            <h3>⚠️ Atenție!</h3>
            <p>Această pagină ar trebui folosită doar pentru setup inițial.</p>
            <p>După ce creezi primul admin GENERAL, folosește pagina /admin/transfer pentru a adăuga alți admini.</p>
          </div>

          <form onSubmit={handleCreateAdmin} className="setup-form">
            <div className="form-group">
              <label>Email Admin (@bestis.ro):</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bestis.ro"
                className="setup-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Departamente:</label>
              <div className="departments-grid">
                {availableDepartments.map(dept => (
                  <button
                    key={dept}
                    type="button"
                    className={`dept-btn ${departments.includes(dept) ? 'selected' : ''}`}
                    onClick={() => toggleDepartment(dept)}
                  >
                    {dept}
                    {dept === 'GENERAL' && <span className="general-badge">Toate</span>}
                  </button>
                ))}
              </div>
              <p className="helper-text">
                💡 Recomandare: Selectează GENERAL pentru primul admin
              </p>
            </div>

            {error && <div className="setup-error">{error}</div>}
            {message && <div className="setup-success">{message}</div>}

            <button 
              type="submit" 
              className="setup-button"
              disabled={loading}
            >
              {loading ? 'Se creează...' : '✨ Creează Admin'}
            </button>
          </form>

          <div className="info-box">
            <h3>📋 Cum funcționează?</h3>
            <ul>
              <li><strong>GENERAL</strong>: Acces la toate departamentele (HR, PR, IT, FR)</li>
              <li><strong>HR/PR/IT/FR</strong>: Acces doar la departamentul respectiv</li>
              <li>Poți selecta multiple departamente pentru un admin</li>
              <li>După setup, folosește /admin/transfer pentru a adăuga alți admini</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSetup;
