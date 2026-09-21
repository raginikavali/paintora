/**
 * Paintora API Service Layer
 * Centralizes all HTTP communication between React frontend and PHP REST APIs.
 */

// Base API URL pointing to the PHP backend.
// Local XAMPP backend used by the frontend.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/paintora/backend/api';

/**
 * Generic request helper with JSON parsing and standardized error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const res = await fetch(url, config);
    const result = await res.json().catch(() => ({
      success: false,
      message: `Failed to parse server response (${res.status} ${res.statusText})`,
      error: 'PARSE_ERROR'
    }));

    if (!res.ok || result.success === false) {
      const error = new Error(result.message || 'API request failed');
      error.status = res.status;
      error.code = result.error || 'API_ERROR';
      error.errors = result.errors || null;
      throw error;
    }

    return result;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error('Cannot connect to PHP backend. Please ensure XAMPP is running at http://localhost/paintora/backend/api.');
      networkError.code = 'NETWORK_ERROR';
      throw networkError;
    }
    throw err;
  }
}

// =====================================================================
// SERVICES API
// =====================================================================

export async function fetchServices(search = '', category = '') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category && category.toLowerCase() !== 'all') params.append('category', category);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await request(`/services.php${query}`);
  return response.data || [];
}

export async function fetchServiceById(id) {
  const response = await request(`/services.php?id=${encodeURIComponent(id)}`);
  return response.data;
}

export async function createService(data) {
  const response = await request('/services.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateService(id, data) {
  const response = await request(`/services.php?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteService(id) {
  const response = await request(`/services.php?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return response;
}

// =====================================================================
// BOOKINGS API
// =====================================================================

export async function fetchBookings(status = '', search = '') {
  const params = new URLSearchParams();
  if (status && status.toLowerCase() !== 'all') params.append('status', status);
  if (search) params.append('search', search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await request(`/bookings.php${query}`);
  return response.data || [];
}

export async function fetchBookingById(id) {
  const response = await request(`/bookings.php?id=${encodeURIComponent(id)}`);
  return response.data;
}

export async function createBooking(data) {
  const response = await request('/bookings.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateBookingStatus(id, status) {
  const response = await request(`/bookings.php?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return response.data;
}

export async function deleteBooking(id) {
  const response = await request(`/bookings.php?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return response;
}

// =====================================================================
// ADMIN & DASHBOARD API
// =====================================================================

export async function fetchAdminStats() {
  const response = await request('/admin.php?action=stats');
  return response.data;
}

export async function adminLogin(email, password) {
  const response = await request('/admin.php?action=login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return response.data;
}

export async function adminLogout() {
  const response = await request('/admin.php?action=logout', { method: 'POST' });
  return response;
}

// =====================================================================
// CUSTOMER AUTHENTICATION API
// =====================================================================

export async function customerSignup(data) {
  const response = await request('/customers.php?action=signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function customerLogin(email, password) {
  const response = await request('/customers.php?action=login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return response.data;
}

export async function customerLogout() {
  const response = await request('/customers.php?action=logout', { method: 'POST' });
  return response;
}

export async function fetchCustomerProfile() {
  const response = await request('/customers.php?action=me');
  return response.data;
}

export async function fetchCustomerBookings() {
  const response = await request('/bookings.php');
  return response.data || [];
}
