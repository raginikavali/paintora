import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { fetchBookingById } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBooking() {
      if (!booking && id) {
        try {
          setLoading(true);
          const data = await fetchBookingById(id);
          setBooking(data);
        } catch (err) {
          setError(err.message || 'Failed to retrieve booking confirmation.');
        } finally {
          setLoading(false);
        }
      }
    }
    loadBooking();
  }, [id, booking]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>Loading your booking confirmation...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem' }}>
        <div className="empty-state">
          <h3 className="font-serif">Booking Not Found</h3>
          <p>{error || 'Could not locate booking record.'}</p>
          <Link to="/home" className="btn btn-primary">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Celebration Banner */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: 'var(--status-completed-bg)',
            color: 'var(--status-completed)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            margin: '0 auto 1.25rem',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
          }}>
            ✓
          </div>
          <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Booking Confirmed!
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
            Your appointment has been registered in our database. We look forward to transforming your home.
          </p>
        </div>

        {/* Detailed Booking Summary Card */}
        <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem',
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                Booking Reference
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                #{booking.id}
              </div>
            </div>

            <StatusBadge status={booking.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Service
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                {booking.service?.name || 'Painting Service'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {booking.service?.category} · Starting at ₹{booking.service?.price}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Customer Name
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                {booking.customer_name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {booking.customer_phone}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Scheduled Date
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                {booking.booking_date}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Time Window
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                {booking.booking_time}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Service Location
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', marginTop: '0.3rem', lineHeight: 1.5 }}>
              {booking.address}
            </div>
          </div>

          <div style={{
            background: 'var(--color-surface-soft)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '2rem',
          }}>
            ℹ️ Keep your <strong>Booking ID #{booking.id}</strong> handy. You can check updates anytime on the Track Booking page.
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={`/track-booking?id=${booking.id}`} className="btn btn-primary" style={{ flex: 1 }}>
              Track Live Status
            </Link>
            <Link to="/home" className="btn btn-secondary" style={{ flex: 1 }}>
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
