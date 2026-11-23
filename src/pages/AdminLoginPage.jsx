import React, { useState } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ShieldCheck
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
      const from = location.state?.from || '/admin/dashboard';
      navigate(from, { replace: true });
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
    <div className="auth-cinematic-wrapper">
      {/* Top Header */}
      <header style={{
        padding: 'var(--space-3) var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        zIndex: 10
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <BrandLogo size={36} subtitle={isNe ? 'प्रशासनिक लगइन' : 'Admin Operations Desk'} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <LanguageSwitcher size="sm" />
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            color: 'var(--color-navy)',
            fontSize: '0.8125rem',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <ArrowLeft size={14} />
            <span>{isNe ? 'सार्वजनिक गृहपृष्ठ' : 'Public Site'}</span>
          </Link>
        </div>
      </header>

      {/* Atmospheric Ambient Mesh */}
      <div className="cinematic-hero-bg" aria-hidden="true">
        <div className="hero-mesh-grid" />
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
      </div>

      {/* Main Login Form Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(32px, 6vw, 64px) var(--space-4)',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div 
          style={{ width: '100%', maxWidth: '440px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          
          <div className="auth-cinematic-card">
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <motion.div 
                style={{
                  width: '52px',
                  height: '52px',
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
                <Lock size={24} color="#356ACB" />
              </motion.div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-1)', letterSpacing: '-0.02em' }}>
                {isNe ? 'प्रशासनिक साइन इन' : 'Administration Sign In'}
              </h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
                {COLLEGE_CONFIG.name} — {COLLEGE_CONFIG.deskTitle}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <motion.div 
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
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminSignIn}>
              {/* Email */}
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="adminEmail" className="form-label" style={{ fontWeight: 600 }}>
                  {isNe ? 'प्रशासक इमेल' : 'Administrator Email'} <span className="required">*</span>
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  className="form-input"
                  placeholder="admin@soch.example"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  disabled={isSubmitting}
                  autoComplete="username"
                  required
                  style={{ borderRadius: '8px', height: '44px' }}
                />
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <label htmlFor="adminPassword" className="form-label" style={{ fontWeight: 600 }}>
                  {isNe ? 'पासवर्ड' : 'Password'} <span className="required">*</span>
                </label>
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
                    style={{ paddingRight: '40px', borderRadius: '8px', height: '44px' }}
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
                className="btn btn-primary btn-block"
                disabled={isSubmitting}
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
                {isSubmitting ? (
                  <span>{isNe ? 'प्रमाणीकरण हुँदैछ...' : 'Authenticating...'}</span>
                ) : (
                  <>
                    <span>{isNe ? 'प्रशासनिक साइन इन' : 'Sign In as Administrator'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Strict Session Guarantee */}
            <div style={{
              marginTop: 'var(--space-6)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: 'var(--color-muted)'
            }}>
              <ShieldCheck size={14} color="#5278C8" />
              <span>TLS Enforced &bull; Role-Based Access Audit Logged</span>
            </div>

          </div>

        </motion.div>
      </main>
    </div>
  );
}

export default AdminLoginPage;
