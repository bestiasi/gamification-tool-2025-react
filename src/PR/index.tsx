import { useEffect } from 'react';
import '../App.css';
import './PR.css';

function PR() {
  // JavaScript pentru hover simultan pe nume și scor ca la HR
  useEffect(() => {
    const table = document.querySelector('.pr-table');
    if (!table) return;
    
    // Găsește toate rândurile din tabel
    const rows = table.querySelectorAll('tbody tr');
    const eventListeners: Array<{element: Element, event: string, handler: () => void}> = [];
    
    rows.forEach(row => {
      const nameCell = row.querySelector('td:nth-child(1)');
      const scoreCell = row.querySelector('td:nth-child(2)');
      
      if (!nameCell || !scoreCell) return;
      
      // Funcție pentru a adăuga hover simultan pe nume și scor
      const addSimultaneousHover = () => {
        nameCell.classList.add('js-hover');
        scoreCell.classList.add('js-hover');
      };
      
      // Funcție pentru a elimina hover simultan
      const removeSimultaneousHover = () => {
        nameCell.classList.remove('js-hover');
        scoreCell.classList.remove('js-hover');
      };
      
      // Event listeners pentru nume
      nameCell.addEventListener('mouseenter', addSimultaneousHover);
      nameCell.addEventListener('mouseleave', removeSimultaneousHover);
      
      // Event listeners pentru scor
      scoreCell.addEventListener('mouseenter', addSimultaneousHover);
      scoreCell.addEventListener('mouseleave', removeSimultaneousHover);
      
      // Salvează referințele pentru cleanup
      eventListeners.push(
        {element: nameCell, event: 'mouseenter', handler: addSimultaneousHover},
        {element: nameCell, event: 'mouseleave', handler: removeSimultaneousHover},
        {element: scoreCell, event: 'mouseenter', handler: addSimultaneousHover},
        {element: scoreCell, event: 'mouseleave', handler: removeSimultaneousHover}
      );
    });

    // Cleanup function pentru a elimina event listeners
    return () => {
      eventListeners.forEach(({element, event, handler}) => {
        element.removeEventListener(event, handler);
      });
    };
  }, []); // Se execută o dată când componenta se încarcă

  // Datele pentru tabelul PR
  const tableData = [
    { name: "NUME 1", score: 100 },
    { name: "NUME 2", score: 70 },
    { name: "NUME 3", score: 50 },
    { name: "...", score: "..." },
    { name: "...", score: "..." },
    { name: "...", score: "..." },
    { name: "NUME N", score: 1 },
  ];

  // Task-urile specifice pentru PR din imagine
  const tasksData = [
    'AI LUAT O RESPONSABILITATE PE DEPARTAMENT (150P)',
    'AI REALIZAT O MAPA DE COLABORARE/SURVIVAL GUIDE (100P)',
    'AI REALIZAT O MAPA RAPORT (50P)',
    'AI FACUT UN DESIGN PENTRU O POSTARE (25P)',
    'AI FACUT UN STICKER (25P)',
    'AI REALIZAT UN DRAFT DE DESIGN BOARD (50P)',
    'AI REALIZAT UN DRAFT DE GADGET (25P)',
  ];

  return (
    <div className="pr-page">
      <div className="pr-top-banner">
        <div className="icon-container">
          📢 {/* Iconiță specifică pentru PR */}
        </div>
        <h1>PUNCTAJ ANUAL PR</h1>
      </div>

      <div className="pr-content">
        <div className="pr-table-container">
          <table className="pr-table">
            <thead>
              <tr>
                <th className="name-column">NUME ȘI PRENUME BESTIAN</th>
                <th className="score-column">PUNCTAJ TOTAL</th>
                <th className="task-column">PUNCTAJ FIECARE TASK</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((person, index) => (
                <tr key={index} className={index % 2 === 0 ? "row-light" : "row-dark"}>
                  <td className="name-column">{person.name}</td>
                  <td className="score-column">{person.score}</td>
                  {index === 0 && (
                    <td rowSpan={tableData.length} className="task-column">
                      <div className="task-text-large">
                        {tasksData.map((task, taskIndex) => (
                          <span key={taskIndex}>
                            <strong>{task}</strong>
                            {taskIndex < tasksData.length - 1 && <><br /><br /></>}
                          </span>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Elemente decorative ca la HR */}
      <div className="decorative-elements">
        <div className="star star-1">⭐</div>
        <div className="star star-2">✨</div>
        <div className="star star-3">⭐</div>
        <div className="star star-4">✨</div>
        <div className="star star-5">⭐</div>
        <div className="star star-6">✨</div>
        
        <div className="decoration decoration-1">💫</div>
        <div className="decoration decoration-2">🌟</div>
        <div className="decoration decoration-3">💫</div>
        <div className="decoration decoration-4">🌟</div>
        <div className="decoration decoration-5">💫</div>
      </div>

      <div className="pr-footer-banner"></div>
    </div>
  );
}

export default PR;