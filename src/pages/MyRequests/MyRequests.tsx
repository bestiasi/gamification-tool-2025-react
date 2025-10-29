import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import RequestModal from '../../components/RequestModal';
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
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: any;
  reviewedBy?: string;
  reviewedAt?: any;
  adminComment?: string;
}

function MyRequests() {
  const [user] = useAuthState(auth);
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyRequests();
    }
  }, [user]);

  const fetchMyRequests = async () => {
    if (!user?.uid) return;

    try {
      // Temporary: Remove orderBy until index is fully built
      // Once index is ready, add back: orderBy('createdAt', 'desc')
      const q = query(
        collection(db, 'pointRequests'),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const fetchedRequests: PointRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedRequests.push({ id: doc.id, ...doc.data() } as PointRequest);
      });

      // Sort on client side instead
      fetchedRequests.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setRequests(fetchedRequests);
      console.log('✅ Fetched requests:', fetchedRequests.length);
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
      case 'cancelled':
        return <span className="status-badge status-cancelled">🚫 Anulat</span>;
      default:
        return null;
    }
  };

  const getStatusCount = (status: string) => {
    return requests.filter(req => req.status === status).length;
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Ești sigur că vrei să anulezi această cerere?')) {
      return;
    }

    try {
      await updateDoc(doc(db, 'pointRequests', requestId), {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: user?.email
      });

      fetchMyRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Eroare la anularea cererii. Te rog încearcă din nou.');
    }
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
              <option value="cancelled">Anulate ({getStatusCount('cancelled')})</option>
            </select>
          </div>  


          <div className="requests-list">
            {filteredRequests.length === 0 ? (
              <div className="no-requests">
                <p>📭 Nu ai cereri {filterStatus !== 'all' ? `cu statusul "${filterStatus}"` : ''}</p>
              </div>
            ) : (
              filteredRequests.map(request => {
                const isExpanded = expandedCard === request.id;
                return (
                  <div 
                    key={request.id} 
                    className={`request-card status-${request.status} ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => setExpandedCard(isExpanded ? null : request.id)}
                  >
                    <div className="request-header">
                      <span className="request-dept">{request.department}</span>
                      <div className="request-header-right">
                        {getStatusBadge(request.status)}
                        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                      </div>
                    </div>
                    
                    <div className="request-body">
                      <p className="request-task">
                        {request.task}
                      </p>
                      {!isExpanded && (
                        <>
                          {request.taskNumber && (
                            <p className="request-number">
                              {request.taskNumber}x
                            </p>
                          )}
                          {request.eventDate && (
                            <p className="request-event-date">
                              📅 {new Date(request.eventDate).toLocaleDateString('ro-RO')}
                            </p>
                          )}
                          {request.adminComment && request.status !== 'pending' && (
                            <div className={`admin-comment-preview ${request.status}`}>
                              {request.status === 'approved' ? '✅' : '❌'} {request.adminComment.substring(0, 60)}{request.adminComment.length > 60 ? '...' : ''}
                            </div>
                          )}
                        </>
                      )}
                      
                      {isExpanded && (
                        <>
                          {request.taskNumber && (
                            <p className="request-number">
                              <strong>Repetări:</strong> {request.taskNumber}
                            </p>
                          )}
                          {request.eventDate && (
                            <p className="request-event-date">
                              <strong>Data Eveniment:</strong> {new Date(request.eventDate).toLocaleDateString('ro-RO')}
                            </p>
                          )}
                          {request.proofUrl && (
                            <div className="request-proof">
                              <strong>Dovadă:</strong>
                              <a 
                                href={request.proofUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="proof-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                📎 Vezi Dovada
                              </a>
                            </div>
                          )}
                          {request.details && (
                            <p className="request-details-full">
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
                          {request.adminComment && (
                            <div className={`admin-comment ${request.status}`}>
                              <strong>
                                {request.status === 'approved' ? '✅ Mesaj Admin:' : 
                                 request.status === 'rejected' ? '❌ Motiv Respingere:' : 
                                 '💬 Comentariu Admin:'}
                              </strong>
                              <p>{request.adminComment}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {request.status === 'pending' && isExpanded && (
                      <div className="request-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="cancel-request-btn"
                          onClick={() => handleCancelRequest(request.id)}
                        >
                          🚫 Anulează Cererea
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
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
