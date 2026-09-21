import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerLogout, fetchCustomerBookings, fetchCustomerProfile } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { CUSTOMER_SESSION_KEY } from './CustomerAuthPage';

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchCustomerProfile(), fetchCustomerBookings()])
      .then(([customer, customerBookings]) => {
        setProfile(customer);
        setBookings(customerBookings);
        sessionStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customer));
      })
      .catch((requestError) => setError(requestError.message || 'Unable to load your account.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try { await customerLogout(); } catch { /* Clear local state even if the session already expired. */ }
    sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
    window.dispatchEvent(new Event('paintora-auth-change'));
    navigate('/login', { replace: true });
  };

  if (loading) return <div className="container account-page"><div className="spinner" /></div>;
  if (error) return <div className="container account-page"><div className="alert alert-error">{error}</div></div>;

  const upcoming = bookings.filter((booking) => !['Completed', 'Cancelled'].includes(booking.status));
  const previous = bookings.filter((booking) => ['Completed', 'Cancelled'].includes(booking.status));

  return (
    <div className="container account-page">
      <div className="account-header">
        <div><span className="badge badge-category">My account</span><h1>Welcome, {profile?.name}</h1><p>Keep your home painting appointments close at hand.</p></div>
        <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
      </div>
      <div className="account-grid">
        <section className="card account-profile"><h2>Profile</h2><p><strong>Name</strong>{profile?.name}</p><p><strong>Email</strong>{profile?.email}</p><p><strong>Phone</strong>{profile?.phone}</p></section>
        <section className="card account-bookings"><div className="section-heading"><h2>Upcoming bookings</h2><Link className="btn btn-primary btn-sm" to="/services">Book a service</Link></div><BookingList bookings={upcoming} empty="No upcoming appointments yet." /></section>
      </div>
      <section className="card account-history"><h2>Previous bookings</h2><BookingList bookings={previous} empty="Your completed and cancelled bookings will appear here." /></section>
    </div>
  );
}

function BookingList({ bookings, empty }) {
  if (!bookings.length) return <p className="account-empty">{empty}</p>;
  return <div className="account-booking-list">{bookings.map((booking) => <div className="account-booking" key={booking.id}><div><strong>{booking.service?.name}</strong><span>#{booking.id} · {booking.booking_date} · {booking.booking_time}</span></div><StatusBadge status={booking.status} /><Link to={`/track-booking?id=${booking.id}`} className="btn btn-secondary btn-sm">Track</Link></div>)}</div>;
}