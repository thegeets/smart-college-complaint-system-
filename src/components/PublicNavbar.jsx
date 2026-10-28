import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, PlusCircle, User, LogIn, UserPlus, LogOut, FileText, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

export function PublicNavbar() {
  const { language, isStudentLoggedIn, studentUser, logoutStudent } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const isNe = language === 'ne';

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Support Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Handle active indicator on homepage via scroll & hash
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    if (location.hash) {
      setActiveSection(location.hash);
      const targetEl = document.getElementById(location.hash.replace('#', ''));
      if (targetEl) {
        const timer = setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }, 80);
        return () => clearTimeout(timer);
      }
    } else {
      setActiveSection('#');
    }

    const updateActiveOnScroll = () => {
      const scrollY = window.scrollY;
      const processEl = document.getElementById('process');
      const contactEl = document.getElementById('contact');

      if (contactEl) {
        const cRect = contactEl.getBoundingClientRect();
        if (cRect.top <= 240 && cRect.bottom >= 140) {
          setActiveSection('#contact');
          return;
        }
      }

      if (processEl) {
        const pRect = processEl.getBoundingClientRect();
        if (pRect.top <= 240 && pRect.bottom >= 140) {
          setActiveSection('#process');
          return;
        }
      }

      if (scrollY < 400) {
        setActiveSection('#');
      } else {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', updateActiveOnScroll, { passive: true });
    updateActiveOnScroll();

    return () => {
      window.removeEventListener('scroll', updateActiveOnScroll);
    };
  }, [location.pathname, location.hash]);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleHomeClick = (e) => {
    closeMenu();
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
      setActiveSection('#');
    }
  };

  const handleAnchorClick = (e, hash) => {
    closeMenu();
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(hash.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/${hash}`);
        setActiveSection(hash);
      }
    }
  };

  const handleLogout = async () => {
    closeMenu();
    await logoutStudent();
    navigate('/');
  };

  const isHomeActive = location.pathname === '/' && activeSection === '#';
  const isProcessActive = location.pathname === '/' && activeSection === '#process';
  const isContactActive = location.pathname === '/' && activeSection === '#contact';
  const isComplaintsActive = location.pathname.startsWith('/student/complaints');
  const isProfileActive = location.pathname === '/student/profile';

  return (
    <header className="public-header-bar">
      {/* Top Institutional Notification Strip */}
      <div className="top-institutional-strip">
        <div className="top-strip-inner">
          <div className="top-strip-left">
            <span className="top-strip-text">
              {isNe 
                ? 'सोच कलेज अफ आईटी, पोखरा — विद्यार्थी सहायता तथा गुनासो पोर्टल'
                : 'Soch College of IT, Pokhara — Student Grievance & Help Desk'}
            </span>
          </div>
          <div className="top-strip-right">
            <span className="top-strip-hours">
              {isNe ? COLLEGE_CONFIG.contact.officeHoursNe : COLLEGE_CONFIG.contact.officeHours}
            </span>
            <span className="top-strip-divider" aria-hidden="true">•</span>
            <a href={`tel:${COLLEGE_CONFIG.contact.phone}`} className="top-strip-phone" aria-label={`Campus IT Phone ${COLLEGE_CONFIG.contact.phone}`}>
              <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} aria-hidden="true" />
              {COLLEGE_CONFIG.contact.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="main-navbar-container">
        <div className="main-navbar-inner">
          {/* Left: Compact Institutional Branding */}
          <div className="main-navbar-brand">
            <Link 
              to="/" 
              style={{ textDecoration: 'none' }} 
              onClick={handleHomeClick}
              aria-label={COLLEGE_CONFIG.name}
            >
              <BrandLogo 
                size={34} 
                collegeName="Soch College of IT" 
                subtitle={isNe ? 'गुनासो व्यवस्थापन' : 'Complaint Portal'} 
              />
            </Link>
          </div>

          {/* Center: Public Navigation (Home | How It Works | Contact) */}
          <nav className="desktop-nav-menu" aria-label={isNe ? 'मुख्य क्याम्पस नेभिगेसन' : 'Main College Navigation'}>
            <Link 
              to="/" 
              className={`nav-menu-link ${isHomeActive ? 'active' : ''}`}
              onClick={handleHomeClick}
              aria-current={isHomeActive ? 'page' : undefined}
            >
              <span>{isNe ? 'गृहपृष्ठ' : 'Home'}</span>
            </Link>

            <Link 
              to="/#process" 
              className={`nav-menu-link ${isProcessActive ? 'active' : ''}`}
              onClick={(e) => handleAnchorClick(e, '#process')}
              aria-current={isProcessActive ? 'page' : undefined}
            >
              <span>{isNe ? 'प्रक्रिया' : 'How It Works'}</span>
            </Link>

            <Link 
              to="/#contact" 
              className={`nav-menu-link ${isContactActive ? 'active' : ''}`}
              onClick={(e) => handleAnchorClick(e, '#contact')}
              aria-current={isContactActive ? 'page' : undefined}
            >
              <span>{isNe ? 'सम्पर्क' : 'Contact'}</span>
            </Link>

            {/* If logged in, show direct dashboard link */}
            {isStudentLoggedIn && (
              <Link 
                to="/student/complaints" 
                className={`nav-menu-link ${isComplaintsActive ? 'active' : ''}`}
                aria-current={isComplaintsActive ? 'page' : undefined}
              >
                <span>{isNe ? 'मेरो उजुरीहरू' : 'My Complaints'}</span>
              </Link>
            )}
          </nav>

          {/* Right Action Cluster (Desktop) */}
          <div className="desktop-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LanguageSwitcher size="sm" />

            {isStudentLoggedIn ? (
              /* Logged In Actions: Profile/Logout */
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to="/student/profile"
                  className={`btn btn-secondary btn-sm ${isProfileActive ? 'active' : ''}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '36px', fontSize: '0.8125rem' }}
                  title={studentUser?.name}
                >
                  <User size={14} />
                  <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {studentUser?.name ? studentUser.name.split(' ')[0] : 'Profile'}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  style={{ height: '36px', padding: '0 8px', color: '#64748B' }}
                  title={isNe ? 'लगआउट गर्नुहोस्' : 'Sign Out'}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              /* Logged Out Actions: Login | Register */
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link
                  to="/login"
                  className="btn btn-secondary btn-sm"
                  style={{ height: '36px', fontSize: '0.8125rem', padding: '0 12px' }}
                >
                  <LogIn size={14} />
                  <span>{isNe ? 'लगइन' : 'Login'}</span>
                </Link>

                <Link
                  to="/register"
                  className="btn btn-secondary btn-sm"
                  style={{ height: '36px', fontSize: '0.8125rem', padding: '0 12px' }}
                >
                  <UserPlus size={14} />
                  <span>{isNe ? 'दर्ता' : 'Register'}</span>
                </Link>
              </div>
            )}

            {/* Clear Primary CTA: Submit a Complaint */}
            <Link 
              to="/submit" 
              className="btn-nav-cta"
            >
              <PlusCircle size={15} aria-hidden="true" />
              <span>{isNe ? 'उजुरी दर्ता गर्नुहोस्' : 'Submit a Complaint'}</span>
            </Link>
          </div>

          {/* Mobile Bar Right Cluster: Menu Toggle Button */}
          <div className="mobile-bar-actions">
            <LanguageSwitcher size="sm" />
            <button
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
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-backdrop" onClick={closeMenu} aria-hidden="true" />
      )}

      {/* Mobile Navigation Drawer */}
      <div 
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={isNe ? 'मोबाइल नेभिगेसन मेनु' : 'Mobile navigation menu'}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-drawer-header">
          <BrandLogo 
            size={30} 
            collegeName="Soch College of IT" 
            subtitle={isNe ? 'गुनासो व्यवस्थापन' : 'Complaint Portal'} 
          />
          <button
            type="button"
            className="mobile-drawer-close-btn"
            onClick={closeMenu}
            aria-label={isNe ? 'मेनु बन्द गर्नुहोस्' : 'Close menu'}
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Mobile Language Switcher Section */}
        <div className="mobile-drawer-lang-strip">
          <span className="mobile-drawer-lang-label">
            {isNe ? 'भाषा चयन:' : 'Language:'}
          </span>
          <LanguageSwitcher size="sm" />
        </div>

        {/* Mobile Navigation Links */}
        <nav className="mobile-nav-links-list" aria-label={isNe ? 'मोबाइल मेनु' : 'Mobile Menu'}>
          <Link 
            to="/" 
            className={`mobile-nav-link-item ${isHomeActive ? 'active' : ''}`} 
            onClick={handleHomeClick}
            aria-current={isHomeActive ? 'page' : undefined}
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <span>{isNe ? 'गृहपृष्ठ' : 'Home'}</span>
          </Link>
          <Link 
            to="/#process" 
            className={`mobile-nav-link-item ${isProcessActive ? 'active' : ''}`} 
            onClick={(e) => handleAnchorClick(e, '#process')}
            aria-current={isProcessActive ? 'page' : undefined}
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <span>{isNe ? 'प्रक्रिया' : 'How It Works'}</span>
          </Link>
          <Link 
            to="/#contact" 
            className={`mobile-nav-link-item ${isContactActive ? 'active' : ''}`} 
            onClick={(e) => handleAnchorClick(e, '#contact')}
            aria-current={isContactActive ? 'page' : undefined}
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <span>{isNe ? 'सम्पर्क' : 'Contact'}</span>
          </Link>

          {isStudentLoggedIn ? (
            <>
              <Link 
                to="/student/complaints" 
                className={`mobile-nav-link-item ${isComplaintsActive ? 'active' : ''}`} 
                onClick={closeMenu}
                aria-current={isComplaintsActive ? 'page' : undefined}
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                <FileText size={16} aria-hidden="true" />
                <span>{isNe ? 'मेरो उजुरीहरू' : 'My Complaints'}</span>
              </Link>
              <Link 
                to="/student/profile" 
                className={`mobile-nav-link-item ${isProfileActive ? 'active' : ''}`} 
                onClick={closeMenu}
                aria-current={isProfileActive ? 'page' : undefined}
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                <User size={16} aria-hidden="true" />
                <span>{isNe ? 'प्रोफाइल' : 'Profile'}</span>
              </Link>
              <button
                type="button"
                className="mobile-nav-link-item"
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#B91C1C' }}
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
                className="mobile-nav-link-item" 
                onClick={closeMenu}
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                <LogIn size={16} aria-hidden="true" />
                <span>{isNe ? 'विद्यार्थी लगइन' : 'Student Login'}</span>
              </Link>
              <Link 
                to="/register" 
                className="mobile-nav-link-item" 
                onClick={closeMenu}
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                <UserPlus size={16} aria-hidden="true" />
                <span>{isNe ? 'विद्यार्थी दर्ता' : 'Register Account'}</span>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Drawer Complaint CTA */}
        <div className="mobile-drawer-cta-wrap">
          <Link 
            to="/submit" 
            className="btn btn-primary btn-md mobile-drawer-cta-btn"
            onClick={closeMenu}
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <PlusCircle size={16} aria-hidden="true" />
            <span>{isNe ? 'उजुरी दर्ता गर्नुहोस्' : 'Submit a Complaint'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;
