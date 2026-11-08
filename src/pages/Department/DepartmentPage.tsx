import { useState } from 'react';
import LeaderboardNotices from '../../components/LeaderboardNotices';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import AvailableTasksTable from './AvailableTasksTable';
import DepartmentDecorations from './DepartmentDecorations';
import LeaderboardTable from './LeaderboardTable';
import type { LeaderboardDepartment } from '../../constants/departments';
import type { LeaderboardSort, TaskSort } from './sorting';
import ui from '../../styles/ui.module.css';
import styles from './DepartmentPage.module.css';
import { formatDateTime } from '../../utils';

export default function DepartmentPage({ department }: { department: LeaderboardDepartment }) {
  const { leaderboard, tasks, reset, loading, error, issues, excludedRequests, fetchLeaderboard } = useLeaderboard(department);
  const [activeTab, setActiveTab] = useState<'activity' | 'tasks'>('activity');
  const [leaderboardSort, setLeaderboardSort] = useState<LeaderboardSort>({ key: 'points', direction: 'desc' });
  const [taskSort, setTaskSort] = useState<TaskSort>({ key: 'description', direction: 'asc' });
  const isHR = department === 'HR';
  const changeLeaderboardSort = (key: LeaderboardSort['key']) => {
    setLeaderboardSort(previous => ({
      key, direction: previous.key === key && previous.direction === 'desc' ? 'asc' : 'desc',
    }));
  };
  const changeTaskSort = (key: TaskSort['key']) => {
    setTaskSort(previous => ({
      key, direction: previous.key === key && previous.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <main className={`${ui.page} ${styles.page}`}>
      <header className={styles.banner}>
        <div className={styles.logoFrame}>
          <img src={`/icons/logo${department}.png`} alt={`${department} Logo`} />
        </div>
        <h1>PUNCTAJ TOTAL {department}</h1>
      </header>
      {loading ? (
        <div className={styles.content}><p className={styles.loading} role="status">Se încarcă...</p></div>
      ) : (
        <>
          <LeaderboardNotices error={error} issues={issues} excludedRequests={excludedRequests} retry={fetchLeaderboard} />
          {reset && <div className={ui.notices}><p className={ui.notice}>Punctajele includ aprobările de la {formatDateTime(reset.resetAt.toDate())}.</p></div>}
          <div className={styles.tabs} aria-label="Conținut departament">
            <button type="button" className={`${ui.button} ${activeTab === 'activity' ? styles.activeTab : ''}`}
              aria-pressed={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>
              Activitate Utilizatori
            </button>
            <button type="button" className={`${ui.button} ${activeTab === 'tasks' ? styles.activeTab : ''}`}
              aria-pressed={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')}>
              Task-uri Disponibile
            </button>
          </div>
          <div className={styles.content}>
            <div className={styles.tableContainer}>
              {activeTab === 'activity'
                ? <LeaderboardTable people={leaderboard} sort={leaderboardSort} onSort={changeLeaderboardSort} />
                : <AvailableTasksTable tasks={tasks} sort={taskSort} onSort={changeTaskSort} />}
            </div>
          </div>
          <DepartmentDecorations interactive={isHR} />
          <div className={styles.footerBanner} />
        </>
      )}
    </main>
  );
}
