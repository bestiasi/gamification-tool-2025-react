import React, { useState, useEffect } from 'react';
import './Header.css';

interface HeaderProps {
  logo?: string;
  title?: string;
  links?: { text: string; url: string; active?: boolean }[];
}

const Header: React.FC<HeaderProps> = ({ 
  logo = '/logo.svg', 
  title = 'BEST IAȘI', 
  links = [
    { text: 'HR', url: '#' },
    { text: 'PR', url: '#' },
    { text: 'IT', url: '#' },
    { text: 'FR', url: '#' },
    { text: 'GLOBAL', url: '#' },
    { text: 'ACASA', url: '#', active: true }
  ] 
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo-container">
          {logo && <img src={logo} alt="Logo" className="logo" />}
          {title && <h1 className="site-title">{title}</h1>}
        </div>

        {/* Desktop navigation */}
        <nav className="desktop-nav">
          <ul className="nav-links">
            {links.map((link, index) => (
              <li key={index}>
                <a href={link.url} className={link.active ? 'active' : ''}>
                  {link.text}
                </a>
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

        {/* Mobile navigation */}
        <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="mobile-nav-links">
            {links.map((link, index) => (
              <li key={index}>
                <a 
                  href={link.url}
                  className={link.active ? 'active' : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;