import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { m, AnimatePresence, useScroll } from 'framer-motion';
import { Menu, X, User, LogIn, LogOut, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { MOTION_EASE } from '../lib/motion';

export function PublicNavbar() {
  const { language, isStudentLoggedIn, studentUser, logoutStudent } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollSection, setScrollSection] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isNe = language === 'ne';

  // Scroll Progress Bar at the top of Navbar (direct hardware-accelerated transform)
  const { scrollYProgress } = useScroll();
  const scaleX = scrollYProgress;

  // Derive active section on homepage immediately on render
  const activeSection = location.pathname === '/'
    ? (scrollSection ?? (
        location.hash === '#categories' ? 'categories' : 
        location.hash === '#process' || location.hash === '#how-it-works' ? 'process' : 
        location.hash === '#faqs' ? 'faqs' :
        location.hash === '#contact' ? 'contact' : 'home'
      ))
    : '';

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

  // Detect scroll offset for navbar styling (transparent -> frosted glass after 20px) and active homepage section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (location.pathname !== '/') {
        return;
      }

      // Offset for sticky header
      const scrollPos = window.scrollY + 180;

      const contactEl = document.getElementById('contact');
      const faqsEl = document.getElementById('faqs');
      const processEl = document.getElementById('process');
      const categoriesEl = document.getElementById('categories');

      if (contactEl && scrollPos >= contactEl.offsetTop) {
        setScrollSection('contact');
      } else if (faqsEl && scrollPos >= faqsEl.offsetTop) {
        setScrollSection('faqs');
      } else if (processEl && scrollPos >= processEl.offsetTop) {
        setScrollSection('process');
      } else if (categoriesEl && scrollPos >= categoriesEl.offsetTop) {
        setScrollSection('categories');
      } else {
        setScrollSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

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

  const isHomeActive = location.pathname === '/' && activeSection === 'home';
  const isCategoriesActive = location.pathname === '/' && activeSection === 'categories';
  const isProcessActive = location.pathname === '/' && activeSection === 'process';
  const isFaqActive = location.pathname === '/' && activeSection === 'faqs';
  const isContactActive = location.pathname === '/' && activeSection === 'contact';
  const isComplaintsActive = location.pathname === '/dashboard' || location.pathname.startsWith('/student/complaints');
  const isProfileActive = location.pathname === '/student/profile';

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : 'at-top'}`}>
      {/* Top Thin Blue Scroll Progress Bar */}
      <m.div
        className="navbar-scroll-progress-line"
        style={{ scaleX, transformOrigin: '0%' }}
        aria-hidden="true"
      />

      <div className="site-header-inner">
        {/* Left: Brand Identity / Home Link */}
        <div className="header-brand-column">
          <Link 
            to="/" 
            className="site-brand-link" 
            aria-label={`${COLLEGE_CONFIG.name} — Home`}
            onClick={() => {
              closeMenu();
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setScrollSection('home');
                if (location.hash) {
                  navigate('/', { replace: true });
                }
              }
            }}
          >
            <BrandLogo 
              size={38} 
              collegeName={COLLEGE_CONFIG.shortName} 
              subtitle={isNe ? 'आईटी सेवा डेस्क' : 'Student IT Desk'} 
            />
          </Link>
        </div>

        {/* Center: Main Navigation Links (Home, Categories, How It Works, FAQ, Contact) */}
        <nav className="header-nav-column" aria-label={isNe ? 'मुख्य नेभिगेसन' : 'Main Navigation'}>
          {/* Home Link */}
          <Link 
            to="/" 
            className={`header-nav-link ${isHomeActive ? 'active' : ''}`}
            aria-current={isHomeActive ? 'page' : undefined}
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setScrollSection('home');
                if (location.hash) {
                  navigate('/', { replace: true });
                }
              }
            }}
          >
            <span>{isNe ? 'गृहपृष्ठ' : 'Home'}</span>
            <span className="nav-hover-line" aria-hidden="true" />
          </Link>

          {/* Categories Link */}
          <a 
            href="/#categories" 
            className={`header-nav-link ${isCategoriesActive ? 'active' : ''}`}
            aria-current={isCategoriesActive ? 'section' : undefined}
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                setScrollSection('categories');
                navigate('/#categories', { replace: true });
              }
            }}
          >
            <span>{isNe ? 'विधाहरू' : 'Categories'}</span>
            <span className="nav-hover-line" aria-hidden="true" />
          </a>

          {/* How It Works Link */}
          <a 
            href="/#process" 
            className={`header-nav-link ${isProcessActive ? 'active' : ''}`}
            aria-current={isProcessActive ? 'section' : undefined}
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
                setScrollSection('process');
                navigate('/#process', { replace: true });
              }
            }}
          >
            <span>{isNe ? 'कार्यप्रणाली' : 'How It Works'}</span>
            <span className="nav-hover-line" aria-hidden="true" />
          </a>

          {/* FAQ Link */}
          <a 
            href="/#faqs" 
            className={`header-nav-link ${isFaqActive ? 'active' : ''}`}
            aria-current={isFaqActive ? 'section' : undefined}
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' });
                setScrollSection('faqs');
                navigate('/#faqs', { replace: true });
              }
            }}
          >
            <span>{isNe ? 'प्रश्नोत्तर' : 'FAQ'}</span>
            <span className="nav-hover-line" aria-hidden="true" />
          </a>

          {/* Contact Link */}
          <a 
            href="/#contact" 
            className={`header-nav-link ${isContactActive ? 'active' : ''}`}
            aria-current={isContactActive ? 'section' : undefined}
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                setScrollSection('contact');
                navigate('/#contact', { replace: true });
              }
            }}
          >
            <span>{isNe ? 'सम्पर्क' : 'Contact'}</span>
            <span className="nav-hover-line" aria-hidden="true" />
          </a>
        </nav>

        {/* Right: Actions (Language Switcher + Student Login or My Complaints / Profile / Logout) */}
        <div className="header-actions-column">
          <LanguageSwitcher />

          {isStudentLoggedIn ? (
            /* Signed In Student Actions */
            <div className="student-account-cluster">
              <Link
                to="/dashboard"
                className={`header-primary-btn ${isComplaintsActive ? 'active' : ''}`}
                title={isNe ? 'मेरो उजुरीहरू' : 'My Complaints'}
              >
                <FileText size={15} aria-hidden="true" />
                <span>{isNe ? 'मेरो उजुरीहरू' : 'My Complaints'}</span>
              </Link>

              <Link
                to="/student/profile"
                className={`header-profile-link ${isProfileActive ? 'active' : ''}`}
                title={studentUser?.name}
                aria-label={studentUser?.name || 'Profile'}
              >
                <User size={15} aria-hidden="true" />
                <span className="student-profile-name">
                  {studentUser?.name ? studentUser.name.split(' ')[0] : 'Profile'}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="header-logout-btn"
                title={isNe ? 'लगआउट गर्नुहोस्' : 'Sign Out'}
                aria-label={isNe ? 'लगआउट गर्नुहोस्' : 'Sign Out'}
              >
                <LogOut size={15} aria-hidden="true" />
              </button>
            </div>
          ) : (
            /* Signed Out: Student Login Button (Primary Action Style) */
            <Link
              to="/login"
              className="header-primary-btn"
            >
              <LogIn size={15} aria-hidden="true" />
              <span>{isNe ? 'विद्यार्थी लगइन' : 'Student Login'}</span>
            </Link>
          )}
        </div>

        {/* Mobile Bar: Compact Language Dropdown + Accessible Menu Toggle */}
        <div className="mobile-actions-bar">
          <LanguageSwitcher />
          <button
            ref={menuToggleRef}
            type="button"
            className="mobile-nav-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? (isNe ? 'मेनु बन्द गर्नुहोस्' : 'Close navigation menu') : (isNe ? 'मेनु खोल्नुहोस्' : 'Open navigation menu')}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Menu Drawer with Smooth Slide-Down Animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <m.div 
              className="mobile-drawer-overlay" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu} 
              aria-hidden="true" 
            />

            <m.div 
              ref={drawerRef}
              id="mobile-nav-drawer"
              className="mobile-nav-drawer open"
              role="dialog"
              aria-modal="true"
              aria-label={isNe ? 'मोबाइल नेभिगेसन मेनु' : 'Mobile navigation drawer'}
              tabIndex="-1"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: MOTION_EASE }}
            >
              <div className="mobile-drawer-header">
                <BrandLogo 
                  size={34} 
                  collegeName={COLLEGE_CONFIG.shortName} 
                  subtitle={isNe ? 'आईटी सेवा डेस्क' : 'Student IT Desk'} 
                />
                <button 
                  ref={closeBtnRef}
                  type="button" 
                  className="mobile-drawer-close-btn" 
                  onClick={closeMenu} 
                  aria-label={isNe ? 'मेनु बन्द गर्नुहोस्' : 'Close menu'}
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="mobile-drawer-links" aria-label={isNe ? 'मोबाइल लिंकहरू' : 'Mobile Links'}>
                <Link 
                  to="/" 
                  className={`mobile-drawer-link ${isHomeActive ? 'active' : ''}`}
                  onClick={() => {
                    closeMenu();
                    if (location.pathname === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setScrollSection('home');
                    }
                  }}
                >
                  <span>{isNe ? 'गृहपृष्ठ' : 'Home'}</span>
                </Link>

                <a 
                  href="/#categories" 
                  className={`mobile-drawer-link ${isCategoriesActive ? 'active' : ''}`}
                  onClick={() => {
                    closeMenu();
                    if (location.pathname === '/') {
                      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                      setScrollSection('categories');
                    }
                  }}
                >
                  <span>{isNe ? 'सेवा विधाहरू' : 'Categories'}</span>
                </a>

                <a 
                  href="/#process" 
                  className={`mobile-drawer-link ${isProcessActive ? 'active' : ''}`}
                  onClick={() => {
                    closeMenu();
                    if (location.pathname === '/') {
                      document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
                      setScrollSection('process');
                    }
                  }}
                >
                  <span>{isNe ? 'समाधान प्रक्रिया' : 'How It Works'}</span>
                </a>

                <a 
                  href="/#faqs" 
                  className={`mobile-drawer-link ${isFaqActive ? 'active' : ''}`}
                  onClick={() => {
                    closeMenu();
                    if (location.pathname === '/') {
                      document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' });
                      setScrollSection('faqs');
                    }
                  }}
                >
                  <span>{isNe ? 'बारम्बार सोधिने प्रश्नहरू' : 'FAQ'}</span>
                </a>

                <a 
                  href="/#contact" 
                  className={`mobile-drawer-link ${isContactActive ? 'active' : ''}`}
                  onClick={() => {
                    closeMenu();
                    if (location.pathname === '/') {
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      setScrollSection('contact');
                    }
                  }}
                >
                  <span>{isNe ? 'कलेज सम्पर्क डेस्क' : 'Contact'}</span>
                </a>

                <Link 
                  to="/track" 
                  className="mobile-drawer-link"
                  onClick={closeMenu}
                >
                  <span>{isNe ? 'उजुरी स्थिति खोज्नुहोस्' : 'Track Status'}</span>
                </Link>

                {isStudentLoggedIn && (
                  <Link 
                    to="/dashboard" 
                    className={`mobile-drawer-link ${isComplaintsActive ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <span>{isNe ? 'मेरो उजुरीहरू (ड्यासबोर्ड)' : 'My Complaints'}</span>
                  </Link>
                )}
              </nav>

              {/* Mobile Drawer Actions */}
              <div className="mobile-drawer-actions">
                {isStudentLoggedIn ? (
                  <>
                    <Link 
                      to="/dashboard"
                      className="btn btn-primary btn-block"
                      onClick={closeMenu}
                      style={{ justifyContent: 'center' }}
                    >
                      <FileText size={16} />
                      <span>{isNe ? 'मेरो उजुरीहरू' : 'My Complaints'}</span>
                    </Link>
                    <Link 
                      to="/student/profile" 
                      className="btn btn-secondary btn-block"
                      onClick={closeMenu}
                      style={{ justifyContent: 'center' }}
                    >
                      <User size={16} />
                      <span>{studentUser?.name || 'Profile'}</span>
                    </Link>
                    <button 
                      type="button" 
                      onClick={handleLogout} 
                      className="btn btn-outline btn-block"
                      style={{ justifyContent: 'center' }}
                    >
                      <LogOut size={16} />
                      <span>{isNe ? 'लगआउट गर्नुहोस्' : 'Sign Out'}</span>
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="btn btn-primary btn-block" 
                    onClick={closeMenu}
                    style={{ justifyContent: 'center' }}
                  >
                    <LogIn size={16} />
                    <span>{isNe ? 'विद्यार्थी लगइन' : 'Student Login'}</span>
                  </Link>
                )}
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default PublicNavbar;
