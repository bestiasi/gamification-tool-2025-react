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
import { auth, db } from '../firebase/config';
import './AdminTransfer.css';

interface PendingTransfer {
  id: string;
  fromEmail: string;
  toEmail: string;
  department: string;
  createdAt: any;
  expiresAt: any;
  status: 'pending' | 'accepted' | 'expired';
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
    
    if (!newAdminEmail.endsWith('@bestis.ro')) {
      setError('Emailul trebuie să fie @bestis.ro');
      return;
    }

    if (!selectedDepartment) {
      setError('Selectează un departament');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

      // Create transfer request
      await addDoc(collection(db, 'adminTransfers'), {
        fromEmail: user?.email,
        toEmail: newAdminEmail,
        department: selectedDepartment,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt,
        status: 'pending'
      });

      // TODO: Send email notification to newAdminEmail
      // You'll need to implement Firebase Cloud Functions for sending emails

      setMessage(`✅ Cerere de transfer trimisă către ${newAdminEmail}. Valabilă 1 oră.`);
      setNewAdminEmail('');
      setSelectedDepartment('');
      checkPendingTransfers();
    } catch (err: any) {
      setError('Eroare la trimiterea cererii: ' + err.message);
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
              <h2>📥 Cereri Primite</h2>
              {incomingTransfers.map(transfer => (
                <div key={transfer.id} className="transfer-card">
                  <p><strong>De la:</strong> {transfer.fromEmail}</p>
                  <p><strong>Departament:</strong> {transfer.department}</p>
                  <p><strong>Expiră:</strong> {transfer.expiresAt?.toDate().toLocaleString('ro-RO')}</p>
                  <button
                    className="accept-btn"
                    onClick={() => handleAcceptTransfer(transfer.id, transfer)}
                    disabled={loading}
                  >
                    ✅ Acceptă
                  </button>
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
                {message && <div className="transfer-success">{message}</div>}

                <button 
                  type="submit" 
                  className="transfer-button"
                  disabled={loading}
                >
                  {loading ? 'Se trimite...' : '📤 Trimite Cerere'}
                </button>
              </form>

              {/* Pending Transfers */}
              {pendingTransfers.length > 0 && (
                <div className="pending-transfers">
                  <h2>📤 Cereri Trimise</h2>
                  {pendingTransfers.map(transfer => (
                    <div key={transfer.id} className="transfer-card">
                      <p><strong>Către:</strong> {transfer.toEmail}</p>
                      <p><strong>Departament:</strong> {transfer.department}</p>
                      <p><strong>Expiră:</strong> {transfer.expiresAt?.toDate().toLocaleString('ro-RO')}</p>
                      <p className="status-pending">⏳ În așteptare</p>
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
