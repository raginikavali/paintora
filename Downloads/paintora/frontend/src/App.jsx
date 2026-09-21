import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import BookingStatusPage from './pages/BookingStatusPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage, { ADMIN_SESSION_KEY } from './pages/AdminLoginPage';
import CustomerAuthPage, { CUSTOMER_SESSION_KEY } from './pages/CustomerAuthPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';

function AdminRoute({ children }) {
  const admin = sessionStorage.getItem(ADMIN_SESSION_KEY);
  return admin ? children : <Navigate to="/admin/login" replace state={{ from: '/admin/dashboard' }} />;
}

function CustomerRoute({ children }) {
  const customer = sessionStorage.getItem(CUSTOMER_SESSION_KEY);
  return customer ? children : <Navigate to="/login" replace state={{ from: '/account' }} />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceDetailsPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/booking-confirmation/:id" element={<BookingConfirmationPage />} />
          <Route path="/track-booking" element={<BookingStatusPage />} />
          <Route path="/login" element={<CustomerAuthPage mode="login" />} />
          <Route path="/signup" element={<CustomerAuthPage mode="signup" />} />
          <Route path="/account" element={<CustomerRoute><CustomerDashboardPage /></CustomerRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          {/* Catch-all fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
