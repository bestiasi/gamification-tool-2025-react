import '../App.css';
import './FR.css';

function FR() {
  return (
    <div className="fr-page">
      {/* Elemente decorative similare cu HR */}
      <div className="decorative-elements">
        <div className="star star-1">★</div>
        <div className="star star-2">★</div>
        <div className="star star-3">★</div>
        <div className="star star-4">★</div>
        <div className="star star-5">★</div>
        <div className="star star-6">★</div>
      </div>

      {/* Banner mov lipit de header */}
      <div className="banner-section">
        <div className="icon-wrapper">💰</div>
        <h1 className="banner-title">DEPARTAMENT FR</h1>
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
                <td>ATRAGERE SPONSORI PRINCIPALI (150P)</td>
              </tr>
              <tr className="row-dark">
                <td>NUME 2</td>
                <td>90</td>
                <td>DEZVOLTARE STRATEGIE FUNDRAISING (120P)</td>
              </tr>
              <tr className="row-light">
                <td>NUME 3</td>
                <td>75</td>
                <td>ORGANIZARE EVENIMENT DE STRÂNGERE FONDURI (100P)</td>
              </tr>
              <tr className="row-dark">
                <td>...</td>
                <td>...</td>
                <td>RELAȚII CU SPONSORI (80P)</td>
              </tr>
              <tr className="row-light">
                <td>...</td>
                <td>...</td>
                <td>GESTIONARE BUGET (110P)</td>
              </tr>
              <tr className="row-dark">
                <td>...</td>
                <td>...</td>
                <td>COORDONARE ECHIPĂ FUNDRAISING (130P)</td>
              </tr>
              <tr className="row-light">
                <td>NUME N</td>
                <td>30</td>
                <td>PARTICIPARE LA TRAINING FUNDRAISING (50P)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bara mov înainte de footer */}
      <div className="footer-bar"></div>
    </div>
  );
}

export default FR;