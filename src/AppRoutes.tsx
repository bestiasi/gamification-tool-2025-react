import { Routes, Route } from 'react-router-dom';
import App from './App';

// Importuri corecte care specifică calea către fișierele index.tsx din fiecare folder
import HR from './HR/index';
import IT from './IT/index';
import PR from './PR/index';
import FR from './FR/index';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/hr" element={<HR />} />
      <Route path="/it" element={<IT />} />
      <Route path="/pr" element={<PR />} />
      <Route path="/fr" element={<FR />} />
      {/* Adaugă mai multe rute aici pe măsură ce creezi mai multe pagini */}
      {/* <Route path="/global" element={<Global />} /> */}
    </Routes>
  );
}

export default AppRoutes;