import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchServices } from '../services/api';
import ServiceCard from '../components/ServiceCard';
import { CUSTOMER_SESSION_KEY } from './AuthLandingPage';
import useReveal from '../hooks/useReveal';

export default function HomePage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Reveal hooks for scroll animations
  const quickActionsRef = useReveal();
  const popularRef = useReveal();
  const processRef = useReveal();
  const whyRef = useReveal();
  const galleryRef = useReveal();
  const ctaRef = useReveal();

  // Get customer profile name
  const [customer] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CUSTOMER_SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  });

  const firstName = customer?.name ? customer.name.trim().split(' ')[0] : 'there';

  useEffect(() => {
    async function loadPopularServices() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchServices();
        // Show top 3 or 4 services
        setServices(data.slice(0, 3));
      } catch (err) {
        setError(err.message || 'Unable to load services from catalog.');
      } finally {
        setLoading(false);
      }
    }
    loadPopularServices();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  return (
    <div>
      {/* =====================================================================
         1. PERSONALISED HERO SECTION
         ===================================================================== */}
      <section style={{
        position: 'relative',
        backgroundColor: '#1C1C1C',
        color: '#FAF8F5',
        overflow: 'hidden',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        padding: '4.5rem 0 5rem',
      }}>
        {/* Background real hero photo with slow Ken-Burns motion */}
        <img
          src="/images/hero.jpg"
          alt="Professional painter rolling paint onto wall"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.38,
            animation: 'kenBurns 24s infinite alternate ease-in-out',
          }}
          width="1600"
          height="1067"
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(200, 90, 50, 0.75) 0%, rgba(28, 28, 28, 0.88) 70%)',
          zIndex: 1,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <div style={{ maxWidth: '680px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#FAF8F5',
              marginBottom: '1.25rem',
            }}>
              <span>✦</span> Paintora Customer Portal
            </div>

            <h1 className="font-serif" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: '1rem', color: '#FFFFFF' }}>
              Welcome back, {firstName}
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#FCEEE8', lineHeight: 1.6, marginBottom: '2.25rem', maxWidth: '580px' }}>
              Schedule your next room repaint, explore designer texture packages, or check the progress of your scheduled painters in real time.
            </p>

            {/* Quick Hero Search Form */}
            <form onSubmit={handleSearchSubmit} style={{
              display: 'flex',
              gap: '0.5rem',
              background: '#FFFFFF',
              padding: '0.4rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '520px',
              marginBottom: '1.75rem',
            }}>
              <input
                type="text"
                className="form-control"
                style={{ border: 'none', boxShadow: 'none', padding: '0.65rem 0.9rem', fontSize: '0.95rem' }}
                placeholder="Search interior, exterior, single room, texture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 1.25rem' }}>
                Search
              </button>
            </form>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/services" className="btn btn-primary btn-lg">
                Explore Services
              </Link>
              <Link to="/track-booking" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#FAF8F5', color: 'var(--color-text)' }}>
                Track My Booking
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
         2. QUICK-ACTION SHORTCUT CARDS
         ===================================================================== */}
      <section ref={quickActionsRef} className="reveal-item" style={{ marginTop: '-2.5rem', position: 'relative', zIndex: 10, paddingBottom: '3.5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <Link to="/services" className="card card-hoverable" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', background: '#FFFFFF', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'var(--color-primary)' }}>
                🎨
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.2rem' }}>Book a Service</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Browse 7 transparent painting packages</p>
              </div>
            </Link>

            <Link to="/track-booking" className="card card-hoverable" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', background: '#FFFFFF', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'var(--status-confirmed-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'var(--status-confirmed)' }}>
                📍
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.2rem' }}>Track Appointments</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>View real-time schedule & milestones</p>
              </div>
            </Link>

            <Link to="/account" className="card card-hoverable" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', background: '#FFFFFF', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'var(--status-completed-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'var(--status-completed)' }}>
                👤
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.2rem' }}>My Account</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Profile details and booking history</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
         3. POPULAR SERVICES WITH REAL IMAGES & SHIMMER LOADING
         ===================================================================== */}
      <section ref={popularRef} className="reveal-item" style={{ padding: '3rem 0 4.5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-category" style={{ marginBottom: '0.5rem' }}>Curated Packages</span>
              <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700 }}>Popular Home Services</h2>
            </div>
            <Link to="/services" className="btn btn-outline">
              View All Services →
            </Link>
          </div>

          {/* Shimmer skeleton loader */}
          {loading && (
            <div className="grid-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="card skeleton-card skeleton" />
              ))}
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          {!loading && !error && services.length > 0 && (
            <div className="grid-3">
              {services.map((svc) => (
                <ServiceCard key={svc.id} service={svc} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
         4. HOW IT WORKS: 4 ANIMATED STEPS WITH CONNECTING LINE
         ===================================================================== */}
      <section ref={processRef} className="reveal-item" style={{ background: '#FFFFFF', padding: '5rem 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span className="badge badge-category" style={{ marginBottom: '0.5rem' }}>Seamless Execution</span>
            <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              How Paintora Works
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
              From online booking to final cleanup, our structured 4-step process delivers quality results without surprises.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', position: 'relative' }}>
            {/* Step 1 */}
            <div className="card" style={{ padding: '1.75rem 1.5rem', position: 'relative' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                1
              </div>
              <div style={{ height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                <img src="/images/process-consult.jpg" alt="Color consultation" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>Choose Your Package</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Select from our transparent interior, exterior, texture, or single-room options.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: '1.75rem 1.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                2
              </div>
              <div style={{ height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                <img src="/images/process-prep.jpg" alt="Surface masking and prep" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>Surface Prep & Masking</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Painters mask furniture, repair cracks, and seal floors before touching any wall.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: '1.75rem 1.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                3
              </div>
              <div style={{ height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                <img src="/images/process-paint.jpg" alt="Paint application" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>Precision Coating</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                High-adhesion primer followed by two smooth coats of premium washable emulsion.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ padding: '1.75rem 1.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                4
              </div>
              <div style={{ height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                <img src="/images/process-clean.jpg" alt="Clean room handover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>Inspection & Cleanup</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                All tape and drop cloths are removed, leaving your home spotless and ready to enjoy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
         5. WHY CHOOSE US
         ===================================================================== */}
      <section ref={whyRef} className="reveal-item" style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span className="badge badge-category" style={{ marginBottom: '0.5rem' }}>Service Standards</span>
            <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Why Choose Paintora
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
              Professional results without the hassle, mess, or unpredictable contractor quotes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
            <div className="card card-hoverable" style={{ padding: '2rem 1.5rem' }}>
              <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '1rem' }}>🛡️</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Vetted & Trained Pros</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                All painters are background-checked, trained in modern techniques, and adhere to strict safety standards.
              </p>
            </div>

            <div className="card card-hoverable" style={{ padding: '2rem 1.5rem' }}>
              <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '1rem' }}>🏷️</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Transparent Pricing</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Upfront starting estimates calculated on real room and wall requirements, with zero surprise hidden charges.
              </p>
            </div>

            <div className="card card-hoverable" style={{ padding: '2rem 1.5rem' }}>
              <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '1rem' }}>🧹</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dust-Free Masking</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Complete protection for floors, switches, and furniture, followed by thorough post-service debris cleanup.
              </p>
            </div>

            <div className="card card-hoverable" style={{ padding: '2rem 1.5rem' }}>
              <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '1rem' }}>⏱️</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>On-Time Milestones</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Convenient arrival windows and live progress tracking from pending confirmation to project completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
         6. REAL FINISHES GALLERY STRIP
         ===================================================================== */}
      <section ref={galleryRef} className="reveal-item" style={{ background: 'var(--color-surface-soft)', padding: '5rem 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <span className="badge badge-category" style={{ marginBottom: '0.5rem' }}>Real Projects</span>
            <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Fresh Finishes & Transformations
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
              Take a look at genuine completed spaces repainted with our washable emulsions and textures.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img src="/images/gallery-1.jpg" alt="Living room accent wall" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} className="card-hoverable" loading="lazy" />
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-text)' }}>Warm Neutral Living Room</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Interior Double Coat Emulsion</span>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img src="/images/gallery-2.jpg" alt="Clean exterior coating" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} className="card-hoverable" loading="lazy" />
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-text)' }}>Weatherproof Exterior Finish</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Anti-Algae Shield</span>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img src="/images/gallery-3.jpg" alt="Dining room feature wall" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} className="card-hoverable" loading="lazy" />
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-text)' }}>Designer Stucco Texture</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Feature Accent Wall</span>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img src="/images/gallery-4.jpg" alt="Study room repaint" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} className="card-hoverable" loading="lazy" />
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-text)' }}>Single Room Makeover</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Low-VOC Odorless Finish</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
         7. CLOSING CALL-TO-ACTION BANNER
         ===================================================================== */}
      <section ref={ctaRef} className="reveal-item" style={{ padding: '5rem 0 6rem', textAlign: 'center' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), #A8431F)',
            color: '#FFFFFF',
            padding: '3.75rem 2rem',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Subtle paint sweep accent */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              pointerEvents: 'none',
            }} />

            <h2 className="font-serif" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 700, marginBottom: '1rem', color: '#FFFFFF' }}>
              Ready to give your home a fresh look?
            </h2>
            <p style={{ fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto 2.25rem', opacity: 0.95, lineHeight: 1.6 }}>
              Choose from our catalog of certified services. Transparent estimates with convenient online booking.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/services" className="btn btn-secondary btn-lg" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                Explore Painting Services
              </Link>
              <Link to="/track-booking" className="btn btn-outline btn-lg" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.6)' }}>
                Track an Existing Booking
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
