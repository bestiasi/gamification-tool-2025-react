import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase/config';
import './RequestModal.css';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type StepType = 'department' | 'task' | 'date' | 'proof' | 'details';

function RequestModal({ isOpen, onClose, onSuccess }: RequestModalProps) {
  const [user] = useAuthState(auth);
  const [currentStep, setCurrentStep] = useState<StepType>('department');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>('');
  const [taskNumber, setTaskNumber] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState<string[]>([]);

  const departments = ['HR', 'PR', 'IT', 'FR', 'GENERAL'];

  const handleDepartmentSelect = async (dept: string) => {
    setSelectedDepartment(dept);
    setSelectedTask('');
    
    // Fetch tasks from Firestore
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('department', '==', dept)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const taskList = tasksSnapshot.docs.map(doc => doc.data().name as string);
      setTasks(taskList);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      // Fallback to default tasks if none in database
      setTasks([
        'AI O RESPONSABILITATE PE DEPARTAMENT',
        'PARTICIPI LA O ACTIVITATE',
        'ORGANIZEZI UN EVENIMENT',
        'REALIZEZI UN PROIECT',
        'COLABORARE IN ECHIPA'
      ]);
    }
    
    setCurrentStep('task');
  };

  const handleTaskSelect = (task: string) => {
    setSelectedTask(task);
    setCurrentStep('date');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDepartment || !selectedTask || !eventDate || !proofFile) {
      setError('Te rog completează toate câmpurile obligatorii!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload proof image to Firebase Storage
      const timestamp = Date.now();
      const fileName = `proofs/${user?.uid}/${timestamp}_${proofFile.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, proofFile);
      const proofUrl = await getDownloadURL(storageRef);

      // Add request to Firestore
      await addDoc(collection(db, 'pointRequests'), {
        userId: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName || user?.email?.split('@')[0],
        department: selectedDepartment,
        task: selectedTask,
        eventDate: eventDate,
        proofUrl: proofUrl,
        taskNumber: taskNumber || null,
        details: details || null,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      onSuccess();
      resetForm();
      onClose();
    } catch (err: any) {
      setError('Eroare la trimiterea cererii. Te rog încearcă din nou.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('department');
    setSelectedDepartment('');
    setSelectedTask('');
    setEventDate('');
    setProofFile(null);
    setProofPreview('');
    setTaskNumber('');
    setDetails('');
    setError('');
  };

  const handleBack = () => {
    if (currentStep === 'task') setCurrentStep('department');
    else if (currentStep === 'date') setCurrentStep('task');
    else if (currentStep === 'proof') setCurrentStep('date');
    else if (currentStep === 'details') setCurrentStep('proof');
  };

  const handleNext = () => {
    if (currentStep === 'date' && eventDate) setCurrentStep('proof');
    else if (currentStep === 'proof' && proofFile) setCurrentStep('details');
  };

  const getAcademicYearStart = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11
    
    // If we're before September (month 8), academic year started last year
    if (currentMonth < 8) {
      return `${currentYear - 1}-09-01`;
    }
    // If we're September or later, academic year started this year
    return `${currentYear}-09-01`;
  };

  const getAvailableMonths = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11 (0=Jan, 8=Sep)
    
    const monthNames = [
      'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
      'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
    ];
    
    let availableMonths: { value: number; name: string; year: number }[] = [];
    
    if (currentMonth < 8) {
      // Before September - show Sep-Dec from last year, Jan-current month this year
      for (let m = 8; m < 12; m++) {
        availableMonths.push({ value: m, name: monthNames[m], year: currentYear - 1 });
      }
      for (let m = 0; m <= currentMonth; m++) {
        availableMonths.push({ value: m, name: monthNames[m], year: currentYear });
      }
    } else {
      // September or later - show Sep-current month this year
      for (let m = 8; m <= currentMonth; m++) {
        availableMonths.push({ value: m, name: monthNames[m], year: currentYear });
      }
    }
    
    return availableMonths;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getAvailableDays = (month: number, year: number) => {
    const today = new Date();
    const daysInMonth = getDaysInMonth(month, year);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    // If selected month is current month, only show days up to today
    if (year === currentYear && month === currentMonth) {
      return Array.from({ length: currentDay }, (_, i) => i + 1);
    }
    
    // Otherwise show all days in month
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleMonthSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedDay(null);
    
    // Store year for later use
    const yearStr = year.toString();
    setEventDate(`${yearStr}-${String(month + 1).padStart(2, '0')}-`);
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    
    const availableMonths = getAvailableMonths();
    const selectedMonthData = availableMonths.find(m => m.value === selectedMonth);
    
    if (selectedMonthData) {
      const yearStr = selectedMonthData.year.toString();
      const monthStr = String(selectedMonth! + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      setEventDate(`${yearStr}-${monthStr}-${dayStr}`);
      setShowDatePicker(false);
    }
  };

  const handleOpenDatePicker = () => {
    setShowDatePicker(true);
    setSelectedMonth(null);
    setSelectedDay(null);
  };

  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <h2>📝 Cerere Nouă de Puncte</h2>
          <div className="progress-dots">
            <span className={currentStep === 'department' ? 'active' : 'completed'}>1</span>
            <span className={currentStep === 'task' ? 'active' : currentStep === 'date' || currentStep === 'proof' || currentStep === 'details' ? 'completed' : ''}>2</span>
            <span className={currentStep === 'date' ? 'active' : currentStep === 'proof' || currentStep === 'details' ? 'completed' : ''}>3</span>
            <span className={currentStep === 'proof' ? 'active' : currentStep === 'details' ? 'completed' : ''}>4</span>
            <span className={currentStep === 'details' ? 'active' : ''}>5</span>
          </div>
        </div>

        <div className="modal-body">
          {currentStep === 'department' && (
            <div className="step-section">
              <h3>Selectează Departamentul</h3>
              <div className="department-grid">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    className={`dept-btn ${selectedDepartment === dept ? 'selected' : ''}`}
                    onClick={() => handleDepartmentSelect(dept)}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'task' && (
            <div className="step-section">
              <h3>Selectează Task-ul</h3>
              <div className="task-list">
                {tasks.map((task) => (
                  <button
                    key={task}
                    className={`task-btn ${selectedTask === task ? 'selected' : ''}`}
                    onClick={() => handleTaskSelect(task)}
                  >
                    {task}
                  </button>
                ))}
              </div>
              <button 
                className="back-btn-single" 
                onClick={handleBack}
              >
                ← Înapoi
              </button>
            </div>
          )}

          {currentStep === 'date' && (
            <div className="step-section">
              <h3>Data Evenimentului</h3>
              <p className="step-description">Când a avut loc activitatea?</p>
              
              <div className="date-display-wrapper">
                <div className="date-display" onClick={handleOpenDatePicker}>
                  {eventDate ? getFormattedDate(eventDate) : '📅 Selectează Data'}
                </div>
                <button 
                  type="button"
                  className="today-btn"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setEventDate(today);
                    setShowDatePicker(false);
                  }}
                >
                  📅 Astăzi
                </button>
              </div>

              {showDatePicker && (
                <div className="custom-date-picker">
                  <div className="date-picker-header">
                    <h4>{selectedMonth === null ? 'Selectează Luna' : 'Selectează Ziua'}</h4>
                    <button 
                      type="button"
                      className="close-picker-btn"
                      onClick={() => setShowDatePicker(false)}
                    >
                      ✕
                    </button>
                  </div>
                  
                  {selectedMonth === null ? (
                    <div className="month-grid">
                      {getAvailableMonths().map((month) => (
                        <button
                          key={`${month.year}-${month.value}`}
                          type="button"
                          className="month-btn"
                          onClick={() => handleMonthSelect(month.value, month.year)}
                        >
                          {month.name} {month.year}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <>
                      <button 
                        type="button"
                        className="back-to-months-btn"
                        onClick={() => setSelectedMonth(null)}
                      >
                        ← Înapoi la Luni
                      </button>
                      <div className="weekdays-header">
                        <span>L</span>
                        <span>M</span>
                        <span>M</span>
                        <span>J</span>
                        <span>V</span>
                        <span>S</span>
                        <span>D</span>
                      </div>
                      <div className="day-grid">
                        {(() => {
                          const year = getAvailableMonths().find(m => m.value === selectedMonth)?.year || new Date().getFullYear();
                          const firstDay = new Date(year, selectedMonth, 1).getDay();
                          const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Monday = 0, Sunday = 6
                          const days = getAvailableDays(selectedMonth, year);
                          const emptySlots = Array(adjustedFirstDay).fill(null);
                          
                          return [...emptySlots, ...days].map((day, index) => (
                            day === null ? (
                              <div key={`empty-${index}`} className="day-empty"></div>
                            ) : (
                              <button
                                key={day}
                                type="button"
                                className="day-btn"
                                onClick={() => handleDaySelect(day)}
                              >
                                {day}
                              </button>
                            )
                          ));
                        })()}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="button-row">
                <button className="back-btn-inline" onClick={handleBack}>
                  ← Înapoi
                </button>
                <button 
                  className="next-btn-inline"
                  onClick={handleNext}
                  disabled={!eventDate}
                >
                  Următorul Pas →
                </button>
              </div>
            </div>
          )}

          {currentStep === 'proof' && (
            <div className="step-section">
              <h3>Dă-ne un selfie de la fața locului! 🤳</h3>
              <p className="step-description">Fă o poză care demonstrează realizarea task-ului</p>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="proof-file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="proof-file" className="file-label">
                  {proofPreview ? (
                    <img src={proofPreview} alt="Preview" className="proof-preview" />
                  ) : (
                    <>
                      <span className="upload-icon">📷</span>
                      <span>Click pentru a face un selfie</span>
                    </>
                  )}
                </label>
              </div>
              <div className="button-row">
                <button className="back-btn-inline" onClick={handleBack}>
                  ← Înapoi
                </button>
                <button 
                  className="next-btn-inline"
                  onClick={handleNext}
                  disabled={!proofFile}
                >
                  Următorul Pas →
                </button>
              </div>
            </div>
          )}

          {currentStep === 'details' && (
            <div className="step-section">
              <h3>Detalii Suplimentare</h3>
              <input
                type="number"
                placeholder="Număr de repetări (câte ori ai făcut task-ul)"
                value={taskNumber}
                onChange={(e) => setTaskNumber(e.target.value)}
                className="number-input"
                min="1"
              />
              <textarea
                placeholder="Detalii în plus legate de task pe care vrei să le zici!"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="details-textarea"
                rows={4}
              />
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="button-row">
                <button className="back-btn-inline" onClick={handleBack}>
                  ← Înapoi
                </button>
                <button 
                  className="submit-btn-inline"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Se trimite...' : '✓ Trimite Cererea'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestModal;
