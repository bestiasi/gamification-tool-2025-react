import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { addSecretary, getAllSecretaries, removeSecretary } from '../services/secretaryService';
import type { SecretaryInfo } from '../services/secretaryService';
import { accessibleDepartments } from '../constants/departments';
import { hasDepartmentAccess } from '../utils/roles';
import type { Department } from '../models';

export function useSecretaries(active = true) {
  const { user, departments } = useAuth();
  const availableDepartments = accessibleDepartments(departments);
  const [secretaries, setSecretaries] = useState<SecretaryInfo[]>([]);
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<Department | ''>('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const submitting = useRef(false);
  const retry = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    let current = true;
    setLoading(active); setLoadError(''); setSecretaries([]);
    if (!active) return;
    getAllSecretaries().then(result => {
      if (current) setSecretaries(result.filter(secretary => secretary.departments.some(value => hasDepartmentAccess(departments, value))));
    }).catch((error: unknown) => {
      console.error('Error loading secretaries:', error);
      if (current) setLoadError(error instanceof Error ? error.message : 'Secretarii nu au putut fi încărcați.');
    }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [active, departments, revision]);

  const run = async (operation: () => Promise<void>) => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true); setError(''); setMessage('');
    try { await operation(); setMessage('Accesul a fost actualizat.'); retry(); }
    catch (error) {
      console.error('Error managing secretary:', error);
      setError(error instanceof Error ? error.message : 'Accesul nu a putut fi actualizat.');
    } finally { submitting.current = false; setBusy(false); }
  };
  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    await run(async () => {
      if (!user?.email || !department || !availableDepartments.includes(department)) throw new Error('Selectează un departament administrat.');
      await addSecretary(email, department);
      setEmail(''); setDepartment('');
    });
  };
  const remove = (secretary: SecretaryInfo) => {
    if (confirm(`Retragi accesul pentru ${secretary.email} doar din departamentele pe care le administrezi?`)) {
      void run(() => removeSecretary(secretary.email, departments));
    }
  };
  return {
    secretaries, email, setEmail, department, setDepartment, availableDepartments,
    loading, busy, error, loadError, message, retry, add, remove,
  };
}
