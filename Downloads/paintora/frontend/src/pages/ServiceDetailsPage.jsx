import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchServiceById } from '../services/api';
import Logo from '../components/Logo';
import { getServiceImage } from '../utils/serviceImages';

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchServiceById(id);
        setService(data);
      } catch (err) {
        setError(err.message || 'Service not found.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading service details from catalog...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem' }}>
        <div className="empty-state">
          <h3 className="font-serif">Service Not Found</h3>
          <p>{error || 'The requested painting service could not be located in our system.'}</p>
          <Link to="/services" className="btn btn-primary">
            ← Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(service.price);

  const imageSrc = getServiceImage(service);

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 6rem' }}>
      {/* Breadcrumb Navigation */}
      <nav style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }} aria-label="Breadcrumb">
        <Link to="/home" style={{ color: 'var(--color-text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <Link to="/services" style={{ color: 'var(--color-text-secondary)' }}>Services</Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{service.name}</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'flex-start' }}>
        {/* Left Column: Real Photo & What is Included */}
        <div>
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '2rem',
            aspectRatio: '16/10',
            background: 'var(--color-surface-soft)',
          }}>
            {imageError ? (
              <div className="image-fallback-block">
                <Logo size="lg" variant="mark" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{service.name}</span>
              </div>
            ) : (
              <img
                src={imageSrc}
                alt={service.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="eager"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text)' }}>
              What is included in this service:
            </h3>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--status-completed)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong>Complete Surface Preparation:</strong> Sanding, filling minor plaster hairline cracks, and cleaning dust.
                </div>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--status-completed)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong>Primer Base Coat:</strong> High-adhesion anti-fungal primer for longevity and moisture resistance.
                </div>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--status-completed)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong>Two Finish Emulsion Coats:</strong> Smooth, uniform finish with premium low-VOC washable paint.
                </div>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--status-completed)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong>Floor & Furniture Masking:</strong> Full protective covering for sofa, tables, switches, and floors.
                </div>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--status-completed)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong>Post-Job Deep Cleanup:</strong> Disposal of paint debris, removing tapes, and leaving the room tidy.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Service Info & Booking Card */}
        <div>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-category">{service.category}</span>
              <span className="badge" style={{ background: 'var(--color-surface-soft)', color: 'var(--color-text-secondary)' }}>
                ⏱ {service.duration}
              </span>
            </div>

            <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
              {service.name}
            </h1>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              {service.description}
            </p>

            {/* Price Box */}
            <div style={{
              background: 'var(--color-primary-light)',
              border: '1px solid var(--color-primary-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              marginBottom: '2rem',
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Starting Estimate
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                {formattedPrice}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                * Final pricing is confirmed on-site based on exact wall measurement and paint brand preference.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link
                to={`/book?serviceId=${service.id}`}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', fontSize: '1.15rem' }}
              >
                Book This Service Now →
              </Link>
              <Link
                to="/services"
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Browse Other Services
              </Link>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '2rem', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                <span>🔒</span>
                <span>No advance payment needed until our color consultant inspects the site.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
