import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Public & Student Portal Pages
import { LandingPage } from './pages/LandingPage';
import { SubmitComplaintPage } from './pages/SubmitComplaintPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Portal Pages (Protected by AdminLayout)
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminComplaintsPage } from './pages/AdminComplaintsPage';
import { AdminComplaintDetailPage } from './pages/AdminComplaintDetailPage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Top-Level Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/submit" element={<SubmitComplaintPage />} />
          <Route path="/track" element={<Navigate to="/student/complaints" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Authenticated Student Portal Routes */}
          <Route path="/student/complaints" element={<MyComplaintsPage />} />
          <Route path="/student/complaints/:id" element={<ComplaintDetailsPage />} />
          <Route path="/student/dashboard" element={<Navigate to="/student/complaints" replace />} />
          <Route path="/student/profile" element={<ProfilePage />} />
          <Route path="/student" element={<Navigate to="/student/complaints" replace />} />
          <Route path="/student/submit" element={<Navigate to="/submit" replace />} />

          {/* Dedicated Admin Portal Access */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="complaints" element={<AdminComplaintsPage />} />
            <Route path="complaints/:id" element={<AdminComplaintDetailPage />} />
            <Route path="reports" element={<ReportsAnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
