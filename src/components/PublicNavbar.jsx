import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, PlusCircle, Search, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

export function PublicNavbar() {
  const { language } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
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

      // Check contact section first (lower on page)
      if (contactEl) {
        const cRect = contactEl.getBoundingClientRect();
        if (cRect.top <= 240 && cRect.bottom >= 140) {
          setActiveSection('#contact');
          return;
        }
      }

      // Check process section ("How It Works")
      if (processEl) {
        const pRect = processEl.getBoundingClientRect();
        if (pRect.top <= 240 && pRect.bottom >= 140) {
          setActiveSection('#process');
          return;
        }
      }

      // If near top of page (hero, quick action gateways)
      if (scrollY < 400) {
        setActiveSection('#');
      } else {
        // Intermediate sections (categories, privacy, faqs)
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

  // Determine active states for the 4 main navigation links
  // Exactly one active link at a time, and Home is never highlighted on non-home routes
  const isHomeActive = location.pathname === '/' && activeSection === '#';
  const isProcessActive = location.pathname === '/' && activeSection === '#process';
  const isTrackActive = location.pathname === '/track';
  const isContactActive = location.pathname === '/' && activeSection === '#contact';

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

          {/* Center: Simplified 4 Main Links (Desktop) */}
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
              to="/track" 
              className={`nav-menu-link ${isTrackActive ? 'active' : ''}`}
              onClick={closeMenu}
              aria-current={isTrackActive ? 'page' : undefined}
            >
              <span>{isNe ? 'गुनासोको अवस्था' : 'Track Complaint'}</span>
            </Link>

            <Link 
              to="/#contact" 
              className={`nav-menu-link ${isContactActive ? 'active' : ''}`}
              onClick={(e) => handleAnchorClick(e, '#contact')}
              aria-current={isContactActive ? 'page' : undefined}
            >
              <span>{isNe ? 'सम्पर्क' : 'Contact'}</span>
            </Link>
          </nav>

          {/* Right Action Cluster (Desktop) */}
          <div className="desktop-nav-actions">
            <LanguageSwitcher size="sm" />
            <Link 
              to="/submit" 
              className="btn-nav-cta"
            >
              <PlusCircle size={15} aria-hidden="true" />
              <span>{isNe ? 'उजुरी दर्ता गर्नुहोस्' : 'Submit a Complaint'}</span>
            </Link>
          </div>

          {/* Mobile Bar Right Cluster: Language control + Menu Toggle Button */}
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
            to="/track" 
            className={`mobile-nav-link-item ${isTrackActive ? 'active' : ''}`} 
            onClick={closeMenu}
            aria-current={isTrackActive ? 'page' : undefined}
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <Search size={16} aria-hidden="true" />
            <span>{isNe ? 'गुनासोको अवस्था' : 'Track Complaint'}</span>
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
