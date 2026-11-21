import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ToastContainer } from './ToastContainer';
import {
  LayoutDashboard,
  FileSpreadsheet,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export function AdminLayout() {
  const { isAdminLoggedIn, adminUser, logoutAdmin, language, isCheckingSession, fetchReportsSummary } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingBadgeCount, setPendingBadgeCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const isNe = language === 'ne';

  // Fetch pending review count for the sidebar badge
  useEffect(() => {
    let isMounted = true;
    if (isAdminLoggedIn) {
      fetchReportsSummary()
        .then((data) => {
          if (isMounted && data?.pendingReview !== undefined) {
            setPendingBadgeCount(data.pendingReview);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [isAdminLoggedIn, fetchReportsSummary, location.pathname]);

  // Guard: If checking session, show clean loading state
  if (isCheckingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          {isNe ? 'सत्र प्रमाणीकरण हुँदैछ...' : 'Verifying administrative session...'}
        </div>
      </div>
    );
  }

  // Guard: If admin is not logged in, redirect to admin login
  if (!isAdminLoggedIn) {
    return <Navigate to="/adminlogin" replace state={{ from: location.pathname }} />;
  }

  const handleLogout = () => {
    logoutAdmin();
    navigate('/adminlogin');
  };

  // Structured enterprise navigation sections
  const navSections = [
    {
      title: isNe ? 'कार्य सञ्चालन' : 'Core Operations',
      items: [
        {
          to: '/admin/dashboard',
          label: isNe ? 'ड्यासबोर्ड' : 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          to: '/admin/complaints',
          label: isNe ? 'उजुरी सूची' : 'Complaints Queue',
          icon: FileSpreadsheet,
          badge: pendingBadgeCount > 0 ? pendingBadgeCount : null,
        },
      ],
    },
    {
      title: isNe ? 'तथ्याङ्क तथा लेखाजोखा' : 'Intelligence & Audit',
      items: [
        {
          to: '/admin/reports',
          label: isNe ? 'प्रतिवेदन तथा तथ्याङ्क' : 'Reports & Analytics',
          icon: BarChart3,
          badge: null,
        },
      ],
    },
    {
      title: isNe ? 'प्रणाली' : 'Configuration',
      items: [
        {
          to: '/admin/settings',
          label: isNe ? 'प्रणाली सेटिङ्स' : 'Portal Settings',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  // Dynamic breadcrumb label helper
  const getBreadcrumbLabel = () => {
    if (location.pathname === '/admin/dashboard') return isNe ? 'ड्यासबोर्ड' : 'Dashboard';
    if (location.pathname === '/admin/complaints') return isNe ? 'उजुरी सूची' : 'Complaints Queue';
    if (location.pathname.startsWith('/admin/complaints/')) return isNe ? 'उजुरी समीक्षा' : 'Grievance Docket';
    if (location.pathname === '/admin/reports') return isNe ? 'प्रतिवेदन तथा तथ्याङ्क' : 'Reports & Analytics';
    if (location.pathname === '/admin/settings') return isNe ? 'प्रणाली सेटिङ्स' : 'Portal Settings';
    return isNe ? 'प्रशासन' : 'Administration';
  };

  const adminInitials = adminUser?.name
    ? adminUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="admin-app-wrapper">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Admin Dedicated Sidebar (Desktop) */}
      <aside className="admin-sidebar" aria-label="Admin Navigation Sidebar">
        {/* Sidebar Header */}
        <div className="admin-sidebar-header">
          <BrandLogo size={32} variant="light" subtitle={isNe ? 'प्रशासनिक डेस्क' : 'Admin Operations'} />
        </div>

        {/* Administrator Profile Card */}
        <div className="admin-sidebar-profile">
          <div className="admin-avatar-circle" title={adminUser?.name || 'Administrator'}>
            {adminInitials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {adminUser?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={11} color="#5278C8" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminUser?.title || 'System Administrator'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="admin-sidebar-nav">
          {navSections.map((sec, idx) => (
            <div key={idx} style={{ marginBottom: '8px' }}>
              <div className="admin-nav-section-label">{sec.title}</div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to));

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="admin-nav-badge" title={`${item.badge} pending triage`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Links */}
        <div className="admin-sidebar-footer">
          <div className="admin-system-status">
            <span className="admin-status-pulse" />
            <span>{isNe ? 'प्रणाली: सक्रिय (MongoDB)' : 'System: Live (MongoDB Atlas)'}</span>
          </div>

          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#94A3B8',
              fontSize: '0.75rem',
              textDecoration: 'none',
              padding: '6px 8px',
              borderRadius: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ExternalLink size={13} />
              <span>{isNe ? 'सार्वजनिक गृहपृष्ठ' : 'Public Website'}</span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>↗</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#F87171',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '6px 8px',
              textAlign: 'left',
              borderRadius: '4px',
              transition: 'background 0.15s ease'
            }}
          >
            <LogOut size={13} />
            <span>{isNe ? 'लगआउट गर्नुहोस्' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation (When Screen <= 768px) */}
      {mobileSidebarOpen && (
        <div
          className="admin-mobile-drawer-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="admin-mobile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <BrandLogo size={28} variant="light" subtitle={isNe ? 'प्रशासनिक डेस्क' : 'Admin Operations'} />
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Administrator Profile Card */}
            <div className="admin-sidebar-profile" style={{ margin: '14px 14px 6px' }}>
              <div className="admin-avatar-circle">
                {adminInitials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {adminUser?.name || 'Administrator'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '2px' }}>
                  {adminUser?.title || 'System Administrator'}
                </div>
              </div>
            </div>

            {/* Mobile Navigation Sections */}
            <nav className="admin-sidebar-nav" style={{ padding: '14px 12px' }}>
              {navSections.map((sec, idx) => (
                <div key={idx} style={{ marginBottom: '10px' }}>
                  <div className="admin-nav-section-label">{sec.title}</div>
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.to ||
                      (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to));

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`admin-nav-item ${isActive ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== null && item.badge !== undefined && (
                          <span className="admin-nav-badge">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Mobile Footer Links */}
            <div className="admin-sidebar-footer" style={{ marginTop: 'auto' }}>
              <Link
                to="/"
                onClick={() => setMobileSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#94A3B8',
                  fontSize: '0.8125rem',
                  textDecoration: 'none',
                  padding: '8px'
                }}
              >
                <ExternalLink size={14} />
                <span>{isNe ? 'सार्वजनिक वेबसाइट' : 'Public Website'}</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileSidebarOpen(false);
                  handleLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#F87171',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  padding: '8px',
                  textAlign: 'left'
                }}
              >
                <LogOut size={14} />
                <span>{isNe ? 'लगआउट' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Administrative Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Administrative Topbar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Toggle admin navigation menu"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb Trail */}
            <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
              <Link to="/admin/dashboard" className="admin-breadcrumb-item">
                <LayoutDashboard size={14} />
                <span>{isNe ? 'प्रशासन' : 'Admin'}</span>
              </Link>
              <ChevronRight size={12} color="#94A3B8" />
              <span className="admin-breadcrumb-current">{getBreadcrumbLabel()}</span>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* System Status Pill (Desktop) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              color: '#15803D',
              fontWeight: '600'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
              <span className="desktop-only">{isNe ? 'प्रणाली सक्रिय' : 'Live Atlas'}</span>
            </div>

            <LanguageSwitcher size="sm" />

            {/* Admin User Header Profile Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '0.8125rem'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                backgroundColor: '#101D35',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6875rem',
                fontWeight: '700'
              }}>
                {adminInitials}
              </div>
              <span style={{ fontWeight: '600', color: 'var(--color-heading)' }} className="desktop-only">
                {adminUser?.name || 'Administrator'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Sign out of admin session"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={13} />
              <span className="desktop-only">{isNe ? 'लगआउट' : 'Sign Out'}</span>
            </button>
          </div>
        </header>

        {/* Admin Content Area */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
