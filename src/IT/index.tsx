import '../App.css';
import './IT.css';

function ITComponent() {
  return (
    <div className="it-page">
      {/* Elemente decorative similare cu HR */}
      <div className="decorative-elements">
        <div className="star star-1">★</div>
        <div className="star star-2">★</div>
        <div className="star star-3">★</div>
        <div className="star star-4">★</div>
        <div className="star star-5">★</div>
        <div className="star star-6">★</div>
      </div>

      {/* Banner albastru lipit de header */}
      <div className="banner-section">
        <div className="icon-wrapper">💻</div>
        <h1 className="banner-title">DEPARTAMENT IT</h1>
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
                <td>Coman Stefan</td>
                <td>1445</td>
                <td>
                  Ai o responsabilitate pe departament (150p)<br />
                  Creaza website-ul de eveniment tura 1 fb (200p)<br />
                  Creaza website-ul de eveniment tura 2 fb (50p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 1 fb (50p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 2 fb (25p)<br />
                  Realizeaza necesarul de logistica tura 1 fb (25p)<br />
                  Realizeaza necesarul de logistica tura 2 fb (25p)<br />
                  Creare noul design tricou/honoarar de departament (150p)<br />
                  Realizarea unui mentorat/WS pe IT (React/Wordpress) (250p)<br />
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Butacu Catalin</td>
                <td>1340</td>
                <td>
                  Ai o responsabilitate pe departament (150p)<br />
                  Creaza website-ul de eveniment tura 1 fb (200p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 1 fb (50p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 2 fb (25p)<br />
                  Realizeaza necesarul de logistica tura 1 fb (25p)<br />
                  Creare noul design tricou/honoarar de departament (150p)<br />
                  Realizarea unui mentorat/WS pe IT (React/Wordpress) (250p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Stoean Vlad</td>
                <td>820</td>
                <td>
                  Ai o responsabilitate pe departament (150p)<br />
                  Creaza website-ul de eveniment tura 1 fb (200p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 1 fb (50p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 2 fb (25p)<br />
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Spinu Ioana Teodora</td>
                <td>785</td>
                <td>
                  Ai o responsabilitate pe departament (150p)<br />
                  Creaza website-ul de eveniment tura 1 fb (200p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 1 fb (50p)<br />
                  Realizarea unui mentorat/WS pe IT (React/Wordpress) (250p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Rotaru Irina</td>
                <td>760</td>
                <td>
                  Ai o responsabilitate pe departament (150p)<br />
                  Creaza website-ul de eveniment tura 1 fb (200p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 1 fb (50p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 2 fb (25p)<br />
                  Realizeaza un tutorial (Google Analytics/URL Builder etc) (100p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Turceac Tiberiu</td>
                <td>585</td>
                <td>
                  Creaza website-ul de eveniment tura 1 fb (200p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 1 fb (50p)<br />
                  Realizeaza un tutorial (Google Analytics/URL Builder etc) (100p)<br />
                  Participare la o activitate pe departament (concursul de pasi) (10p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Cocovoicu Tudor</td>
                <td>625</td>
                <td>
                  Ai o responsabilitate pe departament (150p)<br />
                  Creaza website-ul de eveniment tura 1 fb (200p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 1 fb (50p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 2 fb (25p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Caba Andrei</td>
                <td>455</td>
                <td>
                  Creaza website-ul de eveniment tura 1 fb (200p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 1 fb (50p)<br />
                  Lipirea a 10 afise in camine, facultati, campus si/sau stalpi (25p)<br />
                  Realizarea unui tutorial (Google Analytics/URL Builder etc) (100p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Stefan-Vladut Radu</td>
                <td>330</td>
                <td>
                  Ai o responsabilitate pe departament (150p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 1 fb (50p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 2 fb (25p)<br />
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Manoliu Lukas</td>
                <td>315</td>
                <td>
                  Creaza website-ul de eveniment tura 1 fb (200p)<br />
                  Lipirea a 10 afise in camine, facultati, campus si/sau stalpi (25p)<br />
                  Se ocupa de depunerea unei cereri (10p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Pintilii Ana Rebeca</td>
                <td>355</td>
                <td>
                  Ai o responsabilitate pe departament (150p)<br />
                  Creaza website-ul de eveniment tura 1 fb (200p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Sergei Sinigribov</td>
                <td>910</td>
                <td>
                  Ai o responsabilitate pe departament (150p)<br />
                  Creaza website-ul de eveniment tura 1 fb (200p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 1 fb (50p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 2 fb (25p)<br />
                  Realizeaza un tutorial (Google Analytics/URL Builder etc) (100p)<br />
                  Creare noul design tricou/honoarar de departament (150p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Caprian Denisa</td>
                <td>170</td>
                <td>
                  Realizarea unui mentorat/WS pe IT (React/Wordpress) (150p)<br />
                  Participare la o activitate pe departament (concursul de pasi) (10p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Diaconu Daniel</td>
                <td>182</td>
                <td>
                  Creaza website-ul de eveniment tura 1 fb (100p)<br />
                  Realizeaza mockup la site (Figma/DesignXD) tura 1 fb (50p)<br />
                  Participare la o activitate pe departament (concursul de pasi) (10p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Ghiurca Andrei</td>
                <td>180</td>
                <td>
                  Realizarea unui tutorial (Google Analytics/URL Builder etc) (100p)<br />
                  Lipirea a 10 afise in camine, facultati, campus si/sau stalpi (25p)<br />
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Zarnica Alexandru</td>
                <td>177</td>
                <td>
                  Realizarea unui tutorial (Google Analytics/URL Builder etc) (100p)<br />
                  Lipirea a 10 afise in camine, facultati, campus si/sau stalpi (25p)<br />
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Miron Smaranda-Gabriela</td>
                <td>155</td>
                <td>
                  Realizarea unui tutorial (Google Analytics/URL Builder etc) (100p)<br />
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Andrei Andrusca</td>
                <td>145</td>
                <td>
                  Realizarea unui tutorial (Google Analytics/URL Builder etc) (100p)<br />
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Matei Stefan-Cristian</td>
                <td>135</td>
                <td>
                  Realizarea unui tutorial (Google Analytics/URL Builder etc) (100p)<br />
                  Participarea la un mentorat/WS/training pe IT (30p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Mihut Robert</td>
                <td>82</td>
                <td>
                  Lipirea a 10 afise in camine, facultati, campus si/sau stalpi (25p)<br />
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Plugaru Paraschiva (Coca)</td>
                <td>80</td>
                <td>
                  Lipirea a 10 afise in camine, facultati, campus si/sau stalpi (25p)<br />
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Bujoreanu Iulian</td>
                <td>70</td>
                <td>
                  Participare la o activitate pe departament (concursul de pasi) (10p)<br />
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Biciusca Rares</td>
                <td>65</td>
                <td>
                  Participare la o activitate pe departament (concursul de pasi) (10p)<br />
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Atomei Cristian</td>
                <td>50</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Miron Xenia</td>
                <td>50</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Vacarciuc Alexandru</td>
                <td>50</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (50p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Craciun Elisaveta</td>
                <td>45</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (45p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Mannescu Ioana</td>
                <td>45</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (45p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Cusmir Paul</td>
                <td>40</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (40p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Yasmeen</td>
                <td>40</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (40p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Cozaru Cezara</td>
                <td>35</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (35p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Achitei Alexandru</td>
                <td>30</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (30p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Adam Iasmina</td>
                <td>30</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (30p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Alupului Diana</td>
                <td>30</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (30p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Baetu Narcis</td>
                <td>30</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (30p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Ciobanu Ana-Maria</td>
                <td>30</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (30p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Rachieru Lavinia</td>
                <td>30</td>
                <td>
                  Participarea la un mentorat/WS/training pe IT (30p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Bacalie Roxana</td>
                <td>20</td>
                <td>
                  Participare la o activitate pe departament (concursul de pasi) (10p)<br />
                  Se ocupa de depunerea unei cereri (10p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Morosanu George (Horhe)</td>
                <td>20</td>
                <td>
                  Participare la o activitate pe departament (concursul de pasi) (10p)<br />
                  Se ocupa de depunerea unei cereri (10p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Nica Mirela</td>
                <td>20</td>
                <td>
                  Participare la o activitate pe departament (concursul de pasi) (10p)<br />
                  Se ocupa de depunerea unei cereri (10p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Petrisor Edi</td>
                <td>20</td>
                <td>
                  Participare la o activitate pe departament (concursul de pasi) (10p)<br />
                  Se ocupa de depunerea unei cereri (10p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Toscariu Alexandra</td>
                <td>20</td>
                <td>
                  Participare la o activitate pe departament (concursul de pasi) (10p)<br />
                  Se ocupa de depunerea unei cereri (10p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Hoha Elena Nona</td>
                <td>10</td>
                <td>
                  Participare la o activitate pe departament (concursul de pasi) (10p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Matei Iordache</td>
                <td>10</td>
                <td>
                  Participare la o activitate pe departament (concursul de pasi) (10p)
                </td>
              </tr>
              <tr className="row-light">
                <td>Rotari Cristina</td>
                <td>10</td>
                <td>
                  Participare la o activitate pe departament (concursul de pasi) (10p)
                </td>
              </tr>
              <tr className="row-dark">
                <td>Varga Matteo</td>
                <td>10</td>
                <td>
                  Participare la o activitate pe departament (concursul de pasi) (10p)
                </td>
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

export default ITComponent;