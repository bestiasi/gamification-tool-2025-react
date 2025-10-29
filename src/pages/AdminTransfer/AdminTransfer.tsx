import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import './AdminTransfer.css';

interface PendingTransfer {
  id: string;
  fromEmail: string;
  toEmail: string;
  department: string;
  createdAt: any;
  expiresAt: any;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
}

function AdminTransfer() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminDepartments, setAdminDepartments] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([]);
  const [incomingTransfers, setIncomingTransfers] = useState<PendingTransfer[]>([]);

  useEffect(() => {
    checkAdminStatus();
    checkIncomingTransfers();
    checkPendingTransfers();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user?.email) return;

    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.email));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        setIsAdmin(true);
        setAdminDepartments(adminData.departments || []);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const checkIncomingTransfers = async () => {
    if (!user?.email) return;

    try {
      const q = query(
        collection(db, 'adminTransfers'),
        where('toEmail', '==', user.email),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      const transfers: PendingTransfer[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const expiresAt = data.expiresAt?.toDate();
        
        // Check if expired
        if (expiresAt && expiresAt > new Date()) {
          transfers.push({ id: doc.id, ...data } as PendingTransfer);
        } else if (expiresAt) {
          // Mark as expired
          updateDoc(doc.ref, { status: 'expired' });
        }
      });

      setIncomingTransfers(transfers);
    } catch (error) {
      console.error('Error checking incoming transfers:', error);
    }
  };

  const checkPendingTransfers = async () => {
    if (!user?.email) return;

    try {
      const q = query(
        collection(db, 'adminTransfers'),
        where('fromEmail', '==', user.email),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      const transfers: PendingTransfer[] = [];
      
      querySnapshot.forEach((doc) => {
        transfers.push({ id: doc.id, ...doc.data() } as PendingTransfer);
      });

      setPendingTransfers(transfers);
    } catch (error) {
      console.error('Error checking pending transfers:', error);
    }
  };

  const handleTransferAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail.trim()) {
      setError('Introdu un email valid');
      return;
    }

    if (!newAdminEmail.endsWith('@bestis.ro')) {
      setError('Emailul trebuie să fie @bestis.ro');
      return;
    }

    if (!selectedDepartment) {
      setError('Selectează un departament');
      return;
    }

    if (newAdminEmail === user?.email) {
      setError('Nu poți transfera către tine însuți');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setGeneratedLink('');

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

      // Generate unique token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      // Create transfer request
      const docRef = await addDoc(collection(db, 'adminTransfers'), {
        fromEmail: user?.email,
        toEmail: newAdminEmail.trim().toLowerCase(),
        department: selectedDepartment,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt,
        status: 'pending',
        token: token
      });

      // Generate acceptance link
      const acceptLink = `${window.location.origin}/accept-transfer?id=${docRef.id}&token=${token}`;

      setGeneratedLink(acceptLink);
      setMessage(`✅ Link de transfer generat cu succes! Copiază și trimite link-ul către ${newAdminEmail}`);
      setNewAdminEmail('');
      setSelectedDepartment('');
      checkPendingTransfers();
    } catch (err: any) {
      setError('Eroare la trimiterea cererii: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTransfer = async (transferId: string) => {
    if (!confirm('Ești sigur că vrei să refuzi acest transfer?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateDoc(doc(db, 'adminTransfers', transferId), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: user?.email
      });

      setMessage('❌ Transfer refuzat.');
      checkIncomingTransfers();
    } catch (err: any) {
      setError('Eroare la refuzarea transferului: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTransfer = async (transferId: string, transfer: PendingTransfer) => {
    setLoading(true);
    setError('');

    try {
      // Check if still valid
      const expiresAt = transfer.expiresAt.toDate();
      if (expiresAt < new Date()) {
        await updateDoc(doc(db, 'adminTransfers', transferId), {
          status: 'expired'
        });
        setError('Cererea a expirat.');
        checkIncomingTransfers();
        return;
      }

      // Add new admin
      const newAdminRef = doc(db, 'admins', transfer.toEmail);
      const newAdminDoc = await getDoc(newAdminRef);
      
      if (newAdminDoc.exists()) {
        const existingDepts = newAdminDoc.data().departments || [];
        if (!existingDepts.includes(transfer.department)) {
          existingDepts.push(transfer.department);
        }
        await updateDoc(newAdminRef, {
          departments: existingDepts,
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(newAdminRef, {
          departments: [transfer.department],
          email: transfer.toEmail,
          createdAt: serverTimestamp()
        });
      }

      // Remove department from old admin
      const oldAdminRef = doc(db, 'admins', transfer.fromEmail);
      const oldAdminDoc = await getDoc(oldAdminRef);
      
      if (oldAdminDoc.exists()) {
        const depts = oldAdminDoc.data().departments || [];
        const updatedDepts = depts.filter((d: string) => d !== transfer.department);
        
        if (updatedDepts.length > 0) {
          await updateDoc(oldAdminRef, {
            departments: updatedDepts,
            updatedAt: serverTimestamp()
          });
        } else {
          // Remove admin doc if no departments left
          await updateDoc(oldAdminRef, {
            departments: [],
            removedAt: serverTimestamp()
          });
        }
      }

      // Mark transfer as accepted
      await updateDoc(doc(db, 'adminTransfers', transferId), {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });

      setMessage(`✅ Ai devenit admin pentru ${transfer.department}!`);
      checkAdminStatus();
      checkIncomingTransfers();
    } catch (err: any) {
      setError('Eroare la acceptarea cererii: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && incomingTransfers.length === 0) {
    return (
      <div className="transfer-page">
        <div className="transfer-container">
          <div className="transfer-content">
            <h1>🚫 Acces Interzis</h1>
            <p>Nu ai permisiuni de administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transfer-page">
      <div className="transfer-container">
        <div className="transfer-content">
          <h1>🔄 Transfer Admin</h1>

          {/* Incoming Transfer Requests */}
          {incomingTransfers.length > 0 && (
            <div className="incoming-transfers">
              <h2>📥 Oferte de Transfer Primite</h2>
              {incomingTransfers.map(transfer => (
                <div key={transfer.id} className="transfer-card">
                  <p><strong>De la:</strong> {transfer.fromEmail}</p>
                  <p><strong>Departament:</strong> {transfer.department}</p>
                  <p><strong>Expiră:</strong> {transfer.expiresAt?.toDate().toLocaleString('ro-RO')}</p>
                  <div className="transfer-actions">
                    <button
                      className="accept-btn"
                      onClick={() => handleAcceptTransfer(transfer.id, transfer)}
                      disabled={loading}
                    >
                      ✅ Acceptă
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleRejectTransfer(transfer.id)}
                      disabled={loading}
                    >
                      ❌ Refuză
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Transfer Form (only for admins) */}
          {isAdmin && (
            <>
              <p className="transfer-subtitle">
                Departamentele tale: {adminDepartments.join(', ')}
              </p>

              <form onSubmit={handleTransferAdmin} className="transfer-form">
                <div className="form-group">
                  <label>Email Nou Admin (@bestis.ro):</label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="email@bestis.ro"
                    className="transfer-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Departament:</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="transfer-select"
                    required
                  >
                    <option value="">Selectează...</option>
                    {adminDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {error && <div className="transfer-error">{error}</div>}
                {message && (
                  <div className="transfer-success">
                    <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>{message}</p>
                    {generatedLink && (
                      <>
                        <div style={{ 
                          background: 'white', 
                          padding: '12px', 
                          borderRadius: '8px', 
                          marginBottom: '10px',
                          wordBreak: 'break-all',
                          fontSize: '0.9rem',
                          color: '#2c3e50',
                          border: '2px solid #FFCC33'
                        }}>
                          {generatedLink}
                        </div>
                        <button 
                          type="button"
                          className="copy-link-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedLink);
                            alert('✅ Link copiat în clipboard!');
                          }}
                        >
                          📋 Copiază Link-ul
                        </button>
                      </>
                    )}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="transfer-button"
                  disabled={loading}
                >
                  {loading ? 'Se generează...' : '� Generează Link de Transfer'}
                </button>
              </form>

              {/* Pending Transfers */}
              {pendingTransfers.length > 0 && (
                <div className="pending-transfers">
                  <h2>📤 Link-uri Generate</h2>
                  {pendingTransfers.map(transfer => (
                    <div key={transfer.id} className="transfer-card">
                      <p><strong>Către:</strong> {transfer.toEmail}</p>
                      <p><strong>Departament:</strong> {transfer.department}</p>
                      <p><strong>Expiră:</strong> {transfer.expiresAt?.toDate().toLocaleString('ro-RO')}</p>
                      <p className="status-pending">⏳ În așteptare de răspuns</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTransfer;
