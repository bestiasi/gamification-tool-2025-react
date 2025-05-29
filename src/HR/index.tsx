import { useEffect } from 'react';
import '../App.css';
import './HR.css';

function HR() {
  // JavaScript pentru hover simultan pe nume și scor ca la PR
  useEffect(() => {
    const table = document.querySelector('.hr-table');
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

  // Datele pentru tabelul HR din imagini - în ordinea exactă (exclud cei cu 0 puncte)
  const tableData = [
    { name: "Achitei Alexandru", score: 150 },
    { name: "Alupului Diana", score: 50 },
    { name: "Andrei Alexandru-Marian", score: 100 },
    { name: "Andronache Codrina", score: 300 },
    { name: "Azoltei Cristina", score: 2190 },
    { name: "Bacaita Roxana", score: 150 },
    { name: "Barcan Nicoleta", score: 150 },
    { name: "Biciusca Rares", score: 75 },
    { name: "Busaga Maria", score: 500 },
    { name: "Butacu Catalin", score: 725 },
    { name: "Caba Andrei", score: 700 },
    { name: "Caprian Denisa", score: 725 },
    { name: "Ciobanu Ana-Maria", score: 125 },
    { name: "Coman Stefan", score: 50 },
    { name: "Cozaru Cezara", score: 490 },
    { name: "Cozminca Smaranda", score: 350 },
    { name: "Craciun Elisaveta", score: 415 },
    { name: "Cusmir Paul", score: 125 },
    { name: "Dascalu Laura", score: 200 },
    { name: "Diaconu Daniel", score: 325 },
    { name: "Ghurea Andrei", score: 75 },
    { name: "Lupu Cosette Ioana", score: 400 },
    { name: "Matei Stefan-Cristian", score: 100 },
    { name: "Miron Smaranda-Gabriela", score: 400 },
    { name: "Miron Xenia", score: 50 },
    { name: "Morosanu George (florhe)", score: 200 },
    { name: "Petrisor Edi", score: 150 },
    { name: "Pintiuc Ana Rebeca", score: 500 },
    { name: "Plugaru Paraschiva (Coca)", score: 150 },
    { name: "Rachieru Lavinia", score: 250 },
    { name: "Rotaru Irina", score: 200 },
    { name: "Simionescu Edmond", score: 150 },
    { name: "Spinu Ioana Teodora", score: 75 },
    { name: "Stefan-Vladut Radu", score: 565 },
    { name: "Stircia Bogdan", score: 65 },
    { name: "Tudorache Afrodita", score: 700 },
    { name: "Turceac Tiberiu", score: 100 },
    { name: "Vacarciuc Alexandru", score: 400 },
    { name: "Varga Matteo", score: 15 },
    { name: "Yasmeen", score: 50 },
    { name: "Zarnica Alexandru", score: 615 }
  ].filter(person => person.score > 0); // Exclud automat cei cu 0 puncte

  // Task-urile specifice pentru HR din imaginile furnizate
  const tasksData = [
    'AI O RESPONSABILITATE PE DEPARTAMENT (ECHIPE, SECRETAR, BECAS, BEST MOOD) (150P)',
    'ORGANIZEZI O ACTIVITATE DE FUN (100P)',
    'FACI PARTE DIN ECHIPA DE ACTIVITĂȚI (50P)',
    'PARTICIPI LA O ACTIVITATE DE FUN (15P)',
    'ORGANIZEZI UN TEAMBUILDING (100P)',
    'FACILITEZI UN TEAMBUILDING (200P)',
    'PARTICIPI LA UN TEAMBUILDING (50P)',
    'FACI PARTE DIN CLUBUL DE LECTURA ACTIV (50P)',
    'PARTICIPI LA O ÎNTÂLNIRE A CLUBULUI DE LECTURA (15P)',
    'REALIZEZI UN FORMULAR DE FEEDBACK (150P)',
    'COMPLETEZI 3 FORMULARE DE FEEDBACK (100P/3 FORMULARE)',
    'CREEZI UN TOOL DE MONITORIZARE (75P)',
    'FACILITEZI SI ORGANIZEZI UN TRAINING/MENTORIAT HR (250P)',
    'PARTICIPI LA UN TRAINING/BKT/MENTORAT HR (50P)',
    'PARTICIPI LA ADVERSARE (50P)',
    'PARTICIPI ACTIV LA RECRUTARI (INTERVIUATOR, OBSERVER, PROMO CAMINE, GRĂSELI ETC.) (75P)',
    'EȘTI PARINTE (150P)',
    'RESPONSABIL TCOTO (75P)',
    'RESP. MEME-URI (75P)',
    'TASK ON-EVENT (WAKE-UP, BAR, CHECK IN ETC) (15/TASK)',
    'REALIZEZI UN FORMULAR DE AȘTEPTĂRI (100P)'
  ];

  return (
    <div className="hr-page">
      <div className="hr-top-banner">
        <div className="icon-container">
          <img 
            src="/icons/logoHR.png"
            alt="HR Manager" 
            style={{
              width: '70px', 
              height: '70px', 
            }}
          />
        </div>
        <h1>PUNCTAJ ANUAL HR</h1>
      </div>

      <div className="hr-content">
        <div className="hr-table-container">
          <table className="hr-table">
            <thead>
              <tr>
                <th className="name-column">NUME ȘI PRENUME BESTAN</th>
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

      <div className="decorative-elements">
        {/* STÂNGA -  */}
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

        
        
        {/* DREAPTA - */}
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

      <div className="hr-footer-banner"></div>
    </div>
  );
}

export default HR;