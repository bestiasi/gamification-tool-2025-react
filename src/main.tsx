import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Header from './Header'; // Importăm Header direct din folder datorită fișierului index.ts
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Header 
      logo="/assets/background.svg"
      title="BEST IAȘI"
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
  </StrictMode>
);