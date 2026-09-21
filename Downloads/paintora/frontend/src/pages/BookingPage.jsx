import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { fetchServices, createBooking } from '../services/api';
import { CUSTOMER_SESSION_KEY } from './CustomerAuthPage';

const TIME_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM'
];

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId') || '';
  const navigate = useNavigate();
  const customer = JSON.parse(sessionStorage.getItem(CUSTOMER_SESSION_KEY) || 'null');

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    service_id: preselectedServiceId,
    customer_name: customer?.name || '',
    customer_email: customer?.email || '',
    customer_phone: customer?.phone || '',
    address: '',
    booking_date: '',
    booking_time: TIME_SLOTS[0]
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Calculate today's date in YYYY-MM-DD for min attribute
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function loadServiceOptions() {
      try {
        setServicesLoading(true);
        const data = await fetchServices();
        setServices(data);

        // If preselectedServiceId exists in query, ensure it is selected
        if (preselectedServiceId) {
          setFormData(prev => ({ ...prev, service_id: preselectedServiceId }));
        } else if (data.length > 0) {
          setFormData(prev => ({ ...prev, service_id: data[0].id }));
        }
      } catch {
        setGeneralError('Failed to load painting services. Please make sure the backend is reachable.');
      } finally {
        setServicesLoading(false);
      }
    }

    loadServiceOptions();
  }, [preselectedServiceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on edit
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.service_id) errors.service_id = 'Please select a painting service.';
    if (!formData.customer_name.trim()) errors.customer_name = 'Full name is required.';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!formData.customer_email.trim()) {
      errors.customer_email = 'Email address is required.';
    } else if (!emailRegex.test(formData.customer_email.trim())) {
      errors.customer_email = 'Please enter a valid email address.';
    }

    const phoneValue = formData.customer_phone.trim();
    const phoneDigits = phoneValue.replace(/\D/g, '');
    if (!formData.customer_phone.trim()) {
      errors.customer_phone = 'Contact phone number is required.';
    } else if (!/^[+\d\s().-]+$/.test(phoneValue) || phoneDigits.length < 10 || phoneDigits.length > 15) {
      errors.customer_phone = 'Please enter a valid phone number with 10 to 15 digits.';
    }

    if (!formData.address.trim()) {
      errors.address = 'Service delivery address is required.';
    } else if (formData.address.trim().length < 8) {
      errors.address = 'Please provide a detailed address including apartment/street.';
    }

    if (!formData.booking_date) {
      errors.booking_date = 'Preferred booking date is required.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.booking_date) || formData.booking_date < todayStr) {
      errors.booking_date = 'Booking date cannot be in the past.';
    }

    if (!formData.booking_time) {
      errors.booking_time = 'Preferred time slot is required.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    // Client-side quick validation check
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        service_id: parseInt(formData.service_id, 10),
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: formData.customer_phone.trim(),
        address: formData.address.trim(),
        booking_date: formData.booking_date,
        booking_time: formData.booking_time
      };

      // Real POST API call to PHP backend
      const createdBooking = await createBooking(payload);

      // Navigate to confirmation page passing created booking data
      navigate(`/booking-confirmation/${createdBooking.id}`, {
        state: { booking: createdBooking }
      });
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      }
      setGeneralError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedServiceObj = services.find(s => String(s.id) === String(formData.service_id));

  if (!customer) {
    return (
      <div className="container auth-page">
        <div className="card auth-card booking-login-card">
          <span className="badge badge-category">Booking requires an account</span>
          <h1>Please login to continue with your booking.</h1>
          <p className="auth-intro">Create an account to save your details and track this appointment from your dashboard.</p>
          <div className="auth-actions"><Link className="btn btn-primary" to="/login" state={{ from: `/book${window.location.search}` }}>Login</Link><Link className="btn btn-secondary" to="/signup" state={{ from: `/book${window.location.search}` }}>Create Account</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
            Instant Scheduling
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.5rem' }}>
            Book Your Painting Service
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
            Choose your service and scheduled time slot. Our team will arrive equipped for site prep and consultation.
          </p>
        </div>

        {generalError && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <div>{generalError}</div>
          </div>
        )}

        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSubmit} noValidate>
            {/* Service Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="service_id">
                Select Painting Service *
              </label>
              {servicesLoading ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading services from catalog...</div>
              ) : (
                <select
                  id="service_id"
                  name="service_id"
                  className="form-control"
                  value={formData.service_id}
                  onChange={handleChange}
                >
                  <option value="">-- Choose a Service --</option>
                  {services.map(svc => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} ({svc.category}) — Starting at ₹{svc.price}
                    </option>
                  ))}
                </select>
              )}
              {fieldErrors.service_id && <span className="form-error">{fieldErrors.service_id}</span>}

              {selectedServiceObj && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  padding: '0.75rem 1rem', 
                  background: 'var(--color-surface-soft)', 
                  borderRadius: 'var(--radius-sm)', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.875rem' 
                }}>
                  <span>⏱ Duration: <strong>{selectedServiceObj.duration}</strong></span>
                  <span>Estimated base price: <strong style={{ color: 'var(--color-primary)' }}>₹{selectedServiceObj.price}</strong></span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {/* Customer Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="customer_name">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  className="form-control"
                  placeholder="e.g. Ragini Sharma"
                  value={formData.customer_name}
                  onChange={handleChange}
                  readOnly
                />
                {fieldErrors.customer_name && <span className="form-error">{fieldErrors.customer_name}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="customer_email">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="customer_email"
                  name="customer_email"
                  className="form-control"
                  placeholder="e.g. ragini@example.com"
                  value={formData.customer_email}
                  onChange={handleChange}
                  readOnly
                />
                {fieldErrors.customer_email && <span className="form-error">{fieldErrors.customer_email}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {/* Phone */}
              <div className="form-group">
                <label className="form-label" htmlFor="customer_phone">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  className="form-control"
                  placeholder="e.g. 9876543210"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  readOnly
                />
                {fieldErrors.customer_phone && <span className="form-error">{fieldErrors.customer_phone}</span>}
              </div>

              {/* Booking Date */}
              <div className="form-group">
                <label className="form-label" htmlFor="booking_date">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  id="booking_date"
                  name="booking_date"
                  className="form-control"
                  min={todayStr}
                  value={formData.booking_date}
                  onChange={handleChange}
                />
                {fieldErrors.booking_date && <span className="form-error">{fieldErrors.booking_date}</span>}
              </div>
            </div>

            {/* Time Slot */}
            <div className="form-group">
              <label className="form-label" htmlFor="booking_time">
                Preferred Arrival Window *
              </label>
              <select
                id="booking_time"
                name="booking_time"
                className="form-control"
                value={formData.booking_time}
                onChange={handleChange}
              >
                {TIME_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              {fieldErrors.booking_time && <span className="form-error">{fieldErrors.booking_time}</span>}
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="address">
                Full Service Address (House No, Building, Street, Area) *
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                className="form-control"
                placeholder="e.g. Flat 402, Green Meadows Apartment, MG Road, Bengaluru"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
              {fieldErrors.address && <span className="form-error">{fieldErrors.address}</span>}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={submitting || servicesLoading}
              >
                {submitting ? 'Booking your service in MySQL...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
