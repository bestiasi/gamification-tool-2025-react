import type { DepartmentTask } from '../../models';
import { sortTasks, type TaskSort } from './sorting';
import SortableHeader from './SortableHeader';
import styles from './DepartmentPage.module.css';

interface Props {
  tasks: DepartmentTask[];
  sort: TaskSort;
  onSort: (key: TaskSort['key']) => void;
}

export default function AvailableTasksTable({ tasks, sort, onSort }: Props) {
  const rows = sortTasks(tasks, sort);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {(['description', 'points'] as const).map(key => (
            <SortableHeader key={key} label={key === 'description' ? 'DESCRIERE TASK' : 'PUNCTE'}
              direction={sort.key === key ? sort.direction : undefined} onSort={() => onSort(key)} />
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={2} className={styles.empty}>Nu există task-uri disponibile</td></tr>
        ) : rows.map(task => (
          <tr key={task.id}><td>{task.description}</td><td>{task.points}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
