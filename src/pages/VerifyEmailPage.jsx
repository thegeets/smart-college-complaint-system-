import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { MailCheck, AlertCircle, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck, Info } from 'lucide-react';

export function VerifyEmailPage() {
  const { verifyStudentEmail, resendStudentVerification, language, showToast } = useApp();
  const isNe = language === 'ne';
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialEmail = searchParams.get('email') || '';
  const initialToken = searchParams.get('token') || '';
  const redirectTarget = searchParams.get('redirect') || '/student/complaints';

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState(initialToken ? (isNe ? 'प्रमाणीकरण कोड स्वचालित रूपमा भरिएको छ।' : 'Verification code loaded from your registration handover.') : '');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email.trim() || !token.trim()) {
      setErrorMsg(isNe ? 'कृपया इमेल र प्रमाणीकरण कोड दुवै प्रविष्ट गर्नुहोस्।' : 'Please enter both email and verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await verifyStudentEmail(email.trim(), token.trim());
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      console.error('Email verification error:', err);
      setErrorMsg(err.message || (isNe ? 'प्रमाणीकरण कोड मिलेन।' : 'Verification failed. Please check your code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setErrorMsg(isNe ? 'कृपया आफ्नो इमेल ठेगाना लेख्नुहोस्।' : 'Please enter your email address to resend code.');
      return;
    }

    setIsResending(true);
    setErrorMsg('');

    try {
      const data = await resendStudentVerification(email.trim());
      if (data.verificationToken) {
        setToken(data.verificationToken);
        setInfoMsg(isNe ? `नयाँ कोड प्राप्त भयो: ${data.verificationToken}` : `New verification code generated: ${data.verificationToken}`);
      } else {
        setInfoMsg(isNe ? 'नयाँ प्रमाणीकरण कोड पठाइयो।' : 'New verification code has been dispatched.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PublicNavbar />

      <main style={{ flex: 1, padding: 'var(--space-10) var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#EEF4F9',
              color: '#0D8178',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-3)'
            }}>
              <MailCheck size={28} />
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--color-heading)', marginBottom: 'var(--space-2)' }}>
              {isNe ? 'इमेल स्वामित्व प्रमाणीकरण' : 'Verify Email Ownership'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
              {isNe
                ? 'उजुरी दर्ता गर्न र कलेजका जवाफहरू प्राप्त गर्न आफ्नो इमेल कोड प्रमाणित गर्नुहोस्।'
                : 'Confirm ownership of your email address to activate your complaint dashboard.'}
            </p>
          </div>

          {/* Verification Card */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            
            {/* Ownership confirmation policy note */}
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: '#475569',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginBottom: 'var(--space-4)'
            }}>
              <Info size={16} color="#0D8178" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                {isNe
                  ? 'यो चरणले तपाईंको इमेल स्वामित्व प्रमाणित गर्दछ। यसले स्वचालित रूपमा संस्थागत सदस्यता प्रमाणपत्र प्रदान गर्दैन।'
                  : 'Email verification confirms email ownership only. It does not certify institutional status or replace college administrative triage.'}
              </span>
            </div>

            {infoMsg && (
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
                <span>{infoMsg}</span>
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

            <form onSubmit={handleVerify}>
              {/* Email */}
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="verify-email" className="form-label">
                  {isNe ? 'दर्ता भएको इमेल' : 'Registered Email Address'} <span className="required">*</span>
                </label>
                <input
                  id="verify-email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. student@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Code */}
              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label htmlFor="verify-token" className="form-label" style={{ margin: 0 }}>
                    {isNe ? '६-अङ्कको प्रमाणीकरण कोड' : '6-Digit Verification Code'} <span className="required">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    style={{ background: 'none', border: 'none', padding: 0, color: '#0D8178', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}
                  >
                    {isResending ? (isNe ? 'पठाउँदै...' : 'Resending...') : (isNe ? 'कोड पुनः पठाउनुहोस्' : 'Resend Code')}
                  </button>
                </div>
                <input
                  id="verify-token"
                  type="text"
                  maxLength={10}
                  className="form-input"
                  placeholder="e.g. 842109"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.1em', textAlign: 'center', fontWeight: '700' }}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-md"
                disabled={isLoading}
                style={{ width: '100%', height: '44px', fontSize: '0.9375rem' }}
              >
                {isLoading ? (
                  <span>{isNe ? 'प्रमाणीकरण गरिँदैछ...' : 'Verifying email...'}</span>
                ) : (
                  <>
                    <MailCheck size={16} />
                    <span>{isNe ? 'इमेल प्रमाणित गर्नुहोस्' : 'Confirm & Proceed to Portal'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Back to login */}
            <div style={{
              marginTop: 'var(--space-6)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
              fontSize: '0.8125rem',
              color: 'var(--color-muted)'
            }}>
              <Link to="/login" style={{ color: 'var(--color-muted)', fontWeight: '600' }}>
                {isNe ? 'लगइन पृष्ठमा फर्कनुहोस्' : 'Back to Login'}
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default VerifyEmailPage;
