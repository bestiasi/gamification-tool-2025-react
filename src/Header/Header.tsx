import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

interface HeaderProps {
  logo?: string;
  links?: { text: string; url: string; active?: boolean }[];
}

const Header: React.FC<HeaderProps> = ({ 
logo = "/icons/logo best.png",
  links = [
    { text: 'HR', url: '/hr' },
    { text: 'PR', url: '/pr' },
    { text: 'IT', url: '/it' },
    { text: 'FR', url: '/fr' },
    { text: 'MY REQUESTS', url: '/my-requests' },
    { text: 'ADMIN', url: '/admin' }
  ] 
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
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
  
  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Filter links based on admin status
  const filteredLinks = links.filter(link => {
    if (link.url === '/admin') {
      return isAdmin;
    }
    return true;
  });
  
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
            {filteredLinks.map((link, index) => (
              <li key={index}>
                <Link 
                  to={link.url} 
                  className={isLinkActive(link.url) ? 'active' : ''}
                >
                  {link.text}
                </Link>
              </li>
            ))}
            {user && (
              <li>
                <button 
                  onClick={handleLogout}
                  className="logout-button"
                  title="Logout"
                >
                  LOGOUT
                </button>
              </li>
            )}
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
            {filteredLinks.map((link, index) => (
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
            {user && (
              <li>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="logout-button"
                >
                  LOGOUT
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;