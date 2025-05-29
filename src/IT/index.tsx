import { useEffect } from 'react';
import '../App.css';
import './IT.css';

function IT() {
  // JavaScript pentru hover simultan pe nume și scor ca la PR
  useEffect(() => {
    const table = document.querySelector('.it-table');
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

  // Datele pentru tabelul IT din imagini - în ordinea exactă (exclud cei cu 0 puncte)
  const tableData = [
    { name: "Achitei Alexandru", score: 30 },
    { name: "Adam Iasmina", score: 30 },
    { name: "Alupului Diana", score: 30 },
    { name: "Andronache Codrina", score: 195 },
    { name: "Atomei Cristian", score: 50 },
    { name: "Azoltei Cristina", score: 170 },
    { name: "Bacaita Roxana", score: 20 },
    { name: "Baetu Narcis", score: 30 },
    { name: "Biciusca Rares", score: 65 },
    { name: "Bujoreanu Iulian", score: 70 },
    { name: "Busaga Maria", score: 275 },
    { name: "Butacu Catalin", score: 1340 },
    { name: "Caba Andrei", score: 455 },
    { name: "Caprian Denisa", score: 170 },
    { name: "Ciobanu Ana-Maria", score: 30 },
    { name: "Cocoveica Tudor", score: 625 },
    { name: "Copceanu Lucian", score: 945 },
    { name: "Coman Stefan", score: 1445 },
    { name: "Cozaru Cezara", score: 35 },
    { name: "Craciun Elisaveta", score: 45 },
    { name: "Cusmir Paul", score: 40 },
    { name: "Diaconu Daniel", score: 182 },
    { name: "Ghurea Andrei", score: 180 },
    { name: "Hoha Elena Nona", score: 10 },
    { name: "Matei Stefan-Cristian", score: 135 },
    { name: "Mihalache Mihai", score: 135 },
    { name: "Miron Smaranda-Gabriela", score: 155 },
    { name: "Miron Xenia", score: 50 },
    { name: "Morosanu George (florhe)", score: 20 },
    { name: "Nica Mirela", score: 20 },
    { name: "Petrisor Edi", score: 20 },
    { name: "Pintiuc Ana Rebeca", score: 355 },
    { name: "Plugaru Paraschiva (Coca)", score: 80 },
    { name: "Rachieru Lavinia", score: 30 },
    { name: "Rotari Cristina", score: 10 },
    { name: "Rotaru Irina", score: 760 },
    { name: "Simionescu Edmond", score: 90 },
    { name: "Spinu Ioana Teodora", score: 785 },
    { name: "Stefan-Vladut Radu", score: 330 },
    { name: "Stoean Vlad", score: 820 },
    { name: "Toscariu Alexandra", score: 20 },
    { name: "Turceac Tiberiu", score: 585 },
    { name: "Vacarciuc Alexandru", score: 50 },
    { name: "Yagas Matteo", score: 10 },
    { name: "Yasmeen", score: 40 },
    { name: "Zarnica Alexandru", score: 177 },
    { name: "Mihut Robert", score: 82 },
    { name: "Marinescu Ioana", score: 45 },
    { name: "Manoilu Lukas", score: 315 },
    { name: "Serghei Smirnobov", score: 910 },
    { name: "Andrei Andrusca", score: 145 },
    { name: "Matei Iordache", score: 10 }
  ].filter(person => person.score > 0); // Exclud automat cei cu 0 puncte

  // Task-urile specifice pentru IT din imagine
  const tasksData = [
    'AI O RESPONSABILITATE PE DEPARTAMENT (150P)',
    'CREAZA WEBSITE-UL DE EVENIMENT TURA 1 FB (200P)',
    'CREAZA WEBSITE-UL DE EVENIMENT TURA 2 FB(50P)',
    'REALIZEAZA MOCKUP LA SITE (FIGMA/DESIGNXD) TURA 1 FB(50P)',
    'REALIZEAZA MOCKUP LA SITE (FIGMA/DESIGNXD) TURA 2 FB(25P)',
    'REALIZEAZA NECESSARUL DE LOGISTICA TURA 1 FB(25P)',
    'REALIZEAZA NECESSARUL DE LOGISTICA TURA 2 FB(25P)',
    'TINUT PV/AI LA UNA DINTRE SEDINTE (10P)',
    'MANAGERIAZA LOGISTICA SI COORDONAREA ECHIPEI TEHNICE ON EVENT(50P)',
    'FACE PARTE DINTR-O ECHIPA TEHNICA ON EVENT(20P)',
    'REALIZEAZA UN RESEARCH DE SALI/LOCATII PENTRU EVENIMENT(30P)',
    'SE OCUPA DE DEZVOLTAREA UNEI CERERI(10P)',
    'LIPSIRA A 10 ANSE IN CAMINE, FACULTATI, CAMPUS SI/SAU SITE(25P)',
    'CREARE NOUL DESIGN AL TRICOU HONOARAR DE DEPARTAMENT(150P)',
    'REALIZEAZA UNI TUTORUI (GOOGLE ANALYTICS/URL BUILDER ETC) (100P)',
    'PARTICIPARE LA O ACTIVITATE PE DEPARTAMENT (REACT/WORDPRESS) (10P)',
    'REALIZEAZA UNUI MENTORAT/WS/TRAINING PE IT (250P)'
  ];

  return (
    <div className="it-page">
      <div className="it-top-banner">
        <div className="icon-container">
          <img 
            src="/icons/logoIT.png"
            alt="IT Manager" 
            style={{
              width: '70px', 
              height: '70px', 
            }}
          />
        </div>
        <h1>PUNCTAJ ANUAL IT</h1>
      </div>

      <div className="it-content">
        <div className="it-table-container">
          <table className="it-table">
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

      <div className="it-footer-banner"></div>
    </div>
  );
}

export default IT;