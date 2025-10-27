import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import './Request.css';

type TabType = 'departament' | 'task' | 'nr-ul';

interface DepartmentTask {
  id: string;
  department: string;
  description: string;
  points: number;
}

function Request() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('departament');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [taskNumber, setTaskNumber] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const departments = ['HR', 'PR', 'IT', 'FR', 'GENERAL'];

  // Fetch tasks when department is selected
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedDepartment) {
        setDepartmentTasks([]);
        return;
      }

      console.log('Fetching tasks for department:', selectedDepartment);
      setLoadingTasks(true);
      try {
        const tasksQuery = query(
          collection(db, 'departmentTasks'),
          where('department', '==', selectedDepartment)
        );

        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks: DepartmentTask[] = [];

        console.log('Query snapshot size:', tasksSnapshot.size);
        
        tasksSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Task document:', doc.id, data);
          tasks.push({
            id: doc.id,
            department: data.department,
            description: data.description,
            points: data.points
          } as DepartmentTask);
        });

        console.log('Fetched tasks:', tasks);
        console.log('Total tasks found:', tasks.length);
        setDepartmentTasks(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        console.error('Error details:', error);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [selectedDepartment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDepartment || !selectedTask) {
      setError('Te rog completează toate câmpurile obligatorii!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Add request to Firestore
      await addDoc(collection(db, 'pointRequests'), {
        userId: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName || user?.email?.split('@')[0],
        department: selectedDepartment,
        task: selectedTask,
        taskNumber: taskNumber || null,
        details: details || null,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Navigate to success page
      navigate('/success');
    } catch (err: any) {
      setError('Eroare la trimiterea cererii. Te rog încearcă din nou.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-page">
      <div className="request-container">
        <div className="request-content">
          <div className="tabs">
            <button
              className={`tab-button ${activeTab === 'departament' ? 'active' : ''}`}
              onClick={() => setActiveTab('departament')}
            >
              DEPARTAMENT
            </button>
            <button
              className={`tab-button ${activeTab === 'task' ? 'active' : ''}`}
              onClick={() => setActiveTab('task')}
            >
              TASK FACUT
            </button>
            <button
              className={`tab-button ${activeTab === 'nr-ul' ? 'active' : ''}`}
              onClick={() => setActiveTab('nr-ul')}
            >
              NR-UL
            </button>
          </div>

          <form className="request-form" onSubmit={handleSubmit}>
            {activeTab === 'departament' && (
              <div className="form-section">
                <h3>Selectează Departamentul</h3>
                <div className="department-grid">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      className={`department-btn ${selectedDepartment === dept ? 'selected' : ''}`}
                      onClick={() => setSelectedDepartment(dept)}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'task' && (
              <div className="form-section">
                <h3>Selectează Task-ul</h3>
                {!selectedDepartment ? (
                  <p className="info-text">Mai întâi selectează un departament!</p>
                ) : loadingTasks ? (
                  <p className="info-text">Se încarcă task-urile...</p>
                ) : departmentTasks.length === 0 ? (
                  <div className="info-text" style={{ 
                    padding: '20px', 
                    background: '#fff3cd', 
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    color: '#856404'
                  }}>
                    <strong>⚠️ Nu există task-uri disponibile pentru departamentul {selectedDepartment}.</strong>
                    <br /><br />
                    Un admin trebuie să adauge task-uri pentru acest departament în panoul de administrare.
                    <br /><br />
                    <em>Dacă ești admin, mergi la Admin Panel → Tasks → Selectează {selectedDepartment} → Adaugă Task Nou</em>
                  </div>
                ) : (
                  <div className="task-list">
                    {departmentTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        className={`task-btn ${selectedTask === task.description ? 'selected' : ''}`}
                        onClick={() => setSelectedTask(task.description)}
                      >
                        {task.description} ({task.points} puncte)
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nr-ul' && (
              <div className="form-section">
                <h3>Detalii Suplimentare</h3>
                <input
                  type="number"
                  placeholder="Număr de repetări (câte ori ai făcut task-ul)"
                  value={taskNumber}
                  onChange={(e) => setTaskNumber(e.target.value)}
                  className="request-input"
                  min="1"
                />
                <textarea
                  placeholder="DETALII IN PLUS LEGATE DE TASK PE CARE VREI SA LE ZICI!"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="request-textarea"
                  rows={6}
                />
              </div>
            )}

            {error && <div className="request-error">{error}</div>}

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || !selectedDepartment || !selectedTask}
            >
              {loading ? 'SE TRIMITE...' : 'TRIMITE'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Request;
