import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LogIn, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { getSafeRedirectUrl } from '../utils/url';

export function LoginPage() {
  const { loginStudent, isStudentLoggedIn, isCheckingStudentSession, language } = useApp();
  const isNe = language === 'ne';
  const navigate = useNavigate();
  const location = useLocation();

  // Safely validated redirect destination (defaulting to /dashboard)
  const searchParams = new URLSearchParams(location.search);
  const rawTarget =
    searchParams.get('redirect') ||
    (typeof location.state?.from === 'string'
      ? location.state.from
      : location.state?.from?.pathname
      ? location.state.from.pathname + (location.state.from.search || '')
      : null);
  const redirectTarget = getSafeRedirectUrl(rawTarget, '/dashboard');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already confirmed logged in (and not currently verifying session), send directly to student dashboard
  if (isStudentLoggedIn && !isCheckingStudentSession) {
    return <Navigate to={redirectTarget} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg(isNe ? 'कृपया इमेल र पासवर्ड दुवै भर्नुहोस्।' : 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await loginStudent(email.trim(), password);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      console.error('Student login failed:', err);
      setErrorMsg(err.message || (isNe ? 'लगइन असफल भयो।' : 'Login failed. Please check your credentials.'));
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
          style={{ maxWidth: '460px', width: '100%', margin: '0 auto' }}
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
              <LogIn size={26} color="#356ACB" />
            </m.div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-heading)', marginBottom: 'var(--space-2)', letterSpacing: '-0.02em' }}>
              {isNe ? 'विद्यार्थी लगइन' : 'Student Portal Login'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
              {isNe
                ? 'सोच कलेज अफ आईटीको गुनासो दर्ता तथा अनुगमन ड्यासबोर्डमा प्रवेश गर्नुहोस्।'
                : 'Sign in to lodge IT grievances and track updates from your student dashboard.'}
            </p>
          </div>

          {/* Form Card wrapped in ErrorBoundary */}
          <ErrorBoundary
            title={isNe ? 'लगइन फारम लोड हुन सकेन' : 'Unable to load login form'}
            message={isNe ? 'कृपया पृष्ठ ताजा गर्नुहोस् वा पुन: प्रयास गर्नुहोस्।' : 'An unexpected error occurred. Please refresh or try again.'}
          >
            <div className="auth-cinematic-card">
              {redirectTarget === '/submit' && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#F0FDFA',
                  border: '1px solid #CCFBF1',
                  borderRadius: '8px',
                  color: '#0F766E',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: 'var(--space-4)'
                }}>
                  <CheckCircle2 size={16} />
                  <span>
                    {isNe
                      ? 'उजुरी दर्ता गर्न विद्यार्थी लगइन अनिवार्य छ। लगइनपछि तपाईं फारममा फर्कनुहुनेछ।'
                      : 'Student sign-in is required to submit a complaint. You will return to the submission form.'}
                  </span>
                </div>
              )}

              {errorMsg && (
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
                  <span>{errorMsg}</span>
                </m.div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label htmlFor="login-email" className="form-label" style={{ fontWeight: 600 }}>
                    {isNe ? 'विद्यार्थी इमेल' : 'Email Address'} <span className="required">*</span>
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="e.g. student@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    required
                    autoComplete="email"
                    style={{ borderRadius: '8px', height: '44px' }}
                  />
                </div>

                {/* Password */}
                <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                    <label htmlFor="login-password" className="form-label" style={{ margin: 0, fontWeight: 600 }}>
                      {isNe ? 'पासवर्ड' : 'Password'} <span className="required">*</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      style={{ fontSize: '0.75rem', color: 'var(--color-royal-blue)', textDecoration: 'none', fontWeight: 600 }}
                    >
                      {isNe ? 'पासवर्ड बिर्सनुभयो?' : 'Forgot Password?'}
                    </Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      required
                      autoComplete="current-password"
                      style={{ paddingRight: '42px', borderRadius: '8px', height: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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
                    <span>{isNe ? 'प्रमाणीकरण हुँदैछ...' : 'Authenticating...'}</span>
                  ) : (
                    <>
                      <LogIn size={16} />
                      <span>{isNe ? 'लगइन गर्नुहोस्' : 'Sign In to Student Portal'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Registration link */}
              <div style={{
                marginTop: 'var(--space-6)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--color-border)',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'var(--color-muted)'
              }}>
                <span>{isNe ? 'खाता छैन?' : "Don't have a student account?"} </span>
                <Link
                  to={`/register?redirect=${encodeURIComponent(redirectTarget)}`}
                  style={{ color: 'var(--color-royal-blue)', fontWeight: '600', textDecoration: 'none' }}
                >
                  {isNe ? 'नयाँ खाता खोल्नुहोस्' : 'Register Here'}
                </Link>
              </div>

              {/* Security Notice */}
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

export default LoginPage;
