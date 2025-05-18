import '../App.css';
import './HR.css';

function HR() {
  return (
    <div className="hr-page">
      {/* Banner galben lipit de header */}
      <div className="banner-section">
        <div className="icon-wrapper">👥</div>
        <h1 className="banner-title">PUNCTAJ ANUAL HR</h1>
      </div>

      {/* Conținut principal cu tabelul */}
      <div className="main-content">
        <div className="table-wrapper">
          <table className="score-table">
            <thead>
              <tr>
                <th className="name-col">NUME ȘI PRENUME BESTIAN</th>
                <th className="score-col">PUNCTAJ TOTAL</th>
                <th className="task-col">PUNCTAJ FIECARE TASK</th>
              </tr>
            </thead>
            <tbody>
              <tr className="row-light">
                <td>NUME 1</td>
                <td>100</td>
                <td>AI O RESPONSABILITATE PE DEPARTAMENT (ECHIPE, SECRETAR, BECAS, BEST MOOD) (150P)</td>
              </tr>
              <tr className="row-dark">
                <td>NUME 2</td>
                <td>70</td>
                <td>ORGANIZEZI O ACTIVITATE DE FUN (100P)</td>
              </tr>
              <tr className="row-light">
                <td>NUME 3</td>
                <td>50</td>
                <td>FACI PARTE DIN ECHIPA DE ACTIVITĂȚI (50P)</td>
              </tr>
              <tr className="row-dark">
                <td>...</td>
                <td>...</td>
                <td>PARTICIPI LA O ACTIVITATE DE FUN (15P)</td>
              </tr>
              <tr className="row-light">
                <td>...</td>
                <td>...</td>
                <td>ORGANIZEZI UN TEAMBUILDING (100P)</td>
              </tr>
              <tr className="row-dark">
                <td>...</td>
                <td>...</td>
                <td>FACILITEZI UN TEAMBUILDING (200P)</td>
              </tr>
              <tr className="row-light">
                <td>NUME N</td>
                <td>1</td>
                <td>PARTICIPI LA UN TEAMBUILDING (50P)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bara galbenă înainte de footer */}
      <div className="footer-bar"></div>
    </div>
  );
}

export default HR;