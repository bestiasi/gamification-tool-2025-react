import { VALIDATION } from '../constants';
import { REQUEST_DEPARTMENTS } from '../constants/departments';
import { useRequestForm } from '../hooks/useRequestForm';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { validEventDate } from '../utils/scoring';
import RequestDatePicker from './RequestDatePicker';
import ui from '../styles/ui.module.css';
import styles from './RequestModal.module.css';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function RequestModal({ isOpen, onClose, onSuccess }: RequestModalProps) {
  const {
    currentStep, selectedDepartment, selectedTask, tasks, loadingTasks, loading, error,
    eventDate, setEventDate, taskNumber, setTaskNumber, details, setDetails,
    handleDepartmentSelect, handleTaskSelect, handleBack, handleNext, handleClose, handleSubmit,
  } = useRequestForm(onClose, onSuccess);
  const dialog = useDialogFocus(isOpen, handleClose, currentStep);

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']} onClick={handleClose}>
      <div ref={dialog} tabIndex={-1} aria-modal="true" className={styles['modal-content']} role="dialog" aria-labelledby="request-modal-title"
        onClick={event => event.stopPropagation()}>
        <button type="button" className={`${ui.button} ${ui.iconButton} ${styles['modal-close']}`}
          aria-label="Închide formularul" onClick={handleClose} disabled={loading}>×</button>
        <div className={styles['modal-header']}>
          <h2 id="request-modal-title">Cerere Nouă de Puncte</h2>
          <div className={styles['progress-dots']}>
            <span className={currentStep === 'department' ? styles.active : styles.completed}>1</span>
            <span className={currentStep === 'task' ? styles.active : currentStep === 'date' || currentStep === 'details' ? styles.completed : ''}>2</span>
            <span className={currentStep === 'date' ? styles.active : currentStep === 'details' ? styles.completed : ''}>3</span>
            <span className={currentStep === 'details' ? styles.active : ''}>4</span>
          </div>
        </div>
        <div className={styles['modal-body']}>
          {error && <div className={`${ui.notice} ${styles['error-message']}`} role="alert">{error}</div>}
          {currentStep === 'department' && (
            <div className={styles['step-section']}>
              <h3>Selectează Departamentul</h3>
              <div className={styles['department-grid']}>
                {REQUEST_DEPARTMENTS.map(department => (
                  <button type="button" key={department} className={`${ui.button} ${styles['dept-btn']} ${selectedDepartment === department ? styles.selected : ''}`}
                    onClick={() => handleDepartmentSelect(department)}>
                    {department}
                  </button>
                ))}
              </div>
            </div>
          )}
          {currentStep === 'task' && (
            <div className={styles['step-section']}>
              <h3>Selectează Task-ul</h3>
              {loadingTasks ? <p role="status">Se încarcă task-urile...</p> : (
                <div className={styles['task-list']}>
                  {tasks.map(task => (
                    <button type="button" key={task.id} className={`${ui.button} ${styles['task-btn']} ${selectedTask === task.id ? styles.selected : ''}`}
                      onClick={() => handleTaskSelect(task.id)}>
                      {task.description} ({task.points} puncte)
                    </button>
                  ))}
                </div>
              )}
              <p className={styles['scoring-note']}>Punctajul cererilor aprobate se recalculează folosind valoarea actuală a task-ului.</p>
              <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={handleBack}>Înapoi</button>
            </div>
          )}
          {currentStep === 'date' && (
            <div className={styles['step-section']}>
              <h3>Data Evenimentului</h3>
              <p className={styles['step-description']}>Când a avut loc activitatea?</p>
              <RequestDatePicker value={eventDate} onChange={setEventDate} />
              <div className={styles['button-row']}>
                <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={handleBack}>Înapoi</button>
                <button type="button" className={`${ui.button} ${ui.primary}`} onClick={handleNext} disabled={!validEventDate(eventDate)}>
                  Următorul Pas
                </button>
              </div>
            </div>
          )}
          {currentStep === 'details' && (
            <div className={styles['step-section']}>
              <h3>Detalii Suplimentare</h3>
              <label htmlFor="request-repetitions">Număr de repetări</label>
              <input id="request-repetitions" type="number"
                value={taskNumber} onChange={event => setTaskNumber(event.target.value)} className={ui.field} min="1" max={VALIDATION.MAX_REPETITIONS} step="1" />
              <label htmlFor="request-details">Detalii (opțional)</label>
              <textarea id="request-details" placeholder="Descrie pe scurt activitatea"
                value={details} onChange={event => setDetails(event.target.value)} className={`${ui.field} ${styles['details-textarea']}`} rows={4} />
              <div className={styles['button-row']}>
                <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={handleBack}>Înapoi</button>
                <button type="button" className={`${ui.button} ${ui.primary}`} onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Se trimite...' : 'Trimite Cererea'}
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
