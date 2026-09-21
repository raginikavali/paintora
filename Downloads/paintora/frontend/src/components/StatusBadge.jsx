import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || 'Pending').toLowerCase().replace(/\s+/g, '');

  let badgeClass = 'badge-pending';
  if (normalized === 'confirmed') badgeClass = 'badge-confirmed';
  if (normalized === 'inprogress') badgeClass = 'badge-inprogress';
  if (normalized === 'completed') badgeClass = 'badge-completed';
  if (normalized === 'cancelled') badgeClass = 'badge-cancelled';

  return (
    <span className={`badge ${badgeClass}`}>
      <span style={{ fontSize: '0.65rem' }}>●</span> {status}
    </span>
  );
}
