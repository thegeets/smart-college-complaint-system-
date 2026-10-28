import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { LogIn, AlertCircle, ArrowRight, UserPlus, KeyRound, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const { loginStudent, language, showToast } = useApp();
  const isNe = language === 'ne';
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after login
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || location.state?.from || '/student/complaints';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PublicNavbar />

      <main style={{ flex: 1, padding: 'var(--space-10) var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '460px', width: '100%', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#EEF4F9',
              color: '#15365B',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-3)'
            }}>
              <LogIn size={26} />
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--color-heading)', marginBottom: 'var(--space-2)' }}>
              {isNe ? 'विद्यार्थी लगइन' : 'Student Portal Login'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
              {isNe
                ? 'सोच कलेज अफ आईटीको गुनासो दर्ता तथा अनुगमन ड्यासबोर्डमा प्रवेश गर्नुहोस्।'
                : 'Sign in to lodge IT grievances and track updates from your student dashboard.'}
            </p>
          </div>

          {/* Form Card */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            {redirectTarget === '/submit' && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#F0FDFA',
                border: '1px solid #CCFBF1',
                borderRadius: '6px',
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
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                color: '#B91C1C',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: 'var(--space-4)'
              }} role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="login-email" className="form-label">
                  {isNe ? 'विद्यार्थी इमेल' : 'Email Address'} <span className="required">*</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. student@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label htmlFor="login-password" className="form-label" style={{ margin: 0 }}>
                    {isNe ? 'पासवर्ड' : 'Password'} <span className="required">*</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: '0.75rem', color: '#0D8178', fontWeight: '600' }}
                  >
                    {isNe ? 'पासवर्ड बिर्सनुभयो?' : 'Forgot Password?'}
                  </Link>
                </div>
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-md"
                disabled={isLoading}
                style={{ width: '100%', height: '44px', fontSize: '0.9375rem', marginTop: 'var(--space-2)' }}
              >
                {isLoading ? (
                  <span>{isNe ? 'प्रमाणीकरण गरिँदैछ...' : 'Signing in...'}</span>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>{isNe ? 'लगइन गर्नुहोस्' : 'Sign In to Dashboard'}</span>
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
              fontSize: '0.8125rem',
              color: 'var(--color-muted)'
            }}>
              <span>{isNe ? 'खाता छैन?' : "Don't have a student account yet?"} </span>
              <Link
                to={`/register${redirectTarget !== '/student/complaints' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
                style={{ color: '#0D8178', fontWeight: '700' }}
              >
                {isNe ? 'यहाँ दर्ता गर्नुहोस्' : 'Register Here'}
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LoginPage;
