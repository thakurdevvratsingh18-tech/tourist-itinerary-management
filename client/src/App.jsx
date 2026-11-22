import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import SharedItinerary from './pages/SharedItinerary';
import NotFound from './pages/NotFound';

// User Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome';
import SmartJourneyComposer from './pages/dashboard/SmartJourneyComposer';
import MyTrips from './pages/dashboard/MyTrips';
import CreateTrip from './pages/dashboard/CreateTrip';
import TripDetail from './pages/dashboard/TripDetail';
import Bookings from './pages/dashboard/Bookings';
import Favorites from './pages/dashboard/Favorites';
import MyReviews from './pages/dashboard/MyReviews';
import Profile from './pages/dashboard/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DestinationManagement from './pages/admin/DestinationManagement';
import TripMonitoring from './pages/admin/TripMonitoring';
import ReviewModeration from './pages/admin/ReviewModeration';
import ContactInquiries from './pages/admin/ContactInquiries';

export default function App() {
  return (
    <Routes>
      {/* ─── Public Website Routes ────────────────────────────────────────────── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:slug" element={<DestinationDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/share/:token" element={<SharedItinerary />} />
      </Route>

      {/* ─── User Dashboard (Protected) ───────────────────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="composer" element={<SmartJourneyComposer />} />
        <Route path="trips" element={<MyTrips />} />
        <Route path="trips/new" element={<CreateTrip />} />
        <Route path="trips/:id" element={<TripDetail />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="reviews" element={<MyReviews />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ─── Admin Dashboard (Protected, Admin Only) ─────────────────────────── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="destinations" element={<DestinationManagement />} />
        <Route path="trips" element={<TripMonitoring />} />
        <Route path="reviews" element={<ReviewModeration />} />
        <Route path="contact" element={<ContactInquiries />} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
