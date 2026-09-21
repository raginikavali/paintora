import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchServices } from '../services/api';
import ServiceCard from '../components/ServiceCard';

const CATEGORIES = ['All', 'Interior', 'Exterior', 'Decorative', 'Full Home', 'Woodwork'];

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load services whenever category or search param changes
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchServices(searchTerm, selectedCategory);
        setServices(data);
      } catch (err) {
        setError(err.message || 'Failed to load services from backend catalog.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedCategory, searchTerm]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    const newParams = new URLSearchParams(searchParams);
    if (!val) {
      newParams.delete('search');
    } else {
      newParams.set('search', val);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '680px', marginBottom: '2.5rem' }}>
        <span className="badge badge-category" style={{ marginBottom: '0.5rem' }}>
          Professional Home Solutions
        </span>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
          Painting Services Catalog
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Explore interior, exterior, decorative texture, and full home painting with transparent starting prices and certified painter crews.
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
        background: '#FFFFFF',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        marginBottom: '2.5rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div style={{ minWidth: '260px', flex: '1 1 260px', maxWidth: '380px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by package name or feature..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Skeleton Shimmer Loading State */}
      {loading && (
        <div className="grid-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card skeleton skeleton-card" />
          ))}
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          <span>⚠️</span>
          <div>
            <strong>Error connecting to catalog:</strong> {error}
          </div>
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <div className="empty-state">
          <h3 className="font-serif">No painting services found</h3>
          <p>We couldn't find any services matching "{searchTerm || selectedCategory}". Try clearing your search query.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSelectedCategory('All');
              setSearchTerm('');
              setSearchParams({});
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Services Grid */}
      {!loading && !error && services.length > 0 && (
        <div className="grid-3">
          {services.map((svc) => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </div>
      )}
    </div>
  );
}
