import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ToastContainer } from './ToastContainer';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  LayoutDashboard,
  FileSpreadsheet,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

export function AdminLayout() {
  const { isAdminLoggedIn, adminUser, logoutAdmin, language, isCheckingSession } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isNe = language === 'ne';

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
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const adminNav = [
    { to: '/admin/dashboard', label: isNe ? 'ड्यासबोर्ड' : 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/complaints', label: isNe ? 'उजुरी सूची' : 'Complaints Queue', icon: FileSpreadsheet },
    { to: '/admin/reports', label: isNe ? 'प्रतिवेदन तथा तथ्याङ्क' : 'Reports & Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: isNe ? 'प्रणाली सेटिङ्स' : 'Portal Settings', icon: Settings },
  ];

  return (
    <div className="admin-app-wrapper">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Admin Dedicated Sidebar (Desktop) */}
      <aside className="admin-sidebar">
        {/* Sidebar Header */}
        <div className="admin-sidebar-header">
          <BrandLogo size={32} variant="light" subtitle={isNe ? 'प्रशासनिक डेस्क' : 'Admin Operations'} />
        </div>

        {/* Administrator Profile Card */}
        <div style={{
          padding: '10px 14px',
          margin: '10px 12px',
          backgroundColor: '#102A49',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {adminUser?.name || 'College Administrator'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '2px' }}>
            {adminUser?.title || 'System Administrator'}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="admin-sidebar-nav">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to));

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
                {item.badge > 0 && (
                  <span style={{
                    backgroundColor: '#B91C1C',
                    color: '#FFFFFF',
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    padding: '1px 6px',
                    borderRadius: '9999px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Links */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#CBD5E1',
              fontSize: '0.8125rem',
              textDecoration: 'none',
              padding: '6px 8px'
            }}
          >
            <ExternalLink size={14} />
            <span>{isNe ? 'सार्वजनिक वेबसाइट' : 'Public Website'}</span>
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
              fontSize: '0.8125rem',
              fontWeight: '600',
              padding: '6px 8px',
              textAlign: 'left'
            }}
          >
            <LogOut size={14} />
            <span>{isNe ? 'लगआउट' : 'Sign Out'}</span>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
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

            {/* Administrator Profile Card */}
            <div style={{
              padding: '10px 14px',
              margin: '12px 14px 6px',
              backgroundColor: '#102A49',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminUser?.name || 'College Administrator'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '2px' }}>
                {adminUser?.title || 'System Administrator'}
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="admin-sidebar-nav" style={{ padding: '12px 10px' }}>
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to));

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
                  </Link>
                );
              })}
            </nav>

            {/* Footer Links */}
            <div style={{ marginTop: 'auto', padding: '12px 14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Link
                to="/"
                onClick={() => setMobileSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#CBD5E1',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Toggle admin navigation menu"
            >
              <Menu size={18} />
            </button>
            <span className="admin-topbar-title">
              {COLLEGE_CONFIG.name} — {COLLEGE_CONFIG.deskTitle}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageSwitcher size="sm" />
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Sign out of admin session"
            >
              <LogOut size={13} />
              <span>{isNe ? 'लगआउट' : 'Sign Out'}</span>
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
