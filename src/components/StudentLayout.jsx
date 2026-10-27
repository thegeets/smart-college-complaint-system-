import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DemoBanner } from './DemoBanner';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ToastContainer } from './ToastContainer';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  PlusCircle,
  FileText,
  Bell,
  User,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export function StudentLayout() {
  const { isStudentLoggedIn, currentUser, logoutStudent, notifications, language, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isNe = language === 'ne';

  // Guard: If student is not logged in, redirect to student login
  if (!isStudentLoggedIn) {
    return <Navigate to="/student/login" replace state={{ from: location.pathname }} />;
  }

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    logoutStudent();
    navigate('/');
  };

  const navLinks = [
    { to: '/student/complaints', label: isNe ? 'मेरो गुनासोहरू' : 'My Complaints', icon: FileText },
    { to: '/student/submit', label: isNe ? 'नयाँ गुनासो' : 'Submit Issue', icon: PlusCircle, isAccent: true },
    { to: '/student/notifications', label: isNe ? 'सूचनाहरू' : 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/student/profile', label: isNe ? 'प्रोफाइल' : 'Profile', icon: User },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Top Demo Notice Strip */}
      <DemoBanner />

      {/* Student Top Navigation Bar (Student-friendly, not an admin dashboard layout) */}
      <header className="student-header" style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Logo & Student Portal Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/student/complaints" style={{ textDecoration: 'none' }}>
              <BrandLogo size={36} subtitle={isNe ? 'विद्यार्थी सहायता डेस्क' : 'Student Grievance Portal'} />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="student-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;

              if (link.isAccent) {
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="btn btn-accent btn-sm"
                    style={{ gap: '0.4rem', textDecoration: 'none' }}
                  >
                    <Icon size={14} />
                    <span>{link.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    color: isActive ? 'var(--navy-900)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--sky-50)' : 'transparent',
                    border: isActive ? '1px solid var(--sky-200)' : '1px solid transparent',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={15} color={isActive ? 'var(--sky-600)' : 'currentColor'} />
                  <span>{link.label}</span>
                  {link.badge > 0 && (
                    <span style={{
                      background: 'var(--sky-600)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      borderRadius: '10px',
                      padding: '0.1rem 0.4rem',
                      marginLeft: '0.2rem'
                    }}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Tools: Language + User Pill + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <LanguageSwitcher size="sm" />

            {/* Student Identity Pill */}
            <div className="student-profile-pill" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.65rem',
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: '20px',
              fontSize: '0.8rem'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--sky-600)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: '800'
              }}>
                {currentUser?.name ? currentUser.name.charAt(0) : 'S'}
              </div>
              <span style={{ fontWeight: '700', color: 'var(--navy-900)' }}>
                {currentUser?.name || 'Aarav'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              title={isNe ? 'लगआउट गर्नुहोस्' : 'Sign Out'}
              style={{ padding: '0.35rem 0.6rem' }}
            >
              <LogOut size={13} />
              <span className="desktop-only">{isNe ? 'लगआउट' : 'Sign Out'}</span>
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              className="mobile-only btn btn-outline btn-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{ padding: '0.35rem 0.5rem' }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div style={{
            background: '#ffffff',
            borderTop: '1px solid var(--border-light)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    color: 'var(--navy-900)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    background: location.pathname === link.to ? 'var(--sky-50)' : 'transparent'
                  }}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.5rem 0' }} />
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.65rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.85rem'
              }}
            >
              <ExternalLink size={15} />
              <span>{isNe ? 'सार्वजनिक वेबसाइटमा जानुहोस्' : 'Visit Public Website'}</span>
            </Link>
          </div>
        )}
      </header>

      {/* Main Routed Student Page */}
      <main style={{ flex: 1, padding: '1.75rem 1.25rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>

      {/* Discreet Student Portal Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid var(--border-light)',
        padding: '1rem 1.25rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', gap: '0.75rem' }}>
          <div>
            <strong>{COLLEGE_CONFIG.name}</strong> • {COLLEGE_CONFIG.deskTitle}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/" style={{ color: 'var(--sky-600)', textDecoration: 'none' }}>
              {isNe ? 'सार्वजनिक गृहपृष्ठ' : 'Public Homepage'}
            </Link>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ color: '#94a3b8' }}>
              {isNe ? 'स्थानीय डेमो सत्र' : 'Local Demo Storage'}
            </span>
          </div>
        </div>
      </footer>

      {/* Global Alerts */}
      <ToastContainer />
    </div>
  );
}

export default StudentLayout;
