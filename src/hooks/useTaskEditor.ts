import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { REQUEST_DEPARTMENTS } from '../constants/departments';
import { hasDepartmentAccess } from '../utils/roles';
import type { DepartmentTask, RequestDepartment } from '../models';
import { useTasks } from './useTasks';

export function useTaskEditor(active = true) {
  const { departments } = useAuth();
  // Tasks exist only for departments members can request points in.
  const availableDepartments = REQUEST_DEPARTMENTS.filter(value => hasDepartmentAccess(departments, value));
  const [selected, setSelected] = useState<RequestDepartment | ''>('');
  const department = selected && availableDepartments.includes(selected) ? selected : availableDepartments[0] ?? '';
  const tasks = useTasks(active ? department || undefined : undefined);
  const [editing, setEditing] = useState<DepartmentTask | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const submitting = useRef(false);

  const closeForm = () => { setEditing(null); setShowForm(false); setDescription(''); setPoints(''); };
  useEffect(() => { closeForm(); setError(''); setMessage(''); }, [department]);

  const run = async (operation: () => Promise<unknown>, success: string) => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true); setError(''); setMessage('');
    try {
      await operation();
      closeForm();
      setMessage(success);
    } catch (error) {
      console.error('Error editing task:', error);
      setError(error instanceof Error ? error.message : 'Task-ul nu a putut fi actualizat.');
    } finally { submitting.current = false; setBusy(false); }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    await run(async () => {
      if (!department) throw new Error('Selectează un departament.');
      if (editing) await tasks.update(editing.id, description, Number(points));
      else await tasks.create({ department, description, points: Number(points) });
    }, 'Task salvat. Punctajele cererilor aprobate se recalculează automat.');
  };
  const remove = (task: DepartmentTask) => {
    if (confirm('Ștergi acest task? Cererile asociate vor fi excluse din punctaj.')) {
      void run(() => tasks.remove(task.id), 'Task șters.');
    }
  };
  const edit = (task: DepartmentTask) => {
    setEditing(task); setShowForm(true); setDescription(task.description); setPoints(String(task.points));
  };

  return {
    tasks, availableDepartments, department, setSelected, editing, showForm, setShowForm,
    description, setDescription, points, setPoints, busy, error, message, closeForm, save, remove, edit,
  };
}
