import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Adăugăm importurile pentru React Router
import './Header.css';

interface HeaderProps {
  logo?: string;
  links?: { text: string; url: string; active?: boolean }[];
}

const Header: React.FC<HeaderProps> = ({ 
logo = "/icons/logo best.png",
  links = [
    { text: 'HR', url: '/hr' }, // Schimbăm URL-urile pentru a folosi React Router
    { text: 'PR', url: '/pr' },
    { text: 'IT', url: '/it' },
    { text: 'FR', url: '/fr' },
    { text: 'GLOBAL', url: '/global' },
    { text: 'ACASA', url: '/', active: true }
  ] 
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation(); // Hook pentru a obține locația curentă
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Funcție pentru a determina dacă un link este activ
  const isLinkActive = (url: string) => {
    if (url === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(url);
  };
  
  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo-container">
          {/* Pentru logo, păstrăm link-ul extern */}
          <a 
            href="https://bestis.ro/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="logo-link"
          >
            <img src={logo} alt="BEST IAȘI Logo" className="logo" />
          </a>
        </div>
        
        {/* Desktop navigation - folosim Link în loc de a */}
        <nav className="desktop-nav">
          <ul className="nav-links">
            {links.map((link, index) => (
              <li key={index}>
                <Link 
                  to={link.url} 
                  className={isLinkActive(link.url) ? 'active' : ''}
                >
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Mobile menu button */}
        <button 
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Meniu principal"
        >
          <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        
        {/* Mobile navigation - folosim Link în loc de a */}
        <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="mobile-nav-links">
            {links.map((link, index) => (
              <li key={index}>
                <Link 
                  to={link.url}
                  className={isLinkActive(link.url) ? 'active' : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;