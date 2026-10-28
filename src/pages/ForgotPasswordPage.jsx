import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export function ForgotPasswordPage() {
  const { forgotStudentPassword, language } = useApp();
  const isNe = language === 'ne';
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg(isNe ? 'कृपया आफ्नो इमेल ठेगाना लेख्नुहोस्।' : 'Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await forgotStudentPassword(email.trim().toLowerCase());
      navigate(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}&token=${encodeURIComponent(data.resetToken || '')}`);
    } catch (err) {
      setErrorMsg(err.message || 'Request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PublicNavbar />

      <main style={{ flex: 1, padding: 'var(--space-10) var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '460px', width: '100%', margin: '0 auto' }}>
          
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
              <KeyRound size={26} />
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--color-heading)', marginBottom: 'var(--space-2)' }}>
              {isNe ? 'पासवर्ड रिसेट' : 'Forgot Password'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
              {isNe
                ? 'आफ्नो दर्ता भएको इमेल लेखी पासवर्ड रिसेट कोड प्राप्त गर्नुहोस्।'
                : 'Enter your registered student email to receive a password reset code.'}
            </p>
          </div>

          <div className="card" style={{ padding: 'var(--space-8)' }}>
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

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <label htmlFor="forgot-email" className="form-label">
                  {isNe ? 'विद्यार्थी इमेल' : 'Registered Email Address'} <span className="required">*</span>
                </label>
                <input
                  id="forgot-email"
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

              <button
                type="submit"
                className="btn btn-primary btn-md"
                disabled={isLoading}
                style={{ width: '100%', height: '44px', fontSize: '0.9375rem' }}
              >
                {isLoading ? (
                  <span>{isNe ? 'कोड पठाउँदै...' : 'Sending code...'}</span>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>{isNe ? 'रिसेट कोड प्राप्त गर्नुहोस्' : 'Send Reset Code'}</span>
                  </>
                )}
              </button>
            </form>

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

export default ForgotPasswordPage;
