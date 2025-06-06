import React from 'react';
import './Footer.css';
// Modificăm importul pentru logo - folosim calea relativă corectă sau URL direct

interface FooterProps {
  copyright?: string;
  links?: { text: string; url: string }[];
  year?: number;
}

const Footer: React.FC<FooterProps> = ({
  copyright = 'COPYRIGHT © 2025 BEST IASI. ALL RIGHTS RESERVED.',
  links = [
    { 
      text: 'GDPR', 
      url: 'https://docs.google.com/document/d/1UUIE_xTX4uwiUZ25O6p1tQD59dmHHb0Y3DKPbrUdNcA/edit?tab=t.0' 
    }
  ],
  year = 2025
}) => {
  
  // Creează textul cu spațiu explicit
  const yearText = `© BEST IASI ${year} - `;
  
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo și copyright */}
        <div className="footer-branding">
          <div className="footer-logo">
            {/* Logo cu link către site-ul BEST IAȘI - ca la Header */}
            <a 
              href="https://bestis.ro/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-logo-link"
            >
              <img src="/icons/logo best.png" alt="BEST IAȘI Logo" />
            </a>
          </div>
          <p className="footer-copyright-year">
            {yearText}
            {links.map((link, index) => (
              <a 
                key={index} 
                href={link.url} 
                className="footer-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.text}
              </a>
            ))}
          </p>
        </div>
        
        {/* Linia de separare */}
        <div className="footer-divider"></div>
        
        {/* Copyright */}
        <div className="footer-copyright">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;