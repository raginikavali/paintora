import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CUSTOMER_SESSION_KEY } from '../pages/CustomerAuthPage';
import { customerLogout } from '../services/api';

export default function Navbar() {
  const [customer, setCustomer] = useState(() => JSON.parse(sessionStorage.getItem(CUSTOMER_SESSION_KEY) || 'null'));

  useEffect(() => {
    const refreshCustomer = () => setCustomer(JSON.parse(sessionStorage.getItem(CUSTOMER_SESSION_KEY) || 'null'));
    window.addEventListener('paintora-auth-change', refreshCustomer);
    return () => window.removeEventListener('paintora-auth-change', refreshCustomer);
  }, []);

  const handleLogout = async () => {
    try { await customerLogout(); } catch { /* The local session is still cleared below. */ }
    sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
    window.dispatchEvent(new Event('paintora-auth-change'));
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand-logo" aria-label="Paintora Home">
          <div className="brand-mark">P</div>
          <span>Paintora</span>
        </Link>

        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink to="/track-booking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Track Booking
              </NavLink>
            </li>
            <li>{customer ? <><NavLink to="/account" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>My Account</NavLink><button className="nav-logout" onClick={handleLogout}>Logout</button></> : <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Login / Sign Up</NavLink>}</li>
            <li><NavLink to="/admin" className="admin-banner-link">Admin Panel</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
