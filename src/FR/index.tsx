import { useEffect } from 'react';
import '../App.css';
import './FR.css';

function FR() {
  // JavaScript pentru hover simultan pe nume și scor ca la PR
  useEffect(() => {
    const table = document.querySelector('.fr-table');
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

  // Datele pentru tabelul FR din imaginile furnizate (exclud cei cu 0 puncte)
  const tableData = [
    { name: "Andronache Codrina", score: 2622 },
    { name: "Azoltei Cristina", score: 170 },
    { name: "Caprian Denisa", score: 995 },
    { name: "Coman Stefan", score: 1341 },
    { name: "Butacu Catalin", score: 260 },
    { name: "Diaconu Daniel", score: 930 },
    { name: "Pintiuc Ana Rebeca", score: 425 },
    { name: "Simionescu Edmond", score: 2035 },
    { name: "Cotovan Teodora", score: 2172 },
    { name: "Spinu Ioana Teodora", score: 533 },
    { name: "Matei Stefan-Cristian", score: 871 },
    { name: "Vacarciuc Alexandru", score: 325 },
    { name: "Cozminca Smaranda", score: 1044 },
    { name: "Craciun Elisaveta", score: 170 },
    { name: "Caba Andrei", score: 63 },
    { name: "Lupu Cosette Ioana", score: 250 },
    { name: "Zarnica Alexandru", score: 50 },
    { name: "Cozaru Cezara", score: 644 },
    { name: "Stefan-Vladut Radu", score: 750 },
    { name: "Toscariu Alexandra", score: 60 },
    { name: "Yasmeen", score: 89 },
    { name: "Rotaru Irina", score: 50 },
    { name: "Busaga Maria", score: 50 },
    { name: "Stoean Vlad", score: 120 },
    { name: "Turceac Tiberiu", score: 50 },
    { name: "Miron Xenia", score: 50 },
    { name: "Atomei Cristian", score: 263 },
    { name: "Varga Matteo", score: 350 },
    { name: "Barcan Nicoleta", score: 80 },
    { name: "Bacaita Roxana", score: 50 },
    { name: "Plugaru Paraschiva (Coca)", score: 50 },
    { name: "Paduraru Mara", score: 89 },
    { name: "Cusmir Paul", score: 50 },
    { name: "Manolache Ana", score: 50 },
    { name: "Craciun Iuliana", score: 50 },
    { name: "Ciobanu Ana-Maria", score: 50 },
    { name: "Nica Mirela", score: 50 },
    { name: "Bujoreanu Iulian", score: 50 },
    { name: "Ghurea Andrei", score: 50 },
    { name: "Petrisor Edi", score: 50 },
    { name: "Achitei Alexandru", score: 50 },
    { name: "Dascalu Laura", score: 50 },
    { name: "Ifrim Simina-Ana", score: 50 },
    { name: "Biciusca Rares", score: 50 },
    { name: "Baetu Narcis", score: 50 },
    { name: "Cojocariu Lucian", score: 50 },
    { name: "Rotari Cristina", score: 50 },
    { name: "Piu Bianca-Raluca", score: 50 },
    { name: "Popescu Ana", score: 50 },
    { name: "Miron Smaranda-Gabriela", score: 50 },
    { name: "Andrei Alexandru-Marian", score: 50 },
    { name: "Iftimescu Andreea", score: 50 },
    { name: "Tataru Maria-Alexandra", score: 50 },
    { name: "Cocoveica Tudor", score: 50 }
  ].filter(person => person.score > 0); // Exclud automat cei cu 0 puncte

  // Task-urile specifice pentru FR din lista furnizată
  const tasksData = [
    'PARTICIPI LA UN TRAINING/MENTORAT FR (50P)',
    'FACILITEZI SI ORGANIZEZI UN TRAINING/MENTORAT FR (250P)',
    'AI O RESPONSABILITATE DE DEPARTAMENT (150P)',
    'CURAT HUBSPOT(1 PCT PER COMPANIE/MAX 100) (2P)',
    'REALIZAREA DE RESEARCH CPY PENTRU FR LBG EXTRA EVENIMENTE/SEDIU (45P)',
    'CONTACTAREA UNEI CPY PENTRU FR LBG EXTRA (15P)',
    'RĂSPUNS POZITIV CPY PENTRU FR LBG EXTRA (85P)',
    'PARTICIPAREA LA O SESIUNE DE FR DIN SEDIU/2(SEARA) TEMATICA (15P)',
    'REVENIT CU REMINDER IN MAXIM O SĂPTĂMÂNĂ LA UN EVENIMENT (2P)',
    'FR PE TEREN (35P)',
    'SUNAT COMPANII PENTRU UN EVENIMENT (10P)',
    'O ÎNTÂLNIRE STABILITĂ PENTRU UN EVENIMENT (45P)',
    'UN RĂSPUNS POZITIV PENTRU CPY TEHNICA (100P)',
    'UN RĂSPUNS POZITIV PENTRU O CPY BARTER/EDUCATIONAL (70P)',
    'COMPLETAREA HUBSPOT-ULUI PE ÎNTREAGA DURATĂ A PROCESULUI DE FR LA EVENIMENTUL RESPECTIV (180P)',
    'PARTICIPAREA LA O SESIUNE DEDICATĂ DE SUNAT DIN SEDIU (15P)',
    'PARTICIPAREA LA UN TRAINING EXTERN FR/GRANTS RELATED (85P)',
    'ADUCEREA DE CĂRȚI DE VIZITĂ DIN EVENIMENTE DE NETWORKING (45P)',
    'RESEARCH DE GRANTURI (260P)',
    'SCRIERE/PREGĂTIRE GRANTURI (35P)',
    'FEEDBACK GRANTURI (215P)',
    'TASK EXTRA PE GRANTURI (170P)'
  ];

  return (
    <div className="fr-page">
      <div className="fr-top-banner">
        <div className="icon-container">
          <img 
            src="/icons/logoFR.png"
            alt="FR Manager" 
            style={{
              width: '70px', 
              height: '70px', 
            }}
          />
        </div>
        <h1>PUNCTAJ ANUAL FR</h1>
      </div>

      <div className="fr-content">
        <div className="fr-table-container">
          <table className="fr-table">
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

      <div className="fr-footer-banner"></div>
    </div>
  );
}

export default FR;