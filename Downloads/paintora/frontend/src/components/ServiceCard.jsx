import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { getServiceImage } from '../utils/serviceImages';

export default function ServiceCard({ service }) {
  const [imageError, setImageError] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(service.price);

  const imageSrc = getServiceImage(service);

  return (
    <div className="card card-hoverable" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        position: 'relative',
        marginBottom: '1.25rem',
        overflow: 'hidden',
        borderRadius: 'var(--radius-md)',
        aspectRatio: '16/10',
        background: 'var(--color-surface-soft)',
      }}>
        {imageError ? (
          <div className="image-fallback-block" aria-label={service.name}>
            <Logo size="sm" variant="mark" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{service.category}</span>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={service.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}

        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
          <span className="badge badge-category">{service.category}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
            {service.name}
          </h3>
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-soft)',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
          }}>
            ⏱ {service.duration}
          </span>
        </div>

        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '0.9rem',
          marginBottom: '1.25rem',
          flex: 1,
          lineClamp: 2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.55,
        }}>
          {service.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Starting at
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {formattedPrice}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={`/services/${service.id}`} className="btn btn-secondary btn-sm">
              View Details
            </Link>
            <Link to={`/book?serviceId=${service.id}`} className="btn btn-primary btn-sm">
              Book
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
