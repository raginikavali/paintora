import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { customerLogin, customerSignup } from '../services/api';

export const CUSTOMER_SESSION_KEY = 'paintora_customer';

export default function CustomerAuthPage({ mode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = mode === 'signup';
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (isSignup && form.name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) nextErrors.email = 'Please enter a valid email address.';
    if (isSignup && !/^[+\d\s().-]+$/.test(form.phone.trim())) nextErrors.phone = 'Please enter a valid phone number.';
    if (isSignup && form.phone.replace(/\D/g, '').length < 10) nextErrors.phone = 'Phone number must contain at least 10 digits.';
    if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGeneralError('');
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      setSubmitting(true);
      const customer = isSignup ? await customerSignup(form) : await customerLogin(form.email.trim(), form.password);
      sessionStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customer));
      sessionStorage.removeItem('paintora_admin');
      window.dispatchEvent(new Event('paintora-auth-change'));
      navigate(location.state?.from || '/account', { replace: true });
    } catch (error) {
      setErrors(error.errors || {});
      setGeneralError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="card auth-card">
        <span className="badge badge-category">Paintora customer account</span>
        <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-intro">{isSignup ? 'Save your details and follow every painting appointment in one place.' : 'Sign in to book services and view your painting appointments.'}</p>
        {generalError && <div className="alert alert-error" role="alert"><span>⚠️</span><div>{generalError}</div></div>}
        <form onSubmit={handleSubmit} noValidate>
          {isSignup && <AuthField id="name" label="Full name" value={form.name} error={errors.name} onChange={handleChange} />}
          <AuthField id="email" label="Email address" type="email" value={form.email} error={errors.email} onChange={handleChange} />
          {isSignup && <AuthField id="phone" label="Phone number" type="tel" value={form.phone} error={errors.phone} onChange={handleChange} />}
          <AuthField id="password" label="Password" type="password" value={form.password} error={errors.password} onChange={handleChange} />
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Please wait...' : isSignup ? 'Create account' : 'Login'}
          </button>
        </form>
        <p className="auth-switch">
          {isSignup ? 'Already have an account?' : 'New to Paintora?'}{' '}
          <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Login' : 'Create an account'}</Link>
        </p>
      </div>
    </div>
  );
}

function AuthField({ id, label, type = 'text', value, error, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={`customer-${id}`}>{label}</label>
      <input id={`customer-${id}`} name={id} type={type} className="form-control" value={value} onChange={onChange} autoComplete={id === 'password' ? 'new-password' : id} required />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}