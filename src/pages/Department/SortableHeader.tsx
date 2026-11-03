import styles from './DepartmentPage.module.css';

interface Props {
  label: string;
  direction?: 'asc' | 'desc';
  onSort: () => void;
  className?: string;
}

export default function SortableHeader({ label, direction, onSort, className = '' }: Props) {
  return (
    <th scope="col" className={className}
      aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}>
      <button type="button" onClick={onSort} title={`Sortează după ${label.toLocaleLowerCase('ro-RO')}`}>
        <span>{label}</span>
        <span className={styles.sortIndicator} aria-hidden="true">
          {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}
        </span>
      </button>
    </th>
  );
}
