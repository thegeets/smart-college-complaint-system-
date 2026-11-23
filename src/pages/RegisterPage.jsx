import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { m } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import { getSafeRedirectUrl } from '../utils/url';

const SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

export function RegisterPage() {
  const { registerStudent, language } = useApp();
  const isNe = language === 'ne';
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const rawTarget =
    searchParams.get('redirect') ||
    (typeof location.state?.from === 'string'
      ? location.state.from
      : location.state?.from?.pathname
      ? location.state.from.pathname + (location.state.from.search || '')
      : null);
  const redirectTarget = getSafeRedirectUrl(rawTarget, '/dashboard');

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    password: '',
    semester: '1st Semester',
    phone: '',
    avatar: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = isNe ? 'कृपया आफ्नो पूरा नाम लेख्नुहोस्।' : 'Full name must be at least 2 characters.';
    }
    if (!formData.studentId.trim() || formData.studentId.trim().length < 2) {
      errs.studentId = isNe ? 'कृपया कलेज रोल नं वा विद्यार्थी आइडी लेख्नुहोस्।' : 'Student ID or roll number is required.';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = isNe ? 'कृपया मान्य इमेल ठेगाना लेख्नुहोस्।' : 'Please provide a valid email address.';
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = isNe ? 'पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।' : 'Password must be at least 6 characters.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      await registerStudent({
        name: formData.name.trim(),
        studentId: formData.studentId.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        semester: formData.semester,
        phone: formData.phone.trim(),
        avatar: formData.avatar,
      });

      // Account is immediately active; navigate directly to dashboard or intended target
      navigate(redirectTarget || '/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration failed:', err);
      setServerError(err.message || (isNe ? 'दर्ता असफल भयो।' : 'Registration failed.'));
      if (err.errors) setErrors(err.errors);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-cinematic-wrapper">
      <PublicNavbar />

      {/* Atmospheric ambient orbs */}
      <div className="cinematic-hero-bg" aria-hidden="true">
        <div className="hero-mesh-grid" />
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
      </div>

      <main style={{ flex: 1, padding: 'clamp(32px, 6vw, 64px) var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <m.div 
          style={{ maxWidth: '520px', width: '100%', margin: '0 auto' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <m.div 
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#101D35',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-3)',
                boxShadow: '0 8px 16px -4px rgba(82, 120, 200, 0.15)'
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <UserPlus size={26} color="#356ACB" />
            </m.div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-heading)', marginBottom: 'var(--space-2)', letterSpacing: '-0.02em' }}>
              {isNe ? 'विद्यार्थी दर्ता' : 'Create Student Account'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
              {isNe
                ? 'सोच कलेज अफ आईटीको गुनासो दर्ता तथा अनुगमन प्रणालीमा आबद्ध हुनुहोस्।'
                : 'Register with your college details to lodge IT reports and monitor resolution milestones.'}
            </p>
          </div>

          {/* Form Card */}
          <ErrorBoundary
            title={isNe ? 'दर्ता फारम लोड हुन सकेन' : 'Unable to load registration form'}
            message={isNe ? 'कृपया पृष्ठ ताजा गर्नुहोस् वा पुन: प्रयास गर्नुहोस्।' : 'An unexpected error occurred. Please refresh or try again.'}
          >
            <div className="auth-cinematic-card">
              {serverError && (
                <m.div 
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    color: '#B91C1C',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    marginBottom: 'var(--space-4)'
                  }} 
                  role="alert"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{serverError}</span>
                </m.div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label htmlFor="reg-name" className="form-label" style={{ fontWeight: 600 }}>
                    {isNe ? 'पूरा नाम' : 'Full Name'} <span className="required">*</span>
                  </label>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="e.g. Ramesh Adhikari"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ borderRadius: '8px', height: '44px' }}
                  />
                  {errors.name && <span className="form-error" style={{ fontSize: '0.75rem', color: '#B91C1C', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                </div>

                {/* Student ID & Semester Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label htmlFor="reg-id" className="form-label" style={{ fontWeight: 600 }}>
                      {isNe ? 'विद्यार्थी आइडी / रोल' : 'Student ID'} <span className="required">*</span>
                    </label>
                    <input
                      id="reg-id"
                      name="studentId"
                      type="text"
                      autoComplete="off"
                      className={`form-input ${errors.studentId ? 'error' : ''}`}
                      placeholder="e.g. SOCH-2024-012"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      style={{ borderRadius: '8px', height: '44px' }}
                    />
                    {errors.studentId && <span className="form-error" style={{ fontSize: '0.75rem', color: '#B91C1C', marginTop: '4px', display: 'block' }}>{errors.studentId}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-semester" className="form-label" style={{ fontWeight: 600 }}>
                      {isNe ? 'सेमेस्टर' : 'Semester'} <span className="required">*</span>
                    </label>
                    <select
                      id="reg-semester"
                      name="semester"
                      className="form-input"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      style={{ borderRadius: '8px', height: '44px' }}
                    >
                      {SEMESTERS.map((sem) => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Email Address */}
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label htmlFor="reg-email" className="form-label" style={{ fontWeight: 600 }}>
                    {isNe ? 'विद्यार्थी इमेल' : 'Email Address'} <span className="required">*</span>
                  </label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="e.g. ramesh.adhikari@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ borderRadius: '8px', height: '44px' }}
                  />
                  {errors.email && <span className="form-error" style={{ fontSize: '0.75rem', color: '#B91C1C', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                </div>

                {/* Password */}
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label htmlFor="reg-password" className="form-label" style={{ fontWeight: 600 }}>
                    {isNe ? 'पासवर्ड (कम्तीमा ६ अक्षर)' : 'Password (min. 6 characters)'} <span className="required">*</span>
                  </label>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{ borderRadius: '8px', height: '44px' }}
                  />
                  {errors.password && <span className="form-error" style={{ fontSize: '0.75rem', color: '#B91C1C', marginTop: '4px', display: 'block' }}>{errors.password}</span>}
                </div>

                {/* Phone (Optional) */}
                <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                  <label htmlFor="reg-phone" className="form-label" style={{ fontWeight: 600 }}>
                    {isNe ? 'सम्पर्क नम्बर (ऐच्छिक)' : 'Phone Number (Optional)'}
                  </label>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className="form-input"
                    placeholder="e.g. 9800000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ borderRadius: '8px', height: '44px' }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isLoading}
                  style={{
                    height: '46px',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(16, 29, 53, 0.15)'
                  }}
                >
                  {isLoading ? (
                    <span>{isNe ? 'दर्ता हुँदैछ...' : 'Registering Account...'}</span>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>{isNe ? 'खाता सिर्जना गर्नुहोस्' : 'Create Student Account'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div style={{
                marginTop: 'var(--space-6)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--color-border)',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'var(--color-muted)'
              }}>
                <span>{isNe ? 'पहिले नै खाता छ?' : 'Already have a student account?'} </span>
                <Link
                  to={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
                  style={{ color: 'var(--color-royal-blue)', fontWeight: '600', textDecoration: 'none' }}
                >
                  {isNe ? 'यहाँ लगइन गर्नुहोस्' : 'Sign In Here'}
                </Link>
              </div>

              {/* Security Note */}
              <div style={{
                marginTop: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                color: 'var(--color-muted)'
              }}>
                <ShieldCheck size={14} color="#5278C8" />
                <span>Argon2id Encrypted &bull; Student Privacy Protected</span>
              </div>
            </div>
          </ErrorBoundary>

        </m.div>
      </main>

      <Footer />
    </div>
  );
}

export default RegisterPage;
