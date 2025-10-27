import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import RequestModal from '../components/RequestModal';
import './MyRequests.css';

interface PointRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  department: string;
  task: string;
  eventDate?: string;
  proofUrl?: string;
  taskNumber: string | null;
  details: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  reviewedBy?: string;
  reviewedAt?: any;
}

function MyRequests() {
  const [user] = useAuthState(auth);
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyRequests();
    }
  }, [user]);

  const fetchMyRequests = async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, 'pointRequests'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const fetchedRequests: PointRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedRequests.push({ id: doc.id, ...doc.data() } as PointRequest);
      });

      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(req => req.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge status-pending">⏳ În așteptare</span>;
      case 'approved':
        return <span className="status-badge status-approved">✅ Aprobat</span>;
      case 'rejected':
        return <span className="status-badge status-rejected">❌ Respins</span>;
      default:
        return null;
    }
  };

  const getStatusCount = (status: string) => {
    return requests.filter(req => req.status === status).length;
  };

  const handleModalSuccess = () => {
    // Refresh the requests list after successful submission
    fetchMyRequests();
  };

  if (loading) {
    return (
      <div className="my-requests-page">
        <div className="my-requests-container">
          <p className="loading-text">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-requests-page">
      <div className="my-requests-container">
        <div className="my-requests-content">
          <h1>📋 Cererile Mele</h1>

          <button 
            className="add-request-btn"
            onClick={() => setIsModalOpen(true)}
          >
            ➕ Adaugă Cerere Nouă
          </button>
          <p className="my-requests-subtitle">
            Istoricul tuturor cererilor tale de puncte
          </p>

          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-number">{requests.length}</div>
              <div className="stat-label">Total Cereri</div>
            </div>
            <div className="stat-card stat-pending">
              <div className="stat-number">{getStatusCount('pending')}</div>
              <div className="stat-label">În așteptare</div>
            </div>
            <div className="stat-card stat-approved">
              <div className="stat-number">{getStatusCount('approved')}</div>
              <div className="stat-label">Aprobate</div>
            </div>
            <div className="stat-card stat-rejected">
              <div className="stat-number">{getStatusCount('rejected')}</div>
              <div className="stat-label">Respinse</div>
            </div>
          </div>

          <div className="filter-section">
            <label>Filtrează după status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Toate ({requests.length})</option>
              <option value="pending">În așteptare ({getStatusCount('pending')})</option>
              <option value="approved">Aprobate ({getStatusCount('approved')})</option>
              <option value="rejected">Respinse ({getStatusCount('rejected')})</option>
            </select>
          </div>  


          <div className="requests-list">
            {filteredRequests.length === 0 ? (
              <div className="no-requests">
                <p>📭 Nu ai cereri {filterStatus !== 'all' ? `cu statusul "${filterStatus}"` : ''}</p>
              </div>
            ) : (
              filteredRequests.map(request => (
                <div key={request.id} className={`request-card status-${request.status}`}>
                  <div className="request-header">
                    <span className="request-dept">{request.department}</span>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="request-body">
                    <p className="request-task">
                      <strong>Task:</strong> {request.task}
                    </p>
                    {request.eventDate && (
                      <p className="request-event-date">
                        <strong>Data Eveniment:</strong> {new Date(request.eventDate).toLocaleDateString('ro-RO')}
                      </p>
                    )}
                    {request.proofUrl && (
                      <div className="request-proof">
                        <strong>Dovadă:</strong>
                        <a href={request.proofUrl} target="_blank" rel="noopener noreferrer" className="proof-link">
                          📎 Vezi Dovada
                        </a>
                      </div>
                    )}
                    {request.taskNumber && (
                      <p className="request-number">
                        <strong>Repetări:</strong> {request.taskNumber}
                      </p>
                    )}
                    {request.details && (
                      <p className="request-details">
                        <strong>Detalii:</strong> {request.details}
                      </p>
                    )}
                    <p className="request-date">
                      <strong>Data cererii:</strong> {request.createdAt?.toDate().toLocaleString('ro-RO')}
                    </p>
                    {request.reviewedBy && (
                      <p className="request-reviewed">
                        <strong>Revizuit de:</strong> {request.reviewedBy}
                        {request.reviewedAt && ` • ${request.reviewedAt?.toDate().toLocaleString('ro-RO')}`}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <RequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

export default MyRequests;
