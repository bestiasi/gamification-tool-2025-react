import { useEffect, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { ERROR_MESSAGES, VALIDATION } from '../constants';
import type { DepartmentTask, RequestDepartment } from '../models';
import { createPointRequest, getDepartmentTasks } from '../services';
import { cappedInteger, validEventDate } from '../utils/scoring';

type RequestStep = 'department' | 'task' | 'date' | 'details';

export function useRequestForm(onClose: () => void, onSuccess: () => void) {
  const [user] = useAuthState(auth);
  const [currentStep, setCurrentStep] = useState<RequestStep>('department');
  const [selectedDepartment, setSelectedDepartment] = useState<RequestDepartment | ''>('');
  const [selectedTask, setSelectedTask] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [taskNumber, setTaskNumber] = useState('1');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const taskFetch = useRef(0);
  const submitting = useRef(false);
  const chosenTask = tasks.find(task => task.id === selectedTask);

  useEffect(() => () => { taskFetch.current++; }, []);

  const resetForm = () => {
    taskFetch.current++;
    setCurrentStep('department');
    setSelectedDepartment('');
    setSelectedTask('');
    setEventDate('');
    setTaskNumber('1');
    setDetails('');
    setError('');
    setTasks([]);
    setLoadingTasks(false);
  };

  const handleDepartmentSelect = async (department: RequestDepartment) => {
    const fetchId = ++taskFetch.current;
    setSelectedDepartment(department);
    setSelectedTask('');
    setTasks([]);
    setError('');
    setLoadingTasks(true);
    setCurrentStep('task');

    try {
      const taskList = await getDepartmentTasks(department);
      if (fetchId !== taskFetch.current) return;
      setTasks(taskList);
      if (taskList.length === 0) {
        setError(`Nu există task-uri disponibile pentru departamentul ${department}. Un admin trebuie să le adauge.`);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (fetchId !== taskFetch.current) return;
      setError(ERROR_MESSAGES.TASK.FETCH_ERROR);
    } finally {
      if (fetchId === taskFetch.current) setLoadingTasks(false);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTask(taskId);
    setCurrentStep('date');
  };

  const handleBack = () => {
    if (currentStep === 'task') setCurrentStep('department');
    else if (currentStep === 'date') setCurrentStep('task');
    else if (currentStep === 'details') setCurrentStep('date');
  };

  const handleNext = () => {
    if (currentStep === 'date' && validEventDate(eventDate)) setCurrentStep('details');
  };

  const handleClose = () => {
    if (submitting.current) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (submitting.current) return;
    if (!user?.email || !selectedDepartment || !chosenTask || !validEventDate(eventDate)) {
      setError(ERROR_MESSAGES.REQUEST.MISSING_FIELDS);
      return;
    }
    submitting.current = true;
    setLoading(true);
    setError('');

    try {
      await createPointRequest(
        user.email,
        {
          department: selectedDepartment, taskId: chosenTask.id, eventDate,
          taskNumber: cappedInteger(taskNumber, 'Numărul de repetări', VALIDATION.MAX_REPETITIONS), details,
        },
      );
    } catch (error) {
      console.error('Error submitting request:', error);
      setError(error instanceof Error ? error.message : ERROR_MESSAGES.REQUEST.SUBMIT_ERROR);
      return;
    } finally {
      submitting.current = false;
      setLoading(false);
    }
    resetForm();
    onSuccess();
    onClose();
  };

  return {
    currentStep, selectedDepartment, selectedTask, tasks, loadingTasks, loading, error,
    eventDate, setEventDate, taskNumber, setTaskNumber, details, setDetails,
    handleDepartmentSelect, handleTaskSelect, handleBack, handleNext, handleClose, handleSubmit,
  };
}
