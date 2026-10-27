import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  LayoutDashboard,
  PlusCircle,
  ListFilter,
  Bell,
  Settings,
  X,
  GraduationCap,
  Search,
  Globe,
  LogOut
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { currentUser, logoutStudent, notifications, language, t } = useApp();
  const navigate = useNavigate();

  const isNe = language === 'ne';
  const unreadNotifs = notifications.filter((n) => n.unread).length;

  const handleSignOut = () => {
    logoutStudent();
    onClose();
    navigate('/');
  };

  const navLinks = [
    { to: '/student', label: t('nav.dashboard', 'Student Dashboard'), icon: LayoutDashboard },
    { to: '/submit', label: t('nav.submitComplaint', 'Submit Complaint'), icon: PlusCircle },
    { to: '/student/complaints', label: t('nav.myComplaints', 'My Complaints'), icon: ListFilter },
    { to: '/track', label: isNe ? 'गुनासोको अवस्था' : t('nav.track', 'Track Complaint'), icon: Search },
    { to: '/notifications', label: t('nav.notifications', 'Notifications'), icon: Bell, badge: unreadNotifs },
    { to: '/profile', label: t('nav.profile', 'Profile & Settings'), icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose} 
          aria-hidden="true" 
        />
      )}

      <aside 
        className={`sidebar-desktop ${isOpen ? 'mobile-open' : ''}`}
        aria-label="Student Navigation Sidebar"
      >
        {/* College Portal Branding */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Link to="/" onClick={onClose} style={{ textDecoration: 'none' }}>
              <BrandLogo size={36} variant="light" subtitle={COLLEGE_CONFIG.deskSubtitle} />
            </Link>
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Current Active Student Indicator */}
        <div className="sidebar-role-indicator" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--sky-500)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.9rem',
              flexShrink: 0
            }}>
              <GraduationCap size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {currentUser.rollNumber} • {currentUser.semester || 'BSc CSIT'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">
            {t('nav.mainMenu', 'Student Menu')}
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/student'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="nav-badge-pill">{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Footer Links */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <Link
              to="/"
              onClick={onClose}
              className="nav-item"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}
            >
              <Globe size={16} />
              <span>{isNe ? 'कलेज गृहपृष्ठ' : 'Public Homepage'}</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="nav-item"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '0.5rem 0.75rem',
                fontSize: '0.8rem',
                color: '#f87171',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}
            >
              <LogOut size={16} />
              <span>{isNe ? 'लगआउट' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
