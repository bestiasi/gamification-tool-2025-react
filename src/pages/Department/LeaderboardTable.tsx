import type { Department, UserPoints } from '../../models';
import { sortLeaderboard, type LeaderboardSort } from './sorting';
import SortableHeader from './SortableHeader';
import styles from './DepartmentPage.module.css';

interface Props {
  people: UserPoints[];
  sort: LeaderboardSort;
  onSort: (key: LeaderboardSort['key']) => void;
  taskDepartments?: ReadonlyMap<string, Department>;
}

export default function LeaderboardTable({ people, sort, onSort, taskDepartments }: Props) {
  const columns = [
    { key: 'name', label: 'BESTAN', className: styles.nameCell },
    { key: 'points', label: 'PUNCTAJ TOTAL', className: styles.scoreCell },
    { key: 'tasks', label: 'TASK-URI COMPLETATE', className: styles.taskCell },
  ] as const;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map(column => (
            <SortableHeader key={column.key} className={column.className} label={column.label}
              direction={sort.key === column.key ? sort.direction : undefined} onSort={() => onSort(column.key)} />
          ))}
        </tr>
      </thead>
      <tbody>
        {people.length === 0 ? (
          <tr><td colSpan={3} className={styles.empty}>Nu există date disponibile</td></tr>
        ) : sortLeaderboard(people, sort).map(person => (
          <tr key={person.email}>
            <td className={styles.nameCell}>{person.name}</td>
            <td className={styles.scoreCell}>{person.totalPoints}</td>
            <td className={styles.taskCell}>
              <div className={styles.taskScroll}>
                {person.tasks.map(task => (
                  <div key={task.taskId} className={styles.taskItem}>
                    <strong>{taskDepartments?.has(task.taskId) && `[${taskDepartments.get(task.taskId)}] `}{task.count} x {task.task} ({task.basePoints} puncte) = {task.points} puncte</strong>
                  </div>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
