import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import '../../App.css';
import './HR.css';

interface UserPoints {
  name: string;
  email: string;
  totalPoints: number;
  tasks: Array<{task: string; points: number; count?: number; basePoints?: number}>;
}

interface DepartmentTask {
  id: string;
  department: string;
  description: string;
  points: number;
}

function HR() {
  const [tableData, setTableData] = useState<UserPoints[]>([]);
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTask[]>([]);
  const [activeTab, setActiveTab] = useState<'activity' | 'tasks'>('activity');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{key: 'name' | 'points' | 'tasks'; direction: 'asc' | 'desc'}>({
    key: 'points',
    direction: 'desc'
  });

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch department tasks first to get actual points
        const tasksQuery = query(
          collection(db, 'departmentTasks'),
          where('department', '==', 'HR')
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const taskPointsMap = new Map<string, number>();
        const tasks: DepartmentTask[] = [];

        tasksSnapshot.forEach((doc) => {
          const data = doc.data();
          tasks.push({
            id: doc.id,
            ...data
          } as DepartmentTask);
          // Store points for each task description
          taskPointsMap.set(data.description, data.points);
        });

        setDepartmentTasks(tasks);

        // Fetch leaderboard with tasks
        const leaderboardQuery = query(
          collection(db, 'pointRequests'),
          where('department', '==', 'HR'),
          where('status', '==', 'approved')
        );

        const leaderboardSnapshot = await getDocs(leaderboardQuery);
        const pointsMap = new Map<string, UserPoints>();

        leaderboardSnapshot.forEach((doc) => {
          const data = doc.data();
          const userEmail = data.userEmail;
          const userName = data.userName;
          const taskDescription = data.task || 'Task nespecificat';
          const taskNumber = data.taskNumber || 1; // Number of times the task was done in this request
          
          // Extract task description (remove points suffix if present)
          const taskDescOnly = taskDescription.split(' (')[0].trim();
          
          // Get actual points from taskPointsMap
          let taskPoints = taskPointsMap.get(taskDescOnly) || 0;
          
          // If no match in taskPointsMap, try to parse from task string
          if (taskPoints === 0) {
            const match = taskDescription.match(/\((\d+)\s*puncte?\)/);
            if (match) {
              taskPoints = parseInt(match[1]);
            }
          }
          
          // Calculate total points for this request (points * repetitions)
          const totalTaskPoints = taskPoints * taskNumber;
          
          if (pointsMap.has(userEmail)) {
            const existing = pointsMap.get(userEmail)!;
            existing.totalPoints += totalTaskPoints;
            
            // Find if this task already exists by clean name
            const existingTask = existing.tasks.find(t => t.task === taskDescOnly);
            
            if (existingTask) {
              // Increment request count by 1 (not by taskNumber)
              existingTask.count = (existingTask.count || 0) + 1;
            } else {
              // Add new task (count = 1 for first request)
              existing.tasks.push({ 
                task: taskDescOnly, 
                points: 0, // Not used for display
                count: 1,
                basePoints: taskPoints
              });
            }
          } else {
            pointsMap.set(userEmail, {
              name: userName,
              email: userEmail,
              totalPoints: totalTaskPoints,
              tasks: [{ 
                task: taskDescOnly, 
                points: 0, // Not used for display
                count: 1,
                basePoints: taskPoints
              }]
            });
          }
        });

        const leaderboardData = Array.from(pointsMap.values())
          .filter(user => user.totalPoints > 0);

        setTableData(leaderboardData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sort data based on sortConfig
  const sortedData = [...tableData].sort((a, b) => {
    if (sortConfig.key === 'name') {
      const comparison = a.name.localeCompare(b.name);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    } else if (sortConfig.key === 'points') {
      return sortConfig.direction === 'asc' 
        ? a.totalPoints - b.totalPoints 
        : b.totalPoints - a.totalPoints;
    } else if (sortConfig.key === 'tasks') {
      const tasksA = a.tasks.length;
      const tasksB = b.tasks.length;
      return sortConfig.direction === 'asc' 
        ? tasksA - tasksB 
        : tasksB - tasksA;
    }
    return 0;
  });

  const handleSort = (key: 'name' | 'points' | 'tasks') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Mouse-interactive decorations
  useEffect(() => {
    const decorations = document.querySelectorAll('.star, .decoration');
    
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      decorations.forEach((decoration) => {
        const rect = decoration.getBoundingClientRect();
        const decorationX = rect.left + rect.width / 2;
        const decorationY = rect.top + rect.height / 2;
        
        const deltaX = mouseX - decorationX;
        const deltaY = mouseY - decorationY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Push away from cursor with smooth falloff
        const maxDistance = 300;
        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const pushX = -(deltaX / distance) * force * 40;
          const pushY = -(deltaY / distance) * force * 40;
          const rotation = force * 15 * (deltaX > 0 ? 1 : -1);
          const scale = 1 + force * 0.3;
          
          (decoration as HTMLElement).style.transform = `translate(${pushX}px, ${pushY}px) rotate(${rotation}deg) scale(${scale})`;
          (decoration as HTMLElement).style.transition = 'transform 0.3s ease-out';
        } else {
          (decoration as HTMLElement).style.transform = '';
          (decoration as HTMLElement).style.transition = 'transform 0.6s ease-out';
        }
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [tableData]);

  // JavaScript pentru hover simultan pe nume și scor
  useEffect(() => {
    const table = document.querySelector('.hr-table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    const eventListeners: Array<{element: Element, event: string, handler: () => void}> = [];
    
    rows.forEach(row => {
      const nameCell = row.querySelector('td:nth-child(1)');
      const scoreCell = row.querySelector('td:nth-child(2)');
      
      if (!nameCell || !scoreCell) return;
      
      const addSimultaneousHover = () => {
        nameCell.classList.add('js-hover');
        scoreCell.classList.add('js-hover');
      };
      
      const removeSimultaneousHover = () => {
        nameCell.classList.remove('js-hover');
        scoreCell.classList.remove('js-hover');
      };
      
      nameCell.addEventListener('mouseenter', addSimultaneousHover);
      nameCell.addEventListener('mouseleave', removeSimultaneousHover);
      scoreCell.addEventListener('mouseenter', addSimultaneousHover);
      scoreCell.addEventListener('mouseleave', removeSimultaneousHover);
      
      eventListeners.push(
        {element: nameCell, event: 'mouseenter', handler: addSimultaneousHover},
        {element: nameCell, event: 'mouseleave', handler: removeSimultaneousHover},
        {element: scoreCell, event: 'mouseenter', handler: addSimultaneousHover},
        {element: scoreCell, event: 'mouseleave', handler: removeSimultaneousHover}
      );
    });

    return () => {
      eventListeners.forEach(({element, event, handler}) => {
        element.removeEventListener(event, handler);
      });
    };
  }, [tableData]);

  if (loading) {
    return (
      <div className="hr-page">
        <div className="hr-top-banner">
          <img 
            src="/icons/logoHR.png"
            alt="HR Logo" 
            style={{
              width: '70px', 
              height: '70px',
              marginRight: '20px'
            }}
          />
          <h1>PUNCTAJ ANUAL HR</h1>
        </div>
        <div className="hr-content">
          <p style={{textAlign: 'center', color: 'white', fontSize: '24px'}}>Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hr-page">
      <div className="hr-top-banner">
        <img 
          src="/icons/logoHR.png"
          alt="HR Logo" 
          style={{
            width: '70px', 
            height: '70px',
            marginRight: '20px'
          }}
        />
        <h1>PUNCTAJ ANUAL HR</h1>
      </div>

      {/* Tabs */}
      <div className="department-tabs">
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📊 Activitate Utilizatori
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          📋 Task-uri Disponibile
        </button>
      </div>

      <div className="hr-content">
        {activeTab === 'activity' ? (
          <div className="hr-table-container">
            <table className="hr-table">
              <thead>
                <tr>
                  <th className="name-column sortable" onClick={() => handleSort('name')}>
                    BESTAN
                  </th>
                  <th className="score-column sortable" onClick={() => handleSort('points')}>
                    PUNCTAJ TOTAL
                  </th>
                  <th className="task-column sortable" onClick={() => handleSort('tasks')}>
                    TASK-URI COMPLETATE
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{textAlign: 'center', padding: '40px', color: 'white'}}>
                      Nu există date disponibile
                    </td>
                  </tr>
                ) : (
                  sortedData.map((person, index) => (
                    <tr key={person.email} className={index % 2 === 0 ? "row-light" : "row-dark"}>
                      <td className="name-column">{person.name}</td>
                      <td className="score-column">{person.totalPoints}</td>
                      <td className="task-column">
                        <div className="task-scroll-container">
                          {person.tasks.map((taskItem, taskIndex) => {
                            // Strip old points from task name
                            const taskNameOnly = taskItem.task.split(' (')[0].trim();
                            const displayPoints = taskItem.basePoints || taskItem.points;
                            return (
                              <div key={taskIndex} className="task-item">
                                <strong>{taskItem.count || 1} x {taskNameOnly} ({displayPoints} puncte)</strong>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="hr-table-container">
            <table className="hr-table">
              <thead>
                <tr>
                  <th className="task-column">DESCRIERE TASK</th>
                  <th className="score-column">PUNCTE</th>
                </tr>
              </thead>
              <tbody>
                {departmentTasks.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{textAlign: 'center', padding: '40px', color: 'white'}}>
                      Nu există task-uri disponibile
                    </td>
                  </tr>
                ) : (
                  departmentTasks.map((task, index) => (
                    <tr key={task.id} className={index % 2 === 0 ? "row-light" : "row-dark"}>
                      <td className="task-column">
                        <div className="task-text-large">
                          <strong>{task.description}</strong>
                        </div>
                      </td>
                      <td className="score-column">{task.points}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="decorative-elements">
        {/* STÂNGA */}
        <div className="star stea1">
          <img src="/icons/steastanga.png" alt="Decorative" />
        </div>
        <div className="decoration con1">
          <img src="/icons/confetiistanga.png" alt="Decorative" />
        </div>
        <div className="star stea2">
          <img src="/icons/steastanga.png" alt="Decorative" />
        </div>
        <div className="decoration con2">
          <img src="/icons/confetiimarestanga.png" alt="Decorative" />
        </div>
         <div className="decoration con3">
          <img src="/icons/confetiisimplu.png" alt="Decorative" />
        </div>
        <div className="star stea3">
          <img src="/icons/steastanga.png" alt="Decorative" />
        </div>
        <div className="decoration con4">
          <img src="/icons/confetiistanga.png" alt="Decorative" />
        </div>
        <div className="star stea4">
          <img src="/icons/steastanga.png" alt="Decorative" />
        </div>
        <div className="decoration con5">
          <img src="/icons/confetiimarestanga.png" alt="Decorative" />
        </div>
         <div className="decoration con6">
          <img src="/icons/confetiisimplu.png" alt="Decorative" />
        </div>
        <div className="star stea5">
          <img src="/icons/steastanga.png" alt="Decorative" />
        </div>
        <div className="decoration con7">
          <img src="/icons/confetiisimplu.png" alt="Decorative" />
        </div>
        <div className="star stea6">
          <img src="/icons/steastanga.png" alt="Decorative" />
        </div>
        <div className="decoration con8">
          <img src="/icons/confetiimarestanga.png" alt="Decorative" />
        </div>
        <div className="star stea7">
          <img src="/icons/steadreapta.png" alt="Decorative" />
        </div>
        <div className="decoration con9">
          <img src="/icons/confetiistanga.png" alt="Decorative" />
        </div>
        
        {/* DREAPTA */}
        <div className="star stea8">
          <img src="/icons/steadreapta.png" alt="Decorative" />
        </div>
        <div className="decoration con10">
          <img src="/icons/confetiidreapta.png" alt="Decorative" />
        </div>
        <div className="star stea9">
          <img src="/icons/steadreapta.png" alt="Decorative" />
        </div>
        <div className="decoration con11">
          <img src="/icons/confetiimaredreapta.png" alt="Decorative" />
        </div>
         <div className="decoration con12">
          <img src="/icons/confetiisimplu.png" alt="Decorative" />
        </div>
        <div className="star stea10">
          <img src="/icons/steadreapta.png" alt="Decorative" />
        </div>
        <div className="decoration con13">
          <img src="/icons/confetiidreapta.png" alt="Decorative" />
        </div>
        <div className="star stea11">
          <img src="/icons/steastanga.png" alt="Decorative" />
        </div>
        <div className="decoration con14">
          <img src="/icons/confetiimarestanga.png" alt="Decorative" />
        </div>
         <div className="decoration con15">
          <img src="/icons/confetiisimplu.png" alt="Decorative" />
        </div>
        <div className="star stea12">
          <img src="/icons/steastanga.png" alt="Decorative" />
        </div>
        <div className="decoration con16">
          <img src="/icons/confetiisimplu.png" alt="Decorative" />
        </div>
        <div className="star stea13">
          <img src="/icons/steadreapta.png" alt="Decorative" />
        </div>
        <div className="decoration con17">
          <img src="/icons/confetiimaredreapta.png" alt="Decorative" />
        </div>
        <div className="decoration con18">
          <img src="/icons/confetiidreapta.png" alt="Decorative" />
        </div>
        <div className="star stea14">
          <img src="/icons/steadreapta.png" alt="Decorative" />
        </div>
      </div>

      <div className="hr-footer-banner"></div>
    </div>
  );
}

export default HR;
