import React, { useState } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/BrandLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Terminal
} from 'lucide-react';

export function AdminLoginPage() {
  const { loginAdmin, isAdminLoggedIn, language } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isNe = language === 'ne';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to admin dashboard
  if (isAdminLoggedIn) {
    const from = location.state?.from || '/admin/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg(isNe ? 'कृपया इमेल प्रविष्ट गर्नुहोस्।' : 'Please enter your administrator email.');
      return;
    }

    if (!password) {
      setErrorMsg(isNe ? 'कृपया पासवर्ड प्रविष्ट गर्नुहोस्।' : 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await loginAdmin(email.trim(), password);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      setErrorMsg(
        err.message || (isNe ? 'इमेल वा पासवर्ड मिलेन। कृपया पुनः जाँच गर्नुहोस्।' : 'Invalid administrator credentials. Please check your email and password.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--color-bg)'
    }}>
      {/* Top Header */}
      <header style={{
        padding: 'var(--space-3) var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)'
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <BrandLogo size={34} subtitle={isNe ? 'प्रशासनिक लगइन' : 'Admin Operations Desk'} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <LanguageSwitcher size="sm" />
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            color: 'var(--color-primary)',
            fontSize: '0.8125rem',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <ArrowLeft size={14} />
            <span>{isNe ? 'सार्वजनिक गृहपृष्ठ' : 'Public Site'}</span>
          </Link>
        </div>
      </header>

      {/* Main Login Form Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8) var(--space-4)'
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                backgroundColor: '#EEF4F9',
                color: '#15365D',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-3)'
              }}>
                <Lock size={22} />
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-1)' }}>
                {isNe ? 'कलेज प्रशासनिक लगइन' : 'Administrator Sign In'}
              </h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
                {COLLEGE_CONFIG.name} — {COLLEGE_CONFIG.deskTitle}
              </p>
            </div>

            {/* Error Message */}
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
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminSignIn}>
              {/* Email */}
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="adminEmail" className="form-label">
                  {isNe ? 'प्रशासक इमेल' : 'Administrator Email'} <span className="required">*</span>
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  className="form-input"
                  placeholder="admin@sochcollege.edu.np"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  disabled={isSubmitting}
                  autoComplete="username"
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                  <label htmlFor="adminPassword" className="form-label" style={{ margin: 0 }}>
                    {isNe ? 'पासवर्ड' : 'Password'} <span className="required">*</span>
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="adminPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    style={{ paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary btn-md"
                disabled={isSubmitting}
                style={{ width: '100%', height: '44px', fontSize: '0.9375rem' }}
              >
                {isSubmitting ? (
                  <span>{isNe ? 'प्रमाणीकरण हुँदैछ...' : 'Authenticating...'}</span>
                ) : (
                  <>
                    <span>{isNe ? 'साइन इन गर्नुहोस्' : 'Sign In as Administrator'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* CLI Account Management Disclosure */}
            <div style={{
              marginTop: 'var(--space-6)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)',
              fontSize: '0.75rem',
              color: '#64748B',
              lineHeight: '1.5'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#0F172A', fontWeight: '600' }}>
                <Terminal size={13} color="#0F766E" />
                <span>{isNe ? 'प्रशासक खाता व्यवस्थापन:' : 'Account Provisioning:'}</span>
              </div>
              <p style={{ margin: 0 }}>
                {isNe
                  ? 'सुरक्षाका लागि सार्वजनिक प्रशासक दर्ता उपलब्ध छैन। नयाँ प्रशासक खाता सिर्जना गर्न कलेज सर्भरमा "npm run create-admin" कमाण्ड प्रयोग गर्नुहोस्।'
                  : 'Public registration is disabled for security. Authorized administrators are provisioned locally via CLI: "npm run create-admin". Passwords are hashed with Argon2id.'}
              </p>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: '0.8125rem' }}>
            <Link to="/" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>
              ← {isNe ? 'सार्वजनिक उजुरी पोर्टलमा फर्कनुहोस्' : 'Return to Student Support Portal'}
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}

export default AdminLoginPage;
