import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc,
  orderBy,
  addDoc,
  deleteDoc,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import './Admin.css';

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

interface Task {
  id: string;
  department: string;
  description: string;
  points: number;
  createdAt?: any;
  updatedAt?: any;
}

interface PendingTransfer {
  id: string;
  fromEmail: string;
  toEmail: string;
  department: string;
  createdAt: any;
  expiresAt: any;
  status: 'pending' | 'accepted' | 'expired';
}

type AdminTab = 'requests' | 'tasks' | 'transfer';
type UserRole = 'admin' | 'secretary';

function Admin() {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<AdminTab>('requests');
  
  // Common state
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [adminDepartments, setAdminDepartments] = useState<string[]>([]);
  
  // Requests tab state
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PointRequest[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  
  // Tasks tab state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskDept, setSelectedTaskDept] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Transfer tab state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [transferDepartment, setTransferDepartment] = useState('');
  const [incomingTransfers, setIncomingTransfers] = useState<PendingTransfer[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([]);
  const [transferMessage, setTransferMessage] = useState('');
  const [transferError, setTransferError] = useState('');
  
  // Secretary management state
  const [secretaryEmail, setSecretaryEmail] = useState('');
  const [secretaryDepartment, setSecretaryDepartment] = useState('');
  const [secretaryMessage, setSecretaryMessage] = useState('');
  const [secretaryError, setSecretaryError] = useState('');
  const [existingSecretaries, setExistingSecretaries] = useState<Array<{email: string, departments: string[]}>>([]);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin && activeTab === 'requests') {
      fetchRequests();
    }
  }, [isAdmin, activeTab, selectedStatus]);

  useEffect(() => {
    if (isAdmin && activeTab === 'requests') {
      filterRequests();
    }
  }, [requests, selectedDepartment]);

  useEffect(() => {
    if (isAdmin && activeTab === 'tasks' && selectedTaskDept) {
      fetchTasks();
    }
  }, [isAdmin, activeTab, selectedTaskDept]);

  useEffect(() => {
    if (isAdmin && activeTab === 'transfer') {
      checkIncomingTransfers();
      checkPendingTransfers();
      fetchExistingSecretaries();
    }
  }, [isAdmin, activeTab]);

  const checkAdminStatus = async () => {
    if (!user?.email) return;

    try {
      // Check if user is admin
      const adminDoc = await getDoc(doc(db, 'admins', user.email));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        setIsAdmin(true);
        setUserRole(adminData.role || 'admin'); // Default to admin if role not set
        setAdminDepartments(adminData.departments || []);
        if (adminData.departments && adminData.departments.length > 0) {
          setSelectedTaskDept(adminData.departments[0]);
        }
      } else {
        // Check if user is secretary
        const secretaryDoc = await getDoc(doc(db, 'secretaries', user.email));
        if (secretaryDoc.exists()) {
          const secretaryData = secretaryDoc.data();
          setIsAdmin(true); // Has access but limited permissions
          setUserRole('secretary');
          setAdminDepartments(secretaryData.departments || []);
        } else {
          setIsAdmin(false);
          setUserRole(null);
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  // ONE-TIME SETUP: Create your admin document
  const setupAdminAccount = async () => {
    if (!user?.email) {
      alert('Nu ești autentificat!');
      return;
    }

    const departments = prompt(
      'Introdu departamentele tale (separate prin virgulă).\nExemplu: HR,IT,FR,PR',
      'HR,IT,FR,PR'
    );

    if (!departments) return;

    const deptArray = departments.split(',').map(d => d.trim());

    try {
      await setDoc(doc(db, 'admins', user.email), {
        email: user.email,
        role: 'admin',
        departments: deptArray,
        createdAt: serverTimestamp()
      });

      alert('Cont admin creat cu succes! Reîmprospătează pagina.');
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      alert(`Eroare: ${error.message}`);
    }
  };

  // ========== REQUESTS TAB FUNCTIONS ==========
  const fetchRequests = async () => {
    try {
      let q = query(
        collection(db, 'pointRequests'),
        where('status', '==', selectedStatus),
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
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(req => req.department === selectedDepartment);
    }

    if (!adminDepartments.includes('GENERAL')) {
      filtered = filtered.filter(req => adminDepartments.includes(req.department));
    }

    setFilteredRequests(filtered);
  };

  const handleReview = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'pointRequests', requestId), {
        status: newStatus,
        reviewedBy: user?.email,
        reviewedAt: new Date()
      });

      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  // ========== TASKS TAB FUNCTIONS ==========
  const fetchTasks = async () => {
    if (!selectedTaskDept) return;

    try {
      const q = query(
        collection(db, 'departmentTasks'),
        where('department', '==', selectedTaskDept)
      );

      const querySnapshot = await getDocs(q);
      const fetchedTasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedTasks.push({ id: doc.id, ...doc.data() } as Task);
      });

      fetchedTasks.sort((a, b) => b.points - a.points);
      setTasks(fetchedTasks);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskDesc.trim() || newTaskPoints <= 0) {
      alert('Completează toate câmpurile corect!');
      return;
    }

    if (!selectedTaskDept) {
      alert('Selectează un departament!');
      return;
    }

    try {
      console.log('Adding task:', {
        department: selectedTaskDept,
        description: newTaskDesc.trim(),
        points: newTaskPoints
      });

      await addDoc(collection(db, 'departmentTasks'), {
        department: selectedTaskDept,
        description: newTaskDesc.trim(),
        points: newTaskPoints,
        createdAt: serverTimestamp()
      });

      setNewTaskDesc('');
      setNewTaskPoints(0);
      setShowAddForm(false);
      fetchTasks();
      alert('Task adăugat cu succes!');
    } catch (error: any) {
      console.error('Error adding task:', error);
      console.error('Error details:', error.message);
      alert(`Eroare la adăugarea task-ului: ${error.message}`);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTask || !newTaskDesc.trim() || newTaskPoints <= 0) {
      alert('Completează toate câmpurile corect!');
      return;
    }

    try {
      await updateDoc(doc(db, 'departmentTasks', editingTask.id), {
        description: newTaskDesc.trim(),
        points: newTaskPoints,
        updatedAt: serverTimestamp()
      });

      setEditingTask(null);
      setNewTaskDesc('');
      setNewTaskPoints(0);
      fetchTasks();
      alert('Task actualizat cu succes!');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Eroare la actualizarea task-ului!');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest task?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'departmentTasks', taskId));
      fetchTasks();
      alert('Task șters cu succes!');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Eroare la ștergerea task-ului!');
    }
  };

  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskDesc(task.description);
    setNewTaskPoints(task.points);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setNewTaskDesc('');
    setNewTaskPoints(0);
    setShowAddForm(false);
  };

  // ========== TRANSFER TAB FUNCTIONS ==========
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
        
        if (expiresAt && expiresAt > new Date()) {
          transfers.push({ id: doc.id, ...data } as PendingTransfer);
        } else if (expiresAt) {
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
      setTransferError('Emailul trebuie să fie @bestis.ro');
      return;
    }

    if (!transferDepartment) {
      setTransferError('Selectează un departament');
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await addDoc(collection(db, 'adminTransfers'), {
        fromEmail: user?.email,
        toEmail: newAdminEmail,
        department: transferDepartment,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt,
        status: 'pending'
      });

      setTransferMessage(`✅ Cerere de transfer trimisă către ${newAdminEmail}`);
      setNewAdminEmail('');
      setTransferDepartment('');
      setTransferError('');
      checkPendingTransfers();
    } catch (error) {
      setTransferError('Eroare la trimiterea cererii');
    }
  };

  const handleAcceptTransfer = async (transferId: string, transfer: PendingTransfer) => {
    try {
      const expiresAt = transfer.expiresAt.toDate();
      if (expiresAt < new Date()) {
        await updateDoc(doc(db, 'adminTransfers', transferId), {
          status: 'expired'
        });
        setTransferError('Cererea a expirat.');
        checkIncomingTransfers();
        return;
      }

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
        }
      }

      await updateDoc(doc(db, 'adminTransfers', transferId), {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });

      setTransferMessage(`✅ Ai devenit admin pentru ${transfer.department}!`);
      checkAdminStatus();
      checkIncomingTransfers();
    } catch (error) {
      setTransferError('Eroare la acceptarea cererii');
    }
  };

  // ========== SECRETARY MANAGEMENT FUNCTIONS ==========
  const fetchExistingSecretaries = async () => {
    try {
      const q = query(collection(db, 'secretaries'));
      const querySnapshot = await getDocs(q);
      const secretaries: Array<{email: string, departments: string[]}> = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        secretaries.push({
          email: data.email,
          departments: data.departments || []
        });
      });
      
      setExistingSecretaries(secretaries);
    } catch (error) {
      console.error('Error fetching secretaries:', error);
    }
  };

  const handleAddSecretary = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!secretaryEmail.endsWith('@bestis.ro')) {
      setSecretaryError('Emailul trebuie să fie @bestis.ro');
      return;
    }

    if (!secretaryDepartment) {
      setSecretaryError('Selectează un departament');
      return;
    }

    try {
      // Check if secretary already exists
      const secretaryDoc = await getDoc(doc(db, 'secretaries', secretaryEmail));
      
      if (secretaryDoc.exists()) {
        setSecretaryError('Acest email există deja ca secretar');
        return;
      }

      // Check if email is already admin
      const adminDoc = await getDoc(doc(db, 'admins', secretaryEmail));
      if (adminDoc.exists()) {
        setSecretaryError('Acest email este deja admin!');
        return;
      }

      // Create secretary document with email as document ID
      await updateDoc(doc(db, 'secretaries', secretaryEmail), {
        email: secretaryEmail,
        departments: [secretaryDepartment],
        role: 'secretary',
        createdBy: user?.email,
        createdAt: serverTimestamp()
      });

      setSecretaryMessage(`✅ Secretar ${secretaryEmail} adăugat cu succes!`);
      setSecretaryEmail('');
      setSecretaryDepartment('');
      setSecretaryError('');
      fetchExistingSecretaries(); // Refresh list
    } catch (error) {
      console.error('Error adding secretary:', error);
      setSecretaryError('Eroare la adăugarea secretarului');
    }
  };

  const handleRemoveSecretary = async (email: string) => {
    if (!confirm(`Ești sigur că vrei să ștergi accesul pentru ${email}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'secretaries', email));
      setSecretaryMessage(`✅ Acces șters pentru ${email}`);
      fetchExistingSecretaries(); // Refresh list
    } catch (error) {
      console.error('Error removing secretary:', error);
      setSecretaryError('Eroare la ștergerea secretarului');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <p>Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-content">
            <h1>🚫 Acces Interzis</h1>
            <p>Nu ai permisiuni de administrator.</p>
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={setupAdminAccount}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#016fb4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                🔧 Setup Admin Account
              </button>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Doar pentru prima configurare - Click aici pentru a-ți crea contul de admin
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-content">
          <h1>📊 Panou {userRole === 'secretary' ? 'Secretar' : 'Admin'}</h1>
          <p className="admin-subtitle">
            Rol: <strong>{userRole === 'secretary' ? 'Secretar' : 'Administrator'}</strong> | Departamente: {adminDepartments.join(', ')}
          </p>

          {/* Tab Navigation */}
          <div className="admin-tabs">
            <button 
              className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              📋 REQUESTS
            </button>
            {userRole === 'admin' && (
              <>
                <button 
                  className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tasks')}
                >
                  📝 TASKS
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transfer')}
                >
                  🔄 TRANSFER
                </button>
              </>
            )}
          </div>

          {/* REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div className="tab-content">
              <div className="admin-filters">
                <div className="filter-group">
                  <label>Status:</label>
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="admin-select"
                  >
                    <option value="pending">În așteptare</option>
                    <option value="approved">Aprobate</option>
                    <option value="rejected">Respinse</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Departament:</label>
                  <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">Toate</option>
                    {adminDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="requests-list">
                {filteredRequests.length === 0 ? (
                  <p className="no-requests">Nu există cereri.</p>
                ) : (
                  filteredRequests.map(request => (
                    <div key={request.id} className="request-card">
                      <div className="request-header">
                        <span className="request-user">👤 {request.userName}</span>
                        <span className="request-dept">{request.department}</span>
                      </div>
                      
                      <div className="request-body">
                        <p className="request-task"><strong>Task:</strong> {request.task}</p>
                        {request.eventDate && (
                          <p className="request-event-date"><strong>Data:</strong> {new Date(request.eventDate).toLocaleDateString('ro-RO')}</p>
                        )}
                        {request.proofUrl && (
                          <div className="request-proof">
                            <strong>Dovadă:</strong>
                            <a href={request.proofUrl} target="_blank" rel="noopener noreferrer" className="proof-link">
                              📎 Vezi
                            </a>
                          </div>
                        )}
                        {request.taskNumber && (
                          <p className="request-number"><strong>Repetări:</strong> {request.taskNumber}</p>
                        )}
                        {request.details && (
                          <p className="request-details"><strong>Detalii:</strong> {request.details}</p>
                        )}
                      </div>

                      {selectedStatus === 'pending' && (
                        <div className="request-actions">
                          <button
                            className="approve-btn"
                            onClick={() => handleReview(request.id, 'approved')}
                          >
                            ✅ Aprobă
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleReview(request.id, 'rejected')}
                          >
                            ❌ Respinge
                          </button>
                        </div>
                      )}

                      {selectedStatus !== 'pending' && request.reviewedBy && (
                        <p className="request-reviewed">
                          Revizuit de: {request.reviewedBy}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TASKS TAB - Only for Admins */}
          {activeTab === 'tasks' && userRole === 'admin' && (
            <div className="tab-content">
              <div className="tasks-header">
                <div className="filter-group">
                  <label>Departament:</label>
                  <select 
                    value={selectedTaskDept} 
                    onChange={(e) => setSelectedTaskDept(e.target.value)}
                    className="admin-select"
                  >
                    {adminDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(showAddForm || editingTask) && (
                <div className="task-form">
                  <h3>{editingTask ? '✏️ Editează Task' : '➕ Adaugă Task Nou'}</h3>
                  <form onSubmit={editingTask ? handleUpdateTask : handleAddTask}>
                    <div className="form-group">
                      <label>Descriere:</label>
                      <input
                        type="text"
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                        placeholder="Ex: ORGANIZEZI O ACTIVITATE DE FUN"
                        className="task-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Puncte:</label>
                      <input
                        type="number"
                        value={newTaskPoints}
                        onChange={(e) => setNewTaskPoints(parseInt(e.target.value) || 0)}
                        placeholder="Ex: 100"
                        className="task-input"
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="submit-btn">
                        {editingTask ? '💾 Salvează' : '➕ Adaugă'}
                      </button>
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={cancelEdit}
                      >
                        ❌ Anulează
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {!showAddForm && !editingTask && (
                <button 
                  className="add-task-btn"
                  onClick={() => setShowAddForm(true)}
                >
                  ➕ Adaugă Task Nou
                </button>
              )}

              <div className="tasks-list">
                <h3>Task-uri {selectedTaskDept} ({tasks.length})</h3>
                {tasks.length === 0 ? (
                  <p className="no-tasks">Nu există task-uri.</p>
                ) : (
                  <div className="tasks-grid">
                    {tasks.map((task) => (
                      <div key={task.id} className="task-card">
                        <div className="task-info">
                          <p className="task-description">{task.description}</p>
                          <p className="task-points">{task.points} puncte</p>
                        </div>
                        <div className="task-actions">
                          <button 
                            className="edit-btn"
                            onClick={() => startEditTask(task)}
                            title="Editează"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Șterge"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TRANSFER TAB - Only for Admins */}
          {activeTab === 'transfer' && userRole === 'admin' && (
            <div className="tab-content">
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
                      >
                        ✅ Acceptă
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleTransferAdmin} className="transfer-form">
                <h3>🔄 Transfer Rol Admin</h3>
                
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
                    value={transferDepartment}
                    onChange={(e) => setTransferDepartment(e.target.value)}
                    className="transfer-select"
                    required
                  >
                    <option value="">Selectează...</option>
                    {adminDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {transferError && <div className="transfer-error">{transferError}</div>}
                {transferMessage && <div className="transfer-success">{transferMessage}</div>}

                <button type="submit" className="transfer-button">
                  📤 Trimite Cerere
                </button>
              </form>

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

              {/* Secretary Management Section */}
              <div className="secretary-section">
                <h2>👔 Gestionare Secretari</h2>
                <p className="section-description">
                  Secretarii pot aproba/respinge cereri de puncte, dar nu pot edita task-uri sau transfera roluri.
                </p>
                
                <form onSubmit={handleAddSecretary} className="secretary-form">
                  <h3>➕ Adaugă Secretar</h3>
                  
                  <div className="form-group">
                    <label>Email Secretar (@bestis.ro):</label>
                    <input
                      type="email"
                      value={secretaryEmail}
                      onChange={(e) => setSecretaryEmail(e.target.value)}
                      placeholder="secretar@bestis.ro"
                      className="transfer-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Departament:</label>
                    <select
                      value={secretaryDepartment}
                      onChange={(e) => setSecretaryDepartment(e.target.value)}
                      className="transfer-select"
                      required
                    >
                      <option value="">Selectează...</option>
                      {adminDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {secretaryError && <div className="transfer-error">{secretaryError}</div>}
                  {secretaryMessage && <div className="transfer-success">{secretaryMessage}</div>}

                  <button type="submit" className="secretary-button">
                    ➕ Adaugă Secretar
                  </button>
                </form>

                {/* Existing Secretaries List */}
                {existingSecretaries.length > 0 && (
                  <div className="existing-secretaries">
                    <h3>👔 Secretari Existenți</h3>
                    <div className="secretaries-list">
                      {existingSecretaries.map((secretary) => (
                        <div key={secretary.email} className="secretary-item">
                          <div className="secretary-info">
                            <p className="secretary-email">📧 {secretary.email}</p>
                            <p className="secretary-departments">
                              Departamente: {secretary.departments.join(', ')}
                            </p>
                          </div>
                          <button
                            className="remove-secretary-btn"
                            onClick={() => handleRemoveSecretary(secretary.email)}
                            title="Șterge acces"
                          >
                            🗑️ Șterge
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
