import '../App.css';
import './PR.css';

function PR() {
  return (
    <div className="pr-page">
      {/* Elemente decorative similare cu HR */}
      <div className="decorative-elements">
        <div className="star star-1">★</div>
        <div className="star star-2">★</div>
        <div className="star star-3">★</div>
        <div className="star star-4">★</div>
        <div className="star star-5">★</div>
        <div className="star star-6">★</div>
      </div>

      {/* Banner verde lipit de header */}
      <div className="banner-section">
        <div className="icon-wrapper">📢</div>
        <h1 className="banner-title">DEPARTAMENT PR</h1>
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
                <td>COORDONARE CAMPANII SOCIAL MEDIA (150P)</td>
              </tr>
              <tr className="row-dark">
                <td>NUME 2</td>
                <td>85</td>
                <td>CREARE CONȚINUT MARKETING (100P)</td>
              </tr>
              <tr className="row-light">
                <td>NUME 3</td>
                <td>75</td>
                <td>ORGANIZARE EVENIMENT DE PROMOVARE (110P)</td>
              </tr>
              <tr className="row-dark">
                <td>...</td>
                <td>...</td>
                <td>COMUNICARE CU PARTENERI (80P)</td>
              </tr>
              <tr className="row-light">
                <td>...</td>
                <td>...</td>
                <td>DEZVOLTARE STRATEGIE BRANDING (120P)</td>
              </tr>
              <tr className="row-dark">
                <td>...</td>
                <td>...</td>
                <td>ADMINISTRARE PAGINI SOCIAL MEDIA (90P)</td>
              </tr>
              <tr className="row-light">
                <td>NUME N</td>
                <td>25</td>
                <td>PARTICIPARE LA WORKSHOP PR (50P)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bara verde înainte de footer */}
      <div className="footer-bar"></div>
    </div>
  );
}

export default PR;