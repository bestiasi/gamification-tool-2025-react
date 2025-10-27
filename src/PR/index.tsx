import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../App.css';
import './PR.css';

interface UserPoints {
  name: string;
  email: string;
  totalPoints: number;
  tasks: Array<{task: string; points: number}>;
}

interface DepartmentTask {
  id: string;
  department: string;
  description: string;
  points: number;
}

function PR() {
  const [tableData, setTableData] = useState<UserPoints[]>([]);
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTask[]>([]);
  const [activeTab, setActiveTab] = useState<'activity' | 'tasks'>('activity');
  const [loading, setLoading] = useState(true);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch leaderboard with tasks
        const leaderboardQuery = query(
          collection(db, 'pointRequests'),
          where('department', '==', 'PR'),
          where('status', '==', 'approved')
        );

        const leaderboardSnapshot = await getDocs(leaderboardQuery);
        const pointsMap = new Map<string, UserPoints>();

        leaderboardSnapshot.forEach((doc) => {
          const data = doc.data();
          const userEmail = data.userEmail;
          const userName = data.userName;
          const task = data.task || 'Task nespecificat';
          
          if (pointsMap.has(userEmail)) {
            const existing = pointsMap.get(userEmail)!;
            existing.totalPoints += 1;
            existing.tasks.push({ task, points: 1 });
          } else {
            pointsMap.set(userEmail, {
              name: userName,
              email: userEmail,
              totalPoints: 1,
              tasks: [{ task, points: 1 }]
            });
          }
        });

        const leaderboardData = Array.from(pointsMap.values())
          .filter(user => user.totalPoints > 0)
          .sort((a, b) => b.totalPoints - a.totalPoints);

        setTableData(leaderboardData);

        // Fetch department tasks
        const tasksQuery = query(
          collection(db, 'departmentTasks'),
          where('department', '==', 'PR')
        );

        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks: DepartmentTask[] = [];

        tasksSnapshot.forEach((doc) => {
          tasks.push({
            id: doc.id,
            ...doc.data()
          } as DepartmentTask);
        });

        setDepartmentTasks(tasks);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // JavaScript pentru hover simultan pe nume și scor
  useEffect(() => {
    const table = document.querySelector('.pr-table');
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
      <div className="pr-page">
        <div className="pr-top-banner">
          <div className="icon-container">
            <img 
              src="/icons/logoPR.png"
              alt="PR Manager" 
              style={{
                width: '70px', 
                height: '70px', 
              }}
            />
          </div>
          <h1>PUNCTAJ ANUAL PR</h1>
        </div>
        <div className="pr-content">
          <p style={{textAlign: 'center', color: 'white', fontSize: '24px'}}>Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-page">
      <div className="pr-top-banner">
        <div className="icon-container">
          <img 
            src="/icons/logoPR.png"
            alt="PR Manager" 
            style={{
              width: '70px', 
              height: '70px', 
            }}
          />
        </div>
        <h1>PUNCTAJ ANUAL PR</h1>
      </div>

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

      <div className="pr-content">
        <div className="pr-table-container">
          {activeTab === 'activity' ? (
            <table className="pr-table">
              <thead>
                <tr>
                  <th className="name-column">NUME ȘI PRENUME BESTAN</th>
                  <th className="score-column">PUNCTAJ TOTAL</th>
                  <th className="task-column">PUNCTAJ FIECARE TASK</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{textAlign: 'center', padding: '40px', color: 'white'}}>
                      Nu există date disponibile
                    </td>
                  </tr>
                ) : (
                  tableData.map((person, index) => (
                    <tr key={person.email} className={index % 2 === 0 ? "row-light" : "row-dark"}>
                      <td className="name-column">{person.name}</td>
                      <td className="score-column">{person.totalPoints}</td>
                      <td className="task-column">
                        <div className="task-text-large">
                          {person.tasks.map((taskItem, taskIndex) => (
                            <span key={taskIndex}>
                              <strong>{taskItem.task} ({taskItem.points}P)</strong>
                              {taskIndex < person.tasks.length - 1 && <><br /><br /></>}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="pr-table">
              <thead>
                <tr>
                  <th>DESCRIERE TASK</th>
                  <th>PUNCTE</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} style={{textAlign: 'center', padding: '40px', color: 'white'}}>
                      Se încarcă...
                    </td>
                  </tr>
                ) : departmentTasks.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{textAlign: 'center', padding: '40px', color: 'white'}}>
                      Nu există task-uri disponibile
                    </td>
                  </tr>
                ) : (
                  departmentTasks.map((task, index) => (
                    <tr key={task.id} className={index % 2 === 0 ? "row-light" : "row-dark"}>
                      <td>{task.description}</td>
                      <td>{task.points}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
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

      <div className="pr-footer-banner"></div>
    </div>
  );
}

export default PR;
