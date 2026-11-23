import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { MOTION_EASE } from './lib/motion';

import { SkeletonLoader } from './components/SkeletonLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { lazyWithRetry } from './utils/lazyWithRetry';

// Code-split Lazy-Loaded Routes with Automatic Deployment Drift Retry
const LandingPage = lazyWithRetry(() => import('./pages/LandingPage'));
const SubmitComplaintPage = lazyWithRetry(() => import('./pages/SubmitComplaintPage'));
const TrackComplaintPage = lazyWithRetry(() => import('./pages/TrackComplaintPage'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage'));
const VerifyEmailPage = lazyWithRetry(() => import('./pages/VerifyEmailPage'));
const ForgotPasswordPage = lazyWithRetry(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/ResetPasswordPage'));
const StudentDashboard = lazyWithRetry(() => import('./pages/StudentDashboard'));
const MyComplaintsPage = lazyWithRetry(() => import('./pages/MyComplaintsPage'));
const ComplaintDetailsPage = lazyWithRetry(() => import('./pages/ComplaintDetailsPage'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'));

// Admin Portal Pages (Protected by AdminLayout)
const AdminLoginPage = lazyWithRetry(() => import('./pages/AdminLoginPage'));
const AdminLayout = lazyWithRetry(() => import('./components/AdminLayout'));
const AdminDashboard = lazyWithRetry(() => import('./pages/AdminDashboard'));
const AdminComplaintsPage = lazyWithRetry(() => import('./pages/AdminComplaintsPage'));
const AdminComplaintDetailPage = lazyWithRetry(() => import('./pages/AdminComplaintDetailPage'));
const ReportsAnalyticsPage = lazyWithRetry(() => import('./pages/ReportsAnalyticsPage'));
const AdminSettingsPage = lazyWithRetry(() => import('./pages/AdminSettingsPage'));
const AdminStaffPage = lazyWithRetry(() => import('./pages/AdminStaffPage'));
const AdminStudentsPage = lazyWithRetry(() => import('./pages/AdminStudentsPage'));
const StaffDashboard = lazyWithRetry(() => import('./pages/StaffDashboard'));

// Restrained Academic SkeletonLoader Page Fallback
function PageFallback() {
  return (
    <div
      style={{
        minHeight: '80vh',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '36px 20px',
        width: '100%',
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <SkeletonLoader height="36px" width="40%" style={{ marginBottom: '20px' }} />
      <SkeletonLoader height="18px" width="65%" style={{ marginBottom: '28px' }} />
      <SkeletonLoader height="220px" width="100%" borderRadius="12px" style={{ marginBottom: '24px' }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}
      >
        <SkeletonLoader height="140px" borderRadius="10px" />
        <SkeletonLoader height="140px" borderRadius="10px" />
        <SkeletonLoader height="140px" borderRadius="10px" />
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const { checkAdminSession, isAdminLoggedIn } = useApp();

  // Call admin /me only on admin routes (/admin/*) or admin login page, or staff routes
  React.useEffect(() => {
    const path = location.pathname.toLowerCase();
    const isAdminOrStaff = path.startsWith('/admin') || path === '/adminlogin' || path.startsWith('/staff');
    if (isAdminOrStaff && !isAdminLoggedIn) {
      checkAdminSession();
    }
  }, [location.pathname, isAdminLoggedIn, checkAdminSession]);

  // Responsive mobile keyboard handling: prevent active input from being hidden behind virtual keyboard
  React.useEffect(() => {
    const handleFocusIn = (e) => {
      const tag = e.target?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
        setTimeout(() => {
          if (typeof e.target?.scrollIntoView === 'function') {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    };
    window.addEventListener('focusin', handleFocusIn);
    return () => window.removeEventListener('focusin', handleFocusIn);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={location.pathname}
        className="app-route-container"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: MOTION_EASE }}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <Suspense fallback={<PageFallback />}>
          <ErrorBoundary>
            <Routes location={location}>
            {/* Public Top-Level Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/submit" element={<SubmitComplaintPage />} />
            <Route path="/submit-complaint" element={<Navigate to="/submit" replace />} />
            <Route path="/track" element={<TrackComplaintPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<Navigate to="/dashboard" replace />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Authenticated Student Portal Routes */}
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/my-complaints" element={<MyComplaintsPage />} />
            <Route path="/dashboard/complaints/:id" element={<ComplaintDetailsPage />} />
            <Route path="/student/complaints" element={<MyComplaintsPage />} />
            <Route path="/student/complaints/:id" element={<ComplaintDetailsPage />} />
            <Route path="/student/dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/student/profile" element={<ProfilePage />} />
            <Route path="/student" element={<Navigate to="/dashboard" replace />} />
            <Route path="/student/submit" element={<Navigate to="/submit" replace />} />

            {/* Dedicated Separate Administrator Access */}
            <Route path="/adminlogin" element={<AdminLoginPage />} />
            <Route path="/admin/login" element={<Navigate to="/adminlogin" replace />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="complaints" element={<AdminComplaintsPage />} />
              <Route path="complaints/:id" element={<AdminComplaintDetailPage />} />
              <Route path="staff" element={<AdminStaffPage />} />
              <Route path="technicians" element={<Navigate to="/admin/staff" replace />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="reports" element={<ReportsAnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="desk" element={<StaffDashboard />} />
            </Route>

            {/* Staff Resolution Portal */}
            <Route path="/staff" element={<AdminLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="dashboard" element={<StaffDashboard />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
      </m.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <LazyMotion features={domAnimation} strict={false}>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </LazyMotion>
    </AppProvider>
  );
}
