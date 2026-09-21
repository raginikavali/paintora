import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import { customerLogin, customerSignup, adminLogin } from '../services/api';

export const CUSTOMER_SESSION_KEY = 'paintora_customer';
export const ADMIN_SESSION_KEY = 'paintora_admin';

export default function AuthLandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Role toggle: 'customer' | 'admin'
  const [role, setRole] = useState('customer');

  // Customer subtab: 'login' | 'signup'
  const [customerMode, setCustomerMode] = useState('login');

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  // Admin form state
  const [adminForm, setAdminForm] = useState({
    email: '',
    password: '',
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);

  // Redirect if session already exists
  useEffect(() => {
    const customer = sessionStorage.getItem(CUSTOMER_SESSION_KEY);
    if (customer) {
      navigate('/home', { replace: true });
      return;
    }
    const admin = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (admin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  // Handle input changes
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Password strength calculator
  const calculateStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#DC2626' };
    if (score === 2 || score === 3) return { score: 2, label: 'Good', color: '#D97706' };
    return { score: 3, label: 'Strong', color: '#16A34A' };
  };

  const strength = calculateStrength(customerForm.password);

  const triggerShake = () => {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const nextErrors = {};

    if (role === 'customer') {
      const isSignup = customerMode === 'signup';
      if (isSignup && customerForm.name.trim().length < 2) {
        nextErrors.name = 'Full name must be at least 2 characters.';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customerForm.email.trim())) {
        nextErrors.email = 'Please enter a valid email address.';
      }
      if (isSignup && customerForm.phone.replace(/\D/g, '').length < 10) {
        nextErrors.phone = 'Phone number must contain at least 10 digits.';
      }
      if (customerForm.password.length < 8) {
        nextErrors.password = 'Password must be at least 8 characters.';
      }

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        triggerShake();
        return;
      }

      try {
        setSubmitting(true);
        const result = isSignup
          ? await customerSignup(customerForm)
          : await customerLogin(customerForm.email.trim(), customerForm.password);

        sessionStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(result));
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        window.dispatchEvent(new Event('paintora-auth-change'));
        
        setIsSuccess(true);
        setTimeout(() => {
          navigate(location.state?.from || '/home', { replace: true });
        }, 800);
      } catch (err) {
        setErrors(err.errors || {});
        setGeneralError(err.message || 'Authentication failed. Please check your credentials.');
        triggerShake();
      } finally {
        setSubmitting(false);
      }
    } else {
      // Admin Login
      if (!adminForm.email.trim()) nextErrors.email = 'Admin email is required.';
      if (!adminForm.password) nextErrors.password = 'Admin password is required.';

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        triggerShake();
        return;
      }

      try {
        setSubmitting(true);
        const result = await adminLogin(adminForm.email.trim(), adminForm.password);
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(result));
        sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
        window.dispatchEvent(new Event('paintora-auth-change'));
        
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/admin/dashboard', { replace: true });
        }, 800);
      } catch (err) {
        setGeneralError(err.message || 'Invalid admin credentials.');
        triggerShake();
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* LEFT PANE (Desktop Photo & Value Cards) */}
      <div className="auth-left-pane">
        <img
          src="/images/auth-painting.jpg"
          alt="Painter rolling fresh paint onto a wall"
          className="auth-left-bg-img"
          width="1600"
          height="1118"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className="auth-left-overlay" />

        <div className="auth-left-content">
          <div>
            <Logo size="lg" variant="light" />
            <p style={{ marginTop: '0.85rem', fontSize: '1.2rem', color: '#FCEEE8', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              Professional painting, made simple.
            </p>
          </div>

          <div className="auth-floating-cards">
            <div className="glass-card float-1">
              <span style={{ fontSize: '1.75rem' }}>⏱️</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Book in 60 Seconds</strong>
                <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Select service & schedule online</span>
              </div>
            </div>

            <div className="glass-card float-2">
              <span style={{ fontSize: '1.75rem' }}>📍</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Track Every Step</strong>
                <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Real-time updates from prep to finish</span>
              </div>
            </div>

            <div className="glass-card float-3">
              <span style={{ fontSize: '1.75rem' }}>🛡️</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Verified Painters</strong>
                <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Background-checked & trained experts</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', opacity: 0.75, color: '#FAF8F5' }}>
            © {new Date().getFullYear()} Paintora Home Services. All rights reserved.
          </div>
        </div>
      </div>

      {/* RIGHT PANE (Auth Form Card) */}
      <div className="auth-right-pane">
        <div className="auth-bg-blob" />

        <div className={`auth-card-container ${shakeCard ? 'shake' : ''}`}>
          <div className="card" style={{ padding: '2.5rem 2.25rem', boxShadow: 'var(--shadow-lg)' }}>
            
            {/* Sliding Role Pill [Customer | Admin] */}
            <div className="role-toggle-pill" role="tablist" aria-label="Select User Role">
              <div className={`role-toggle-slider ${role === 'admin' ? 'admin' : ''}`} />
              <button
                type="button"
                className={`role-toggle-btn ${role === 'customer' ? 'active' : ''}`}
                onClick={() => { setRole('customer'); setErrors({}); setGeneralError(''); }}
                role="tab"
                aria-selected={role === 'customer'}
              >
                Customer
              </button>
              <button
                type="button"
                className={`role-toggle-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => { setRole('admin'); setErrors({}); setGeneralError(''); }}
                role="tab"
                aria-selected={role === 'admin'}
              >
                Admin
              </button>
            </div>

            {/* Success State Visualizer */}
            {isSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div className="success-checkmark">✓</div>
                <h3 className="font-serif" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                  {role === 'admin' ? 'Welcome, Administrator' : customerMode === 'signup' ? 'Account Created!' : 'Welcome Back!'}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                  {role === 'admin' ? 'Redirecting to management dashboard...' : 'Redirecting to Paintora home...'}
                </p>
              </div>
            ) : (
              <>
                {/* Header Titles */}
                {role === 'customer' ? (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div className="auth-subtabs">
                      <button
                        type="button"
                        className={`auth-subtab-btn ${customerMode === 'login' ? 'active' : ''}`}
                        onClick={() => { setCustomerMode('login'); setErrors({}); setGeneralError(''); }}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        className={`auth-subtab-btn ${customerMode === 'signup' ? 'active' : ''}`}
                        onClick={() => { setCustomerMode('signup'); setErrors({}); setGeneralError(''); }}
                      >
                        Create Account
                      </button>
                    </div>

                    <h2 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      {customerMode === 'signup' ? 'Start Your Home Transformation' : 'Welcome to Paintora'}
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      {customerMode === 'signup'
                        ? 'Create an account to book painting appointments and track status.'
                        : 'Sign in to access your painting appointments and services.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ marginBottom: '1.75rem' }}>
                    <span className="badge badge-category" style={{ marginBottom: '0.5rem' }}>Internal Console</span>
                    <h2 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      Admin Sign In
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      Sign in with administrator credentials to manage services and bookings.
                    </p>
                  </div>
                )}

                {/* Error Banner */}
                {generalError && (
                  <div className="alert alert-error" role="alert" aria-live="assertive">
                    <span>⚠️</span>
                    <div>{generalError}</div>
                  </div>
                )}

                {/* Main Form */}
                <form onSubmit={handleSubmit} noValidate>
                  {role === 'customer' ? (
                    <>
                      {customerMode === 'signup' && (
                        <div className="form-group">
                          <label className="form-label" htmlFor="customer-name">Full Name *</label>
                          <input
                            id="customer-name"
                            name="name"
                            type="text"
                            className="form-control"
                            placeholder="e.g. Ragini Sharma"
                            value={customerForm.name}
                            onChange={handleCustomerChange}
                            required
                          />
                          {errors.name && <span className="form-error">{errors.name}</span>}
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label" htmlFor="customer-email">Email Address *</label>
                        <input
                          id="customer-email"
                          name="email"
                          type="email"
                          className="form-control"
                          placeholder="e.g. ragini@example.com"
                          value={customerForm.email}
                          onChange={handleCustomerChange}
                          autoComplete="email"
                          required
                        />
                        {errors.email && <span className="form-error">{errors.email}</span>}
                      </div>

                      {customerMode === 'signup' && (
                        <div className="form-group">
                          <label className="form-label" htmlFor="customer-phone">Phone Number *</label>
                          <input
                            id="customer-phone"
                            name="phone"
                            type="tel"
                            className="form-control"
                            placeholder="e.g. 9876543210"
                            value={customerForm.phone}
                            onChange={handleCustomerChange}
                            autoComplete="tel"
                            required
                          />
                          {errors.phone && <span className="form-error">{errors.phone}</span>}
                        </div>
                      )}

                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label className="form-label" htmlFor="customer-password">Password *</label>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '0.4rem' }}
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <input
                          id="customer-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          className="form-control"
                          placeholder="At least 8 characters"
                          value={customerForm.password}
                          onChange={handleCustomerChange}
                          autoComplete={customerMode === 'signup' ? 'new-password' : 'current-password'}
                          required
                        />
                        {errors.password && <span className="form-error">{errors.password}</span>}

                        {/* Password Strength Meter on Signup */}
                        {customerMode === 'signup' && customerForm.password && (
                          <div className="strength-meter">
                            <div className="strength-bar" style={{ backgroundColor: strength.score >= 1 ? strength.color : undefined }} />
                            <div className="strength-bar" style={{ backgroundColor: strength.score >= 2 ? strength.color : undefined }} />
                            <div className="strength-bar" style={{ backgroundColor: strength.score >= 3 ? strength.color : undefined }} />
                            <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    // Admin Form
                    <>
                      <div className="form-group">
                        <label className="form-label" htmlFor="admin-email">Admin Email *</label>
                        <input
                          id="admin-email"
                          name="email"
                          type="email"
                          className="form-control"
                          placeholder="admin@paintora.com"
                          value={adminForm.email}
                          onChange={handleAdminChange}
                          autoComplete="username"
                          required
                        />
                        {errors.email && <span className="form-error">{errors.email}</span>}
                      </div>

                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label className="form-label" htmlFor="admin-password">Password *</label>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '0.4rem' }}
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <input
                          id="admin-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          className="form-control"
                          placeholder="Admin password"
                          value={adminForm.password}
                          onChange={handleAdminChange}
                          autoComplete="current-password"
                          required
                        />
                        {errors.password && <span className="form-error">{errors.password}</span>}
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: '0.75rem' }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner spinner-inline" />
                        <span>Verifying...</span>
                      </>
                    ) : role === 'admin' ? (
                      'Sign In to Dashboard'
                    ) : customerMode === 'signup' ? (
                      'Create Customer Account'
                    ) : (
                      'Sign In to Paintora'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
