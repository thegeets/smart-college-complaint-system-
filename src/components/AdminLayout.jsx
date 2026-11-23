import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ToastContainer } from './ToastContainer';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Search,
  Bell,
  Sun,
  Moon,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export function AdminLayout() {
  const {
    isAdminLoggedIn,
    adminUser,
    logoutAdmin,
    language,
    isCheckingSession,
    fetchReportsSummary
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingBadgeCount, setPendingBadgeCount] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sccs_admin_theme') || 'light';
  });

  const location = useLocation();
  const navigate = useNavigate();
  const isNe = language === 'ne';
  const profileMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Apply dark theme attribute to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sccs_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
    setProfileMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch summary to refresh badge counts
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

  if (isCheckingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          {isNe ? 'सत्र प्रमाणीकरण हुँदैछ...' : 'Verifying administrative session...'}
        </div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <Navigate to="/adminlogin" replace state={{ from: location.pathname }} />;
  }

  const handleLogout = () => {
    logoutAdmin();
    navigate('/adminlogin');
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/admin/complaints?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  // Nav Items
  const navItems = [
    {
      to: '/admin/dashboard',
      label: isNe ? 'ड्यासबोर्ड' : 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/admin/complaints',
      label: isNe ? 'उजुरी व्यवस्थापन' : 'Complaints',
      icon: FileSpreadsheet,
      badge: pendingBadgeCount > 0 ? pendingBadgeCount : null,
    },
    {
      to: '/admin/staff',
      label: isNe ? 'प्राविधिक टोली' : 'Staff & Techs',
      icon: Users,
      badge: null,
    },
    {
      to: '/admin/students',
      label: isNe ? 'विद्यार्थी निर्देशिका' : 'Students',
      icon: GraduationCap,
      badge: null,
    },
    {
      to: '/admin/reports',
      label: isNe ? 'प्रतिवेदन तथा तथ्याङ्क' : 'Reports & Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      to: '/admin/settings',
      label: isNe ? 'प्रणाली सेटिङ्स' : 'Portal Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const adminInitials = adminUser?.name
    ? adminUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD';

  const getBreadcrumbLabel = () => {
    if (location.pathname === '/admin/dashboard') return isNe ? 'ड्यासबोर्ड' : 'Overview';
    if (location.pathname === '/admin/complaints') return isNe ? 'उजुरी सूची' : 'Complaints Queue';
    if (location.pathname.startsWith('/admin/complaints/')) return isNe ? 'उजुरी समीक्षा' : 'Complaint Docket';
    if (location.pathname === '/admin/staff') return isNe ? 'कर्मचारी तथा प्राविधिक' : 'Staff & Technicians';
    if (location.pathname === '/admin/students') return isNe ? 'विद्यार्थी निर्देशिका' : 'Student Registry';
    if (location.pathname === '/admin/reports') return isNe ? 'प्रतिवेदन' : 'Reports';
    if (location.pathname === '/admin/settings') return isNe ? 'सेटिङ्स' : 'Settings';
    return isNe ? 'प्रशासन' : 'Administration';
  };

  return (
    <div className="admin-app-wrapper" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <ToastContainer />

      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}
        style={{
          width: collapsed ? '76px' : '260px',
          backgroundColor: '#101D35',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          userSelect: 'none',
        }}
      >
        {/* Sidebar Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: '18px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {!collapsed ? (
            <BrandLogo size={30} variant="light" subtitle={isNe ? 'प्रशासनिक कन्सोल' : 'Admin Console'} />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#5278C8', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.875rem' }}>
              SC
            </div>
          )}
        </div>

        {/* Profile Card in Sidebar (expanded only) */}
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', margin: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#5278C8', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.875rem', flexShrink: 0 }}>
              {adminInitials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminUser?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <ShieldCheck size={12} color="#60A5FA" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {adminUser?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to));

            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  padding: collapsed ? '12px 0' : '10px 14px',
                  borderRadius: '8px',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: isActive ? 'rgba(82, 120, 200, 0.24)' : 'transparent',
                  border: isActive ? '1px solid rgba(82, 120, 200, 0.4)' : '1px solid transparent',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '700' : '500',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} color={isActive ? '#60A5FA' : '#94A3B8'} />
                  {!collapsed && <span>{item.label}</span>}
                </div>

                {!collapsed && item.badge !== null && (
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '0.6875rem',
                    fontWeight: '800'
                  }}>
                    {item.badge}
                  </span>
                )}

                {collapsed && item.badge !== null && (
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '12px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#DC2626'
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="desktop-only"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '600',
              width: '100%',
              transition: 'background 0.15s ease'
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : (
              <>
                <ChevronLeft size={16} />
                <span>{isNe ? 'साँघुरो बनाउनुहोस्' : 'Collapse Sidebar'}</span>
              </>
            )}
          </button>

          {!collapsed && (
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
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ExternalLink size={13} />
                <span>{isNe ? 'सार्वजनिक गृहपृष्ठ' : 'Public Website'}</span>
              </div>
              <span style={{ fontSize: '0.6875rem' }}>↗</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Drawer (When Mobile Hamburger Clicked) */}
      {mobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(16, 29, 53, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
          }}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            style={{
              width: '82%',
              maxWidth: '320px',
              backgroundColor: '#101D35',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
              color: '#FFF',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <BrandLogo size={28} variant="light" subtitle={isNe ? 'प्रशासनिक कन्सोल' : 'Admin Console'} />
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Bar in Drawer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', margin: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#5278C8', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                {adminInitials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {adminUser?.name || 'Administrator'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{adminUser?.email}</div>
              </div>
            </div>

            {/* Nav list */}
            <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileSidebarOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      backgroundColor: isActive ? 'rgba(82, 120, 200, 0.24)' : 'transparent',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? '700' : '500',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icon size={18} color={isActive ? '#60A5FA' : '#94A3B8'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span style={{ padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#DC2626', color: '#FFF', fontSize: '0.6875rem', fontWeight: '800' }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#F87171',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
                <span>{isNe ? 'लगआउट गर्नुहोस्' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: '70px' }}>
        
        {/* Sticky Topbar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="mobile-only"
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '6px',
                color: 'var(--color-heading)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Toggle navigation"
            >
              <Menu size={18} />
            </button>

            <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', minWidth: 0 }}>
              <Link to="/admin/dashboard" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontWeight: '500' }}>
                Admin
              </Link>
              <ChevronRight size={12} color="var(--color-muted)" />
              <span style={{ fontWeight: '700', color: 'var(--color-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getBreadcrumbLabel()}
              </span>
            </nav>
          </div>

          {/* Center: Global Search Bar */}
          <form
            onSubmit={handleGlobalSearch}
            className="desktop-only"
            style={{ position: 'relative', width: '320px', maxWidth: '100%' }}
          >
            <Search size={15} color="var(--color-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={isNe ? 'उजुरी, विद्यार्थी वा सन्दर्भ खोजी...' : 'Search complaints, roll #, or ref...'}
              className="input-field"
              style={{
                width: '100%',
                height: '36px',
                paddingLeft: '36px',
                paddingRight: '12px',
                fontSize: '0.8125rem',
                backgroundColor: 'var(--color-surface-subtle)',
              }}
            />
          </form>

          {/* Right: Controls & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'dark' ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} color="#475569" />}
            </button>

            {/* Notifications Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="btn btn-secondary btn-sm"
                title="Notifications"
                style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
              >
                <Bell size={16} />
                {pendingBadgeCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#DC2626',
                  }} />
                )}
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '44px',
                    width: '300px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                    zIndex: 50,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: '700', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Notifications</span>
                    <span style={{ fontSize: '0.75rem', color: '#2563EB', cursor: 'pointer' }}>Mark all read</span>
                  </div>
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pendingBadgeCount > 0 ? (
                      <div style={{ padding: '8px 10px', backgroundColor: '#FEF2F2', borderRadius: '6px', fontSize: '0.8125rem', color: '#991B1B', display: 'flex', gap: '8px' }}>
                        <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>{pendingBadgeCount} Pending Review</strong>
                          <div style={{ fontSize: '0.75rem', color: '#B91C1C' }}>New student submissions awaiting triage.</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.8125rem' }}>
                        All queues are up to date!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <LanguageSwitcher size="sm" />

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }} ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#101D35',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  {adminInitials}
                </div>
                <div style={{ textAlign: 'left' }} className="desktop-only">
                  <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--color-heading)', lineHeight: '1.2' }}>
                    {adminUser?.name || 'Administrator'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>
                    {adminUser?.role || 'Admin'}
                  </div>
                </div>
                <ChevronDown size={14} color="var(--color-muted)" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '46px',
                    width: '240px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                    zIndex: 50,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--color-heading)' }}>
                      {adminUser?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      {adminUser?.email}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: '700',
                      backgroundColor: '#EEF2FF',
                      color: '#4338CA'
                    }}>
                      {adminUser?.role || 'Administrator'}
                    </span>
                  </div>

                  <div style={{ padding: '6px' }}>
                    <Link
                      to="/admin/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        color: 'var(--color-heading)',
                        textDecoration: 'none',
                        fontSize: '0.8125rem',
                        fontWeight: '500',
                      }}
                    >
                      <Settings size={15} color="var(--color-muted)" />
                      <span>{isNe ? 'सेटिङ्स' : 'Account & Portal Settings'}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'none',
                        color: '#DC2626',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <LogOut size={15} />
                      <span>{isNe ? 'लगआउट' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
          <Outlet />
        </main>

        {/* Mobile Bottom Tab Bar (4 key sections) */}
        <nav
          className="mobile-only"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '8px 0 calc(8px + env(safe-area-inset-bottom, 0px))',
            zIndex: 40,
            boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
          }}
        >
          {[
            { to: '/admin/dashboard', label: isNe ? 'गृह' : 'Overview', icon: LayoutDashboard },
            { to: '/admin/complaints', label: isNe ? 'उजुरी' : 'Complaints', icon: FileSpreadsheet, badge: pendingBadgeCount > 0 ? pendingBadgeCount : null },
            { to: '/admin/staff', label: isNe ? 'प्राविधिक' : 'Techs', icon: Users },
            { to: '/admin/reports', label: isNe ? 'तथ्याङ्क' : 'Reports', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.to || (tab.to !== '/admin/dashboard' && location.pathname.startsWith(tab.to));

            return (
              <Link
                key={tab.to}
                to={tab.to}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  color: isActive ? 'var(--color-royal-blue)' : 'var(--color-muted)',
                  textDecoration: 'none',
                  fontSize: '0.6875rem',
                  fontWeight: isActive ? '700' : '500',
                  minWidth: '56px',
                  minHeight: '44px',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <Icon size={20} />
                  {tab.badge !== null && tab.badge !== undefined && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-8px',
                      backgroundColor: '#DC2626',
                      color: '#FFF',
                      fontSize: '0.625rem',
                      fontWeight: '800',
                      borderRadius: '9999px',
                      padding: '1px 5px',
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default AdminLayout;
