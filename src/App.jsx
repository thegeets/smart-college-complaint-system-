import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Public & Student-facing Pages (No login required)
import { LandingPage } from './pages/LandingPage';
import { SubmitComplaintPage } from './pages/SubmitComplaintPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';

// Admin Portal Pages (Protected by AdminLayout & Simulated Login)
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
          <Route path="/track" element={<TrackComplaintPage />} />
          <Route path="/complaint/:id" element={<ComplaintDetailsPage />} />

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

          {/* Graceful redirects for removed student demo login & legacy routes */}
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/student" element={<Navigate to="/submit" replace />} />
          <Route path="/student/submit" element={<Navigate to="/submit" replace />} />
          <Route path="/student/complaints" element={<Navigate to="/track" replace />} />
          <Route path="/student/*" element={<Navigate to="/" replace />} />
          <Route path="/staff/*" element={<Navigate to="/admin/login" replace />} />

          {/* Catch-all fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

