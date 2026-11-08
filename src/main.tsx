import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './AppRoutes';

// After a deploy, an open tab may ask for code files that no longer exist; reload once to get the new version.
window.addEventListener('vite:preloadError', () => {
  // At most one automatic reload per 10 s, so a broken deploy cannot loop.
  const last = Number(sessionStorage.getItem('preloadReloadAt') ?? 0);
  if (Date.now() - last < 10_000) return;
  sessionStorage.setItem('preloadReloadAt', String(Date.now()));
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);