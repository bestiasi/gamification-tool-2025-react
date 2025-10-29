import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import './AcceptTransfer.css';

function AcceptTransfer() {
  const [user] = useAuthState(auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [transfer, setTransfer] = useState<any>(null);

  const transferId = searchParams.get('id');
  const token = searchParams.get('token');

  useEffect(() => {
    if (user && transferId && token) {
      validateTransfer();
    }
  }, [user, transferId, token]);

  const validateTransfer = async () => {
    if (!transferId || !token) {
      setError('Link invalid - lipsește ID-ul sau token-ul.');
      setLoading(false);
      return;
    }

    try {
      const transferDoc = await getDoc(doc(db, 'adminTransfers', transferId));
      
      if (!transferDoc.exists()) {
        setError('Cererea de transfer nu a fost găsită.');
        setLoading(false);
        return;
      }

      const transferData = transferDoc.data();

      // Verify token
      if (transferData.token !== token) {
        setError('Token invalid. Link-ul este incorect.');
        setLoading(false);
        return;
      }

      // Check if expired
      const expiresAt = transferData.expiresAt?.toDate();
      if (expiresAt && expiresAt < new Date()) {
        await updateDoc(doc(db, 'adminTransfers', transferId), {
          status: 'expired'
        });
        setError('Link-ul a expirat. Cere un link nou de la adminul curent.');
        setLoading(false);
        return;
      }

      // Check if already accepted
      if (transferData.status === 'accepted') {
        setError('Acest transfer a fost deja acceptat.');
        setLoading(false);
        return;
      }

      // Verify user email matches
      if (user?.email !== transferData.toEmail) {
        setError(`Trebuie să fii logat cu emailul ${transferData.toEmail} pentru a accepta acest transfer. Actualmente ești logat cu ${user?.email}.`);
        setLoading(false);
        return;
      }

      // All validations passed
      setTransfer({
        id: transferId,
        ...transferData
      });
      setLoading(false);
    } catch (err: any) {
      setError('Eroare la verificarea transferului: ' + err.message);
      setLoading(false);
    }
  };

  const handleRejectTransfer = async () => {
    setAccepting(true);
    setError('');

    try {
      await updateDoc(doc(db, 'adminTransfers', transferId!), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: user?.email
      });

      setMessage(`❌ Transfer refuzat. Adminul ${transfer.fromEmail} va rămâne responsabil pentru departamentul ${transfer.department}.`);
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setError('Eroare la refuzarea transferului: ' + err.message);
    } finally {
      setAccepting(false);
    }
  };

  const handleAcceptTransfer = async () => {
    setAccepting(true);
    setError('');

    try {
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
      await updateDoc(doc(db, 'adminTransfers', transferId!), {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });

      setMessage(`✅ Transfer acceptat cu succes! Ai devenit admin pentru departamentul ${transfer.department}.`);
      
      // Redirect to admin panel after 3 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 3000);
    } catch (err: any) {
      setError('Eroare la acceptarea transferului: ' + err.message);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="accept-transfer-page">
        <div className="accept-transfer-container">
          <div className="accept-transfer-content">
            <h1>⏳ Se verifică...</h1>
            <p>Se validează link-ul de transfer...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="accept-transfer-page">
        <div className="accept-transfer-container">
          <div className="accept-transfer-content">
            <h1>❌ Eroare</h1>
            <div className="transfer-error">{error}</div>
            <button 
              className="back-button"
              onClick={() => navigate('/admin')}
            >
              🏠 Înapoi la Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="accept-transfer-page">
        <div className="accept-transfer-container">
          <div className="accept-transfer-content">
            <h1>✅ Success</h1>
            <div className="transfer-success">{message}</div>
            <p className="redirect-message">Vei fi redirecționat către panoul de admin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="accept-transfer-page">
      <div className="accept-transfer-container">
        <div className="accept-transfer-content">
          <h1>🔄 Ofertă de Transfer Admin</h1>
          
          <div className="transfer-details">
            <p><strong>De la:</strong> {transfer?.fromEmail}</p>
            <p><strong>Departament:</strong> {transfer?.department}</p>
            <p><strong>Către:</strong> {transfer?.toEmail}</p>
            <p><strong>Expiră:</strong> {transfer?.expiresAt?.toDate().toLocaleString('ro-RO')}</p>
          </div>

          <div className="warning-box">
            <p>⚠️ Prin acceptarea acestei oferte vei deveni admin pentru departamentul <strong>{transfer?.department}</strong>.</p>
            <p>Adminul curent <strong>{transfer?.fromEmail}</strong> va pierde accesul de admin pentru acest departament.</p>
          </div>

          <button 
            className="accept-button"
            onClick={handleAcceptTransfer}
            disabled={accepting}
          >
            {accepting ? '⏳ Se acceptă...' : '✅ Acceptă Oferta'}
          </button>

          <button 
            className="cancel-button"
            onClick={handleRejectTransfer}
            disabled={accepting}
          >
            {accepting ? '⏳ Se procesează...' : '❌ Refuză Oferta'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AcceptTransfer;
