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

  // Datele pentru tabelul PR din imagini - în ordinea exactă (exclud cei cu 0 puncte)
  const tableData = [
    { name: "Achitei Alexandru", score: 45 },
    { name: "Adam Iasmina", score: 520 },
    { name: "Alupului Diana", score: 630 },
    { name: "Andronache Codrina", score: 435 },
    { name: "Azoltei Cristina", score: 265 },
    { name: "Bacaita Roxana", score: 55 },
    { name: "Barcan Nicoleta", score: 15 },
    { name: "Biciusca Rares", score: 40 },
    { name: "Bujoreanu Iulian", score: 145 },
    { name: "Busaga Maria", score: 60 },
    { name: "Butacu Catalin", score: 30 },
    { name: "Caba Andrei", score: 50 },
    { name: "Caprian Denisa", score: 100 },
    { name: "Ciobanu Ana-Maria", score: 15 },
    { name: "Coman Stefan", score: 130 },
    { name: "Cotovan Teodora", score: 100 },
    { name: "Cozaru Cezara", score: 205 },
    { name: "Cozminca Smaranda", score: 30 },
    { name: "Craciun Elisaveta", score: 230 },
    { name: "Craciun Iuliana", score: 25 },
    { name: "Cusmir Paul", score: 275 },
    { name: "Diaconu Daniel", score: 195 },
    { name: "Hoha Elena Nona", score: 640 },
    { name: "Ifrim Simina-Ana", score: 140 },
    { name: "Iftimescu Andreea", score: 80 },
    { name: "Manolache Ana", score: 420 },
    { name: "Matei Stefan-Cristian", score: 1520 },
    { name: "Miron Smaranda-Gabriela", score: 50 },
    { name: "Miron Xenia", score: 105 },
    { name: "Morosanu George (florhe)", score: 80 },
    { name: "Nica Mirela", score: 200 },
    { name: "Paduraru Mara", score: 150 },
    { name: "Petrisor Alex Gabriel", score: 65 },
    { name: "Pintiuc Ana Rebeca", score: 245 },
    { name: "Plugaru Paraschiva (Coca)", score: 30 },
    { name: "Popescu Ana", score: 150 },
    { name: "Rachieru Lavinia", score: 10 },
    { name: "Rotaru Irina", score: 145 },
    { name: "Simionescu Edmond", score: 150 },
    { name: "Spinu Ioana Teodora", score: 1025 },
    { name: "Stefan-Vladut Radu", score: 130 },
    { name: "Stoean Vlad", score: 60 },
    { name: "Tataru Maria-Alexandra", score: 75 },
    { name: "Toscariu Alexandra", score: 1185 },
    { name: "Turceac Tiberiu", score: 105 },
    { name: "Vacarciuc Alexandru", score: 1230 },
    { name: "Varga Matteo", score: 660 },
    { name: "Yasmeen", score: 535 },
    { name: "Zarnica Alexandru", score: 755 }
  ].filter(person => person.score > 0); // Exclud automat cei cu 0 puncte

  // Task-urile specifice pentru PR din imaginile furnizate
  const tasksData = [
    'AI LUAT O RESPONSABILITATE PE DEPARTAMENT (150P)',
    'AI REALIZAT O MAPA DE COLABORARE/SURVIVAL GUIDE (100P)',
    'AI REALIZAT O MAPA RAPORT (50P)',
    'AI FACUT UN DESIGN PENTRU O POSTARE (25P)',
    'AI FACUT UN STICKER (25P)',
    'AI PROPUS IDEI DE IMAGINE LA BSS (5P)',
    'AI REALIZAT UN DRAFT DE MOODBOARD (20P)',
    'AI REALIZAT UN DRAFT DE DESIGN BOARD (50P)',
    'AI REALIZAT UN DRAFT DE GADGET (25P)',
    'AI REALIZAT UN TRICOU/HANORAC (50P)',
    'AI REALIZAT UN DRAFT DE DIPLOMA (25P)',
    'AI EDITAT UN VIDEO DE PROMO (100P)',
    'AI EDITAT UN REEL (50P)',
    'AI FACUT UN COVER/POZA DE PROFIL (30P)',
    'AI FACUT UN TIMELINE DE POSTARI (100P)',
    'AI SCRIS UN TEXT PENTRU O POSTARE (15P)',
    'TE-AI OCUPAT DE SCRIPT/FILMAT PT VIDEO DE PROMO (50P)',
    'AI FOST ACTOR INTR-UN VIDEO (10P)',
    'AI FOST HOST LA UN PODCAST (75P)',
    'AI FACUT SCRIPT PENTRU PODCAST (50P)',
    'AI FACUT PROMO CAMIN (15P)',
    'AI FOST LA PROMO 3 ZILE CONSECUTIV (100P)',
    'AI FACUT PROMO LA UN CURS (25P)',
    'AI SUNAT PENTRU PARTENERI MEDIA (10P)',
    'AI FACUT O CAMPANIE DE GOOGLE ADS (100P)',
    'AI VENIT CU O IDEE DE PROMO OUTSIDE THE BOX CARE SA AJUTAT CU O SELECTIE DE POZE (50P)',
    'AI AJUTAT CU O SELECTIE DE POZE (25P)',
    'FACILITATOR KT/MENTORAT/WS OFFICE (250P)',
    'AI PARTICIPAT LA WS/TRAINING/MENTORAT (50P)'
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