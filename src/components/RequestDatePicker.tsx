import { useState } from 'react';
import { getRequestDays, getRequestMonths } from '../utils/requestCalendar';
import { localDateString } from '../utils/scoring';
import ui from '../styles/ui.module.css';
import styles from './RequestModal.module.css';

interface RequestDatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RequestDatePicker({ value, onChange }: RequestDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<{ value: number; year: number } | null>(null);

  const selectDate = (date: Date) => {
    onChange(localDateString(date));
    setOpen(false);
  };

  return (
    <>
      <div className={styles['date-display-wrapper']}>
        <button type="button" className={`${ui.button} ${ui.secondary} ${styles['date-display']}`} onClick={() => { setOpen(true); setSelectedMonth(null); }}>
          {value
            ? new Date(`${value}T00:00:00`).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'Selectează Data'}
        </button>
        <button type="button" className={`${ui.button} ${ui.secondary} ${styles['today-btn']}`} onClick={() => selectDate(new Date())}>Astăzi</button>
      </div>
      {open && (
        <div className={styles['custom-date-picker']}>
          <div className={styles['date-picker-header']}>
            <h4>{selectedMonth === null ? 'Selectează Luna' : 'Selectează Ziua'}</h4>
            <button type="button" className={`${ui.button} ${ui.secondary} ${ui.iconButton}`}
              aria-label="Închide calendarul" onClick={() => setOpen(false)}>×</button>
          </div>
          {selectedMonth === null ? (
            <div className={styles['month-grid']}>
              {getRequestMonths().map(month => (
                <button key={`${month.year}-${month.value}`} type="button" className={`${ui.button} ${ui.secondary}`} onClick={() => {
                  setSelectedMonth(month);
                  onChange('');
                }}>
                  {month.name} {month.year}
                </button>
              ))}
            </div>
          ) : (
            <>
              <button type="button" className={`${ui.button} ${ui.secondary}`} onClick={() => setSelectedMonth(null)}>
                Înapoi la Luni
              </button>
              <div className={styles['weekdays-header']}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <span key={index}>{day}</span>)}
              </div>
              <div className={styles['day-grid']}>
                {getRequestDays(selectedMonth.value, selectedMonth.year).map((day, index) => day === null ? (
                  <div key={`empty-${index}`}></div>
                ) : (
                  <button key={day} type="button" className={`${ui.button} ${ui.secondary} ${styles['day-btn']}`} onClick={() => {
                    selectDate(new Date(selectedMonth.year, selectedMonth.value, day));
                  }}>{day}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
