import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';

const ADMIN_SESSION_KEY = 'paintora_admin';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are both required.');
      return;
    }

    try {
      setSubmitting(true);
      const profile = await adminLogin(email.trim(), password);
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(profile));
      sessionStorage.removeItem('paintora_customer');
      navigate(location.state?.from || '/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container admin-login-page">
      <div className="card admin-login-card">
        <span className="badge badge-category">Authorized personnel</span>
        <h1>Admin Login</h1>
        <p className="admin-login-intro">Sign in to manage Paintora services and customer bookings.</p>
        {error && <div className="alert alert-error" role="alert"><span>⚠️</span><div>{error}</div></div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Email Address</label>
            <input id="admin-email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input id="admin-password" className="form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

export { ADMIN_SESSION_KEY };