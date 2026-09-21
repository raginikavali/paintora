import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchBookingById, fetchCustomerBookings } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const STATUS_STEPS = ['Pending', 'Confirmed', 'In Progress', 'Completed'];

export default function BookingStatusPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';

  const [bookingIdInput, setBookingIdInput] = useState(queryId);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Lookup single booking by ID
  const handleLookup = useCallback(async (idToSearch) => {
    const cleanId = String(idToSearch).replace(/\D/g, '');
    if (!cleanId) {
      setError('Please enter a valid numeric Booking ID.');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const data = await fetchBookingById(cleanId);
      setSelectedBooking(data);
    } catch (err) {
      setSelectedBooking(null);
      setError(err.message || `No booking found with ID #${cleanId}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load customer's default bookings on mount
  useEffect(() => {
    async function loadDefaultBookings() {
      try {
        const bookingsList = await fetchCustomerBookings();
        setMyBookings(bookingsList);
        // If no queryId and customer has bookings, default to their latest booking
        if (!queryId && bookingsList.length > 0) {
          setSelectedBooking(bookingsList[0]);
        }
      } catch {
        // Fallback silently if session isn't available
      }
    }

    if (!queryId) {
      loadDefaultBookings();
    }
  }, [queryId]);

  // If queryId is provided via URL parameter, look it up
  useEffect(() => {
    if (!queryId) return;
    const cleanId = String(queryId).replace(/\D/g, '');
    let ignore = false;
    async function fetchById() {
      if (!cleanId) {
        if (!ignore) setError('Please enter a valid numeric Booking ID.');
        return;
      }
      setLoading(true);
      setError('');
      setSearched(true);
      try {
        const data = await fetchBookingById(cleanId);
        if (!ignore) setSelectedBooking(data);
      } catch (err) {
        if (!ignore) {
          setSelectedBooking(null);
          setError(err.message || `No booking found with ID #${cleanId}`);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchById();
    return () => { ignore = true; };
  }, [queryId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (bookingIdInput.trim()) {
      setSearchParams({ id: bookingIdInput.trim() });
      handleLookup(bookingIdInput.trim());
    }
  };

  const getStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-category" style={{ marginBottom: '0.5rem' }}>
            Live Progress Tracking
          </span>
          <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 700, marginTop: '0.25rem', marginBottom: '0.5rem' }}>
            Track Your Painting Appointment
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
            Follow each stage of your service from pending confirmation to prep, painting, and final handover.
          </p>
        </div>

        {/* Quick Selection Pills if customer has bookings */}
        {myBookings.length > 0 && (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              Your Appointments ({myBookings.length})
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {myBookings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelectedBooking(b);
                    setBookingIdInput(String(b.id));
                    setSearchParams({ id: String(b.id) });
                    setError('');
                  }}
                  className={`btn btn-sm ${selectedBooking?.id === b.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem 0.9rem' }}
                >
                  <span>#{b.id}</span>
                  <span>·</span>
                  <span>{b.service?.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Manual Lookup Input Form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '0.75rem',
          background: '#FFFFFF',
          padding: '0.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '2.5rem',
        }}>
          <input
            type="text"
            className="form-control"
            style={{ border: 'none', boxShadow: 'none', padding: '0.85rem 1.25rem', fontSize: '1.05rem' }}
            placeholder="Lookup by Booking Reference ID (e.g. 1001, 1002)..."
            value={bookingIdInput}
            onChange={(e) => setBookingIdInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }} disabled={loading}>
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {loading && <div className="spinner" />}

        {error && (
          <div className="alert alert-error" role="alert">
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {!loading && searched && !selectedBooking && !error && (
          <div className="empty-state">
            <h3 className="font-serif">Booking Not Found</h3>
            <p>Please double-check the booking number from your confirmation email.</p>
          </div>
        )}

        {!loading && selectedBooking && (
          <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '1.25rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Booking Reference
                </span>
                <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  #{selectedBooking.id}
                </h2>
              </div>
              <StatusBadge status={selectedBooking.status} />
            </div>

            {/* Stepper Progress Visualizer */}
            {selectedBooking.status !== 'Cancelled' ? (
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '0.75rem' }}>
                  {STATUS_STEPS.map((step, idx) => {
                    const currentStepIdx = getStepIndex(selectedBooking.status);
                    const isCompletedOrCurrent = currentStepIdx >= idx;
                    return (
                      <div key={step} style={{ textAlign: 'center', flex: 1, zIndex: 2 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isCompletedOrCurrent ? 'var(--color-primary)' : '#E8E4DF',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          boxShadow: isCompletedOrCurrent ? '0 2px 8px rgba(200, 90, 50, 0.35)' : 'none',
                        }}>
                          {isCompletedOrCurrent ? '✓' : idx + 1}
                        </div>
                        <span style={{
                          fontSize: '0.825rem',
                          fontWeight: isCompletedOrCurrent ? 700 : 500,
                          color: isCompletedOrCurrent ? 'var(--color-text)' : 'var(--color-text-muted)',
                        }}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
                <span>✕</span>
                <div>This booking was marked as <strong>Cancelled</strong>. Please contact our helpline if this was an error.</div>
              </div>
            )}

            {/* Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Painting Service
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  {selectedBooking.service?.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Category: {selectedBooking.service?.category}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Customer
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  {selectedBooking.customer_name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {selectedBooking.customer_phone} · {selectedBooking.customer_email}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Scheduled Date & Time
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  {selectedBooking.booking_date}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {selectedBooking.booking_time}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Service Location
              </div>
              <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                {selectedBooking.address}
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <Link to="/services" className="btn btn-secondary btn-sm">
                Explore More Services
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
