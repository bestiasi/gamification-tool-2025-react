import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import Header from './Header';
import Footer from './Footer';
import AppRoutes from './AppRoutes'; // Importăm componenta de rute

// Notă: Asigură-te că fișierul logo_best.png există în folderul src/assets sau public/assets
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Header 
                  logo="/icons/logo best.png" // Verifică dacă această cale este corectă
        links={[
          { text: 'HR', url: '/hr' },
          { text: 'PR', url: '/pr' },
          { text: 'IT', url: '/it' },
          { text: 'FR', url: '/fr' },
          { text: 'GLOBAL', url: '/global' },
          { text: 'ACASA', url: '/', active: true }
        ]}
      />
      <AppRoutes />
      <Footer />
    </BrowserRouter>
  </StrictMode>
);