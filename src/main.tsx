import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Header from './header/Header'; // Importăm direct fișierul Header.tsx
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Header 
      title="Site-ul Meu" 
      logo="/assets/background.svg"
    />
    <App />
  </StrictMode>
);