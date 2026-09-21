import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  const location = useLocation();

  // DO NOT render footer on the Auth landing page ('/')
  if (location.pathname === '/') {
    return null;
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div style={{ marginBottom: '1.25rem' }}>
              <Logo size="md" variant="light" />
            </div>
            <p style={{ color: '#B8B3AD', fontSize: '0.925rem', maxWidth: '340px', lineHeight: 1.6 }}>
              Professional home and commercial painting services made simple. Transparent starting prices, certified painters, and hassle-free online scheduling.
            </p>
          </div>

          <div className="footer-col">
            <h4>Painting Services</h4>
            <ul className="footer-links">
              <li><Link to="/services?category=Interior">Interior Painting</Link></li>
              <li><Link to="/services?category=Exterior">Exterior Painting</Link></li>
              <li><Link to="/services?category=Decorative">Texture Walls</Link></li>
              <li><Link to="/services?category=Full+Home">Full Home Painting</Link></li>
              <li><Link to="/services?category=Woodwork">Doors & Woodwork</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/home">Home</Link></li>
              <li><Link to="/services">Explore All Services</Link></li>
              <li><Link to="/track-booking">Track Booking Status</Link></li>
              <li><Link to="/account">My Account</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Support</h4>
            {/* Note: Contact details below are demo support channels for the assessment project */}
            <ul className="footer-links">
              <li>
                <span style={{ color: '#C85A32', fontWeight: 600 }}>Helpline:</span> +91 (800) 456-7890
              </li>
              <li>
                <span style={{ color: '#C85A32', fontWeight: 600 }}>Email:</span> support@paintora.com
              </li>
              <li>
                <span style={{ color: '#C85A32', fontWeight: 600 }}>Working Hours:</span> Mon – Sat, 8 AM – 8 PM
              </li>
              <li>
                <span style={{ color: '#C85A32', fontWeight: 600 }}>Service Coverage:</span> Metro Areas
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Paintora Home Painting Services. Professional full-stack service booking platform.</p>
        </div>
      </div>
    </footer>
  );
}
