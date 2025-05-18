import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Header from './Header';
import Footer from './Footer';
import App from './App';

// Notă: Asigură-te că fișierul logo_best.png există în folderul src/assets sau public/assets

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Header 
      logo="/icons/logo best.png"
      links={[
        { text: 'HR', url: '#' },
        { text: 'PR', url: '#' },
        { text: 'IT', url: '#' },
        { text: 'FR', url: '#' },
        { text: 'GLOBAL', url: '#' },
        { text: 'ACASA', url: '#', active: true }
      ]}
    />
    <App />
    <Footer />
  </StrictMode>
);