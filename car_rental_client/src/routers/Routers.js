import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  Home,
  NotFound,
  // Auth pages
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  // Cars pages
  CarListing,
  CarDetails,
  // User pages
  Profile,
  MyBookings,
  Settings,
  VerifyEmailOtp,
  AccountSuspended,
  // Content pages
  About,
  Blog,
  BlogDetails,
  Contact,
  BecomeDriver,
} from "../pages";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import RedirectIfAuthenticated from "../components/RedirectIfAuthenticated";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/cars" element={<CarListing />} />
      <Route path="/cars/:slug" element={<CarDetails />} />
      <Route path="/blogs" element={<Blog />} />
      <Route path="/blogs/:slug" element={<BlogDetails />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/account-suspended" element={<AccountSuspended />} />
      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <Login />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/register"
        element={
          <RedirectIfAuthenticated>
            <Register />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <RedirectIfAuthenticated>
            <ForgotPassword />
          </RedirectIfAuthenticated>
        }
      />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/verify-email-otp" element={<VerifyEmailOtp />} />

      {/* Become Driver Route */}
      <Route
        path="/become-driver"
        element={
          <ProtectedRoute>
            <BecomeDriver />
          </ProtectedRoute>
        }
      />

      {/* Owner Routes */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Routers;
