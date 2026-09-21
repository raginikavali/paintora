import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchAdminStats, 
  fetchServices, 
  createService, 
  updateService, 
  deleteService, 
  fetchBookings, 
  updateBookingStatus, 
  deleteBooking,
  adminLogout
} from '../services/api';
import { getServiceImage } from '../utils/serviceImages';
import { ADMIN_SESSION_KEY } from './AdminLoginPage';

const CATEGORIES = ['Interior', 'Exterior', 'Decorative', 'Full Home', 'Woodwork'];
const STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'services' | 'bookings'
  
  // Dashboard Metrics
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Services State
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    category: 'Interior',
    price: '',
    duration: '1 Day',
    description: '',
    image: '/images/interior.jpg'
  });

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingFilterStatus, setBookingFilterStatus] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');

  // Alerts
  const [globalMessage, setGlobalMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'services') {
      loadServices();
    } else if (activeTab === 'bookings') {
      loadBookings();
    }
  }, [activeTab, bookingFilterStatus]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      setGlobalMessage({ type: 'error', text: err.message || 'Failed to fetch admin stats.' });
    } finally {
      setStatsLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      setServicesLoading(true);
      const data = await fetchServices();
      setServices(data);
    } catch (err) {
      setGlobalMessage({ type: 'error', text: err.message || 'Failed to fetch services.' });
    } finally {
      setServicesLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setBookingsLoading(true);
      const data = await fetchBookings(bookingFilterStatus, bookingSearch);
      setBookings(data);
    } catch (err) {
      setGlobalMessage({ type: 'error', text: err.message || 'Failed to fetch bookings.' });
    } finally {
      setBookingsLoading(false);
    }
  };

  // Service Modal Helpers
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceFormData({
      name: '',
      category: 'Interior',
      price: '',
      duration: '1 Day',
      description: '',
      image: '/images/interior.jpg'
    });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (svc) => {
    setEditingService(svc);
    setServiceFormData({
      name: svc.name,
      category: svc.category,
      price: svc.price,
      duration: svc.duration,
      description: svc.description,
      image: getServiceImage(svc)
    });
    setServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setGlobalMessage({ type: '', text: '' });
    try {
      const payload = {
        name: serviceFormData.name.trim(),
        category: serviceFormData.category,
        price: parseFloat(serviceFormData.price),
        duration: serviceFormData.duration.trim(),
        description: serviceFormData.description.trim(),
        image: serviceFormData.image.trim() || '/images/interior.jpg'
      };

      if (editingService) {
        await updateService(editingService.id, payload);
        setGlobalMessage({ type: 'success', text: `Service "${payload.name}" updated successfully.` });
      } else {
        await createService(payload);
        setGlobalMessage({ type: 'success', text: `Service "${payload.name}" created in database.` });
      }

      setServiceModalOpen(false);
      loadServices();
      loadStats();
    } catch (err) {
      setGlobalMessage({ type: 'error', text: err.message || 'Failed to save service.' });
    }
  };

  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteService(id);
      setGlobalMessage({ type: 'success', text: `Service #${id} was deleted.` });
      loadServices();
      loadStats();
    } catch (err) {
      setGlobalMessage({ type: 'error', text: err.message || 'Could not delete service.' });
    }
  };

  // Booking Actions
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      setGlobalMessage({ type: 'success', text: `Booking #${bookingId} status updated to ${newStatus}.` });
      loadBookings();
      loadStats();
    } catch (err) {
      setGlobalMessage({ type: 'error', text: err.message || 'Failed to update booking status.' });
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to delete Booking #${bookingId}?`)) return;

    try {
      await deleteBooking(bookingId);
      setGlobalMessage({ type: 'success', text: `Booking #${bookingId} deleted.` });
      loadBookings();
      loadStats();
    } catch (err) {
      setGlobalMessage({ type: 'error', text: err.message || 'Failed to delete booking.' });
    }
  };

  const handleLogout = async () => {
    try { await adminLogout(); } catch { /* Clear the local guard even if the server session expired. */ }
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    navigate('/admin/login', { replace: true });
  };

  return (
    <div>
      {/* Internal Management Notice Banner */}
      <div style={{ background: '#22201D', color: '#E8E4DF', padding: '0.65rem 0', fontSize: '0.85rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🔒 <strong>Paintora Internal Management Console</strong> (Authorized Personnel)</span>
          <button className="admin-logout-button" onClick={handleLogout}>Sign out</button>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem 6rem' }}>
        {/* Header & Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>Manage live painting services catalog and customer appointments.</p>
          </div>

          {/* Navigation Pill Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: '#FFFFFF', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <button 
              onClick={() => setActiveTab('overview')}
              className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
            >
              📊 Overview
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`btn btn-sm ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
            >
              🎨 Services
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`btn btn-sm ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
            >
              📅 Bookings
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {globalMessage.text && (
          <div className={`alert ${globalMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            <span>{globalMessage.type === 'success' ? '✓' : '⚠️'}</span>
            <div>{globalMessage.text}</div>
            <button 
              onClick={() => setGlobalMessage({ type: '', text: '' })} 
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* =====================================================================
           TAB 1: OVERVIEW & REAL SQL METRICS
           ===================================================================== */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="card">
                <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Services
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                  {statsLoading ? '...' : stats?.total_services ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                  Active catalog offerings
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Bookings
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.25rem' }}>
                  {statsLoading ? '...' : stats?.total_bookings ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                  Customer appointments
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Pending Bookings
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--status-pending)', marginTop: '0.25rem' }}>
                  {statsLoading ? '...' : stats?.pending_bookings ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                  Awaiting confirmation
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Completed Bookings
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--status-completed)', marginTop: '0.25rem' }}>
                  {statsLoading ? '...' : stats?.completed_bookings ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                  Finished & inspected
                </div>
              </div>
            </div>

            {/* Quick Actions & Revenue */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Revenue Overview</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Calculated from all active (Confirmed, In Progress, Completed) bookings joined with service catalog starting rates.
                </p>
                <div style={{ 
                  background: 'var(--color-surface-soft)', 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius-md)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Estimated Pipeline
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      ₹{statsLoading ? '...' : Number(stats?.estimated_revenue || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={loadStats}>
                    ↻ Refresh
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Operations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn btn-primary" onClick={() => { setActiveTab('services'); handleOpenAddService(); }}>
                    + Add New Painting Service
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setActiveTab('bookings'); setBookingFilterStatus('Pending'); }}>
                    View Pending Bookings ({stats?.pending_bookings ?? 0})
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setActiveTab('bookings'); setBookingFilterStatus('All'); }}>
                    Review All Appointments ({stats?.total_bookings ?? 0})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
           TAB 2: SERVICES MANAGEMENT
           ===================================================================== */}
        {activeTab === 'services' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Painting Services Catalog</h2>
              <button className="btn btn-primary btn-sm" onClick={handleOpenAddService}>
                + Add Service
              </button>
            </div>

            {servicesLoading && <div className="spinner"></div>}

            {!servicesLoading && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Service Name</th>
                      <th>Category</th>
                      <th>Starting Price</th>
                      <th>Duration</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(svc => (
                      <tr key={svc.id}>
                        <td style={{ fontWeight: 'bold' }}>#{svc.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{svc.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', maxWidth: '380px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {svc.description}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-category">{svc.category}</span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          ₹{svc.price}
                        </td>
                        <td>{svc.duration}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditService(svc)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteService(svc.id, svc.name)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
           TAB 3: BOOKINGS MANAGEMENT
           ===================================================================== */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['All', ...STATUSES].map(st => (
                  <button
                    key={st}
                    onClick={() => setBookingFilterStatus(st)}
                    className={`btn btn-sm ${bookingFilterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '260px', padding: '0.45rem 0.85rem', fontSize: '0.9rem' }}
                  placeholder="Search customer, phone, ID..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') loadBookings(); }}
                />
                <button className="btn btn-secondary btn-sm" onClick={loadBookings}>
                  Filter
                </button>
              </div>
            </div>

            {bookingsLoading && <div className="spinner"></div>}

            {!bookingsLoading && bookings.length === 0 && (
              <div className="empty-state">
                <h3>No Bookings Found</h3>
                <p>No customer bookings match the selected status filter.</p>
              </div>
            )}

            {!bookingsLoading && bookings.length > 0 && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer Info</th>
                      <th>Service</th>
                      <th>Schedule</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 'bold' }}>#{b.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.customer_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            📞 {b.customer_phone}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            ✉️ {b.customer_email}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.service?.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                            ₹{b.service?.price}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{b.booking_date}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            {b.booking_time}
                          </div>
                        </td>
                        <td>
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                            style={{ 
                              padding: '0.35rem 0.6rem', 
                              borderRadius: 'var(--radius-sm)', 
                              border: '1px solid var(--color-border)', 
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              background: '#FFFFFF',
                              cursor: 'pointer'
                            }}
                          >
                            {STATUSES.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteBooking(b.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
           SERVICE ADD / EDIT MODAL
           ===================================================================== */}
        {serviceModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div className="card" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  {editingService ? `Edit Service #${editingService.id}` : 'Add New Painting Service'}
                </h3>
                <button 
                  onClick={() => setServiceModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleServiceSubmit}>
                <div className="form-group">
                  <label className="form-label">Service Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={serviceFormData.name}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-control"
                      value={serviceFormData.category}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Starting Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-control"
                      value={serviceFormData.price}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Estimated Duration *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. 1 Day, 2-3 Days"
                      value={serviceFormData.duration}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, duration: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Image Path</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="/images/interior.jpg"
                      value={serviceFormData.image}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, image: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Description *</label>
                  <textarea
                    required
                    rows="3"
                    className="form-control"
                    value={serviceFormData.description}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingService ? 'Save Changes' : 'Create Service in MySQL'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setServiceModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
