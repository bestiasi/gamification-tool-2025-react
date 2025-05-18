import '../App.css';
import './HR.css';

function HR() {
  return (
    <div className="hr-page">
      {/* Elemente decorative */}
      <div className="decorative-elements">
        <div className="star star-1">★</div>
        <div className="star star-2">★</div>
        <div className="star star-3">★</div>
        <div className="star star-4">★</div>
        <div className="star star-5">★</div>
        <div className="star star-6">★</div>
        <div className="star star-7">★</div>
        <div className="star star-8">★</div>
        <div className="decoration decoration-1">♪</div>
        <div className="decoration decoration-2">♫</div>
        <div className="decoration decoration-3">☺</div>
        <div className="decoration decoration-4">♪</div>
        <div className="decoration decoration-5">♩</div>
      </div>

      {/* Bloc galben sub header exact ca în imaginea exemplu */}
      <div className="hr-top-banner">
        <div className="icon-container">
          <i className="hr-icon">👥</i>
        </div>
        <h1>PUNCTAJ ANUAL HR</h1>
      </div>

      {/* Conținut principal cu tabelul */}
      <div className="hr-content">
        <div className="hr-table-container">
          <table className="hr-table">
            <thead>
              <tr>
                <th className="name-column">NUME ȘI PRENUME BESTIAN</th>
                <th className="score-column">PUNCTAJ TOTAL</th>
                <th className="task-column">PUNCTAJ FIECARE TASK</th>
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
      <div className="hr-footer-banner"></div>
    </div>
  );
}

export default HR;