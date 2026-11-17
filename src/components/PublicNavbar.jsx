import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, PlusCircle, User, LogIn, LogOut, FileText, Search, HelpCircle, PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

export function PublicNavbar() {
  const { language, isStudentLoggedIn, studentUser, logoutStudent } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isNe = language === 'ne';

  // Close mobile menu when location changes
  const [prevLoc, setPrevLoc] = useState(location.pathname + location.hash);
  if (prevLoc !== location.pathname + location.hash) {
    setPrevLoc(location.pathname + location.hash);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }

  const menuToggleRef = useRef(null);
  const closeBtnRef = useRef(null);
  const drawerRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  // Lock body scroll and manage focus when mobile menu opens/closes
  useEffect(() => {
    if (mobileMenuOpen) {
      previouslyFocusedElementRef.current = document.activeElement;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
      };
    } else {
      document.body.style.overflow = '';
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
        previouslyFocusedElementRef.current.focus();
      }
    }
  }, [mobileMenuOpen]);

  // Support Escape key and Focus Trap within mobile drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileMenuOpen(false);
        menuToggleRef.current?.focus();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logoutStudent();
    navigate('/');
  };

  const isTrackActive = location.pathname === '/track';
  const isComplaintsActive = location.pathname === '/dashboard' || location.pathname.startsWith('/student/complaints');
  const isProfileActive = location.pathname === '/student/profile';

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Left: Brand Identity / Home Link */}
        <Link 
          to="/" 
          className="site-brand-link" 
          aria-label={`${COLLEGE_CONFIG.name} — Home`}
          onClick={() => {
            closeMenu();
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <BrandLogo 
            size={34} 
            collegeName={COLLEGE_CONFIG.shortName} 
            subtitle={isNe ? 'आईटी उजुरी तथा सहायता डेस्क' : 'IT Service & Grievance Desk'} 
          />
        </Link>

        {/* Center / Right: Desktop Navigation */}
        <nav className="desktop-nav-wrap" aria-label={isNe ? 'मुख्य नेभिगेसन' : 'Main Navigation'}>
          {/* Essential Public or Authenticated Links */}
          <div className="desktop-nav-links">
            {isStudentLoggedIn ? (
              <Link 
                to="/dashboard" 
                className={`nav-link ${isComplaintsActive ? 'active' : ''}`}
                aria-current={isComplaintsActive ? 'page' : undefined}
              >
                <FileText size={15} aria-hidden="true" />
                <span>{isNe ? 'मेरो उजुरीहरू' : 'My Complaints'}</span>
              </Link>
            ) : (
              <>
                <Link 
                  to="/track" 
                  className={`nav-link ${isTrackActive ? 'active' : ''}`}
                  aria-current={isTrackActive ? 'page' : undefined}
                >
                  <Search size={15} aria-hidden="true" />
                  <span>{isNe ? 'उजुरी ट्र्याक' : 'Track Status'}</span>
                </Link>
                <a href="/#process" className="nav-link">
                  <span>{isNe ? 'प्रक्रिया' : 'Process'}</span>
                </a>
                <a href="/#contact" className="nav-link">
                  <span>{isNe ? 'सम्पर्क' : 'Support'}</span>
                </a>
              </>
            )}
          </div>

          {/* Action Cluster: Language Switcher, Account Entry, Primary CTA */}
          <div className="desktop-actions-cluster">
            <LanguageSwitcher size="sm" />

            {isStudentLoggedIn ? (
              /* Signed In Student Actions */
              <div className="student-account-cluster">
                <Link
                  to="/student/profile"
                  className={`btn btn-secondary btn-sm ${isProfileActive ? 'active' : ''}`}
                  title={studentUser?.name}
                >
                  <User size={14} aria-hidden="true" />
                  <span className="student-profile-name">
                    {studentUser?.name ? studentUser.name.split(' ')[0] : 'Profile'}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm btn-icon-only"
                  title={isNe ? 'लगआउट गर्नुहोस्' : 'Sign Out'}
                  aria-label={isNe ? 'लगआउट गर्नुहोस्' : 'Sign Out'}
                >
                  <LogOut size={14} aria-hidden="true" />
                </button>
              </div>
            ) : (
              /* Signed Out: Single Clear Account Entry Point */
              <Link
                to="/login"
                className="btn btn-secondary btn-sm"
              >
                <LogIn size={14} aria-hidden="true" />
                <span>{isNe ? 'लगइन' : 'Sign In'}</span>
              </Link>
            )}

            {/* Primary Action Button */}
            <Link 
              to={isStudentLoggedIn ? '/submit' : '/login?redirect=/submit'} 
              className="btn btn-primary btn-sm btn-nav-cta"
            >
              <PlusCircle size={15} aria-hidden="true" />
              <span>{isNe ? 'उजुरी दर्ता' : 'Report Issue'}</span>
            </Link>
          </div>
        </nav>

        {/* Mobile Actions: Language Switcher & Hamburger Button */}
        <div className="mobile-actions-bar">
          <LanguageSwitcher size="sm" />
          <button
            ref={menuToggleRef}
            type="button"
            className="mobile-nav-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? (isNe ? 'मेनु बन्द गर्नुहोस्' : 'Close navigation menu') : (isNe ? 'मेनु खोल्नुहोस्' : 'Open navigation menu')}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
          >
            {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-backdrop" onClick={closeMenu} aria-hidden="true" />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div 
        ref={drawerRef}
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={isNe ? 'मोबाइल नेभिगेसन मेनु' : 'Mobile navigation menu'}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-drawer-header">
          <BrandLogo 
            size={28} 
            collegeName={COLLEGE_CONFIG.shortName} 
            subtitle={isNe ? 'आईटी उजुरी डेस्क' : 'IT Helpdesk'} 
          />
          <button
            ref={closeBtnRef}
            type="button"
            className="mobile-drawer-close-btn"
            onClick={closeMenu}
            aria-label={isNe ? 'मेनु बन्द गर्नुहोस्' : 'Close menu'}
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="mobile-drawer-links" aria-label={isNe ? 'मोबाइल मेनु' : 'Mobile Menu'}>
          <Link 
            to="/" 
            className="mobile-drawer-link" 
            onClick={closeMenu}
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <span>{isNe ? 'गृहपृष्ठ' : 'Home'}</span>
          </Link>

          <Link 
            to="/track" 
            className="mobile-drawer-link" 
            onClick={closeMenu}
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <Search size={16} aria-hidden="true" />
            <span>{isNe ? 'उजुरी स्थिति ट्र्याक' : 'Track Issue Status'}</span>
          </Link>

          <a 
            href="/#process" 
            className="mobile-drawer-link" 
            onClick={closeMenu}
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <HelpCircle size={16} aria-hidden="true" />
            <span>{isNe ? 'समाधान प्रक्रिया' : 'Resolution Process'}</span>
          </a>

          <a 
            href="/#contact" 
            className="mobile-drawer-link" 
            onClick={closeMenu}
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <PhoneCall size={16} aria-hidden="true" />
            <span>{isNe ? 'कलेज आईटी सम्पर्क' : 'Campus IT Support'}</span>
          </a>

          <div className="mobile-drawer-divider" />

          {isStudentLoggedIn ? (
            <>
              <Link 
                to="/dashboard" 
                className="mobile-drawer-link" 
                onClick={closeMenu}
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                <FileText size={16} aria-hidden="true" />
                <span>{isNe ? 'मेरो उजुरीहरू' : 'My Complaints'}</span>
              </Link>

              <Link 
                to="/student/profile" 
                className="mobile-drawer-link" 
                onClick={closeMenu}
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                <User size={16} aria-hidden="true" />
                <span>{isNe ? 'विद्यार्थी प्रोफाइल' : 'Student Profile'}</span>
              </Link>

              <button
                type="button"
                className="mobile-drawer-link mobile-drawer-logout"
                onClick={handleLogout}
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                <LogOut size={16} aria-hidden="true" />
                <span>{isNe ? 'लगआउट गर्नुहोस्' : 'Sign Out'}</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="mobile-drawer-link" 
                onClick={closeMenu}
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                <LogIn size={16} aria-hidden="true" />
                <span>{isNe ? 'विद्यार्थी लगइन' : 'Sign In'}</span>
              </Link>

              <Link 
                to="/register" 
                className="mobile-drawer-link" 
                onClick={closeMenu}
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                <span>{isNe ? 'नयाँ खाता दर्ता' : 'Register Account'}</span>
              </Link>
            </>
          )}
        </nav>

        {/* Drawer Bottom CTA */}
        <div className="mobile-drawer-footer">
          <Link 
            to={isStudentLoggedIn ? '/submit' : '/login?redirect=/submit'} 
            className="btn btn-primary btn-md mobile-drawer-cta"
            onClick={closeMenu}
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <PlusCircle size={16} aria-hidden="true" />
            <span>{isNe ? 'नयाँ उजुरी दर्ता' : 'Report an Issue'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;
