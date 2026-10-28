import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { KeyRound, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export function ResetPasswordPage() {
  const { resetStudentPassword, language } = useApp();
  const isNe = language === 'ne';
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialEmail = searchParams.get('email') || '';
  const initialToken = searchParams.get('token') || '';

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !token.trim() || !newPassword) {
      setErrorMsg(isNe ? 'कृपया सबै विवरण भर्नुहोस्।' : 'Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg(isNe ? 'नयाँ पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।' : 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(isNe ? 'पासवर्डहरू मिलेनन्।' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await resetStudentPassword(email.trim().toLowerCase(), token.trim(), newPassword);
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed.');
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
              <Lock size={26} />
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--color-heading)', marginBottom: 'var(--space-2)' }}>
              {isNe ? 'नयाँ पासवर्ड सेट गर्नुहोस्' : 'Set New Password'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
              {isNe
                ? 'रिसेट कोड र नयाँ पासवर्ड प्रविष्ट गर्नुहोस्।'
                : 'Enter your reset code and choose a new password.'}
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
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="reset-email" className="form-label">
                  {isNe ? 'इमेल' : 'Email Address'} <span className="required">*</span>
                </label>
                <input
                  id="reset-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="reset-token" className="form-label">
                  {isNe ? 'रिसेट कोड' : 'Reset Code'} <span className="required">*</span>
                </label>
                <input
                  id="reset-token"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 642819"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="reset-new-password" className="form-label">
                  {isNe ? 'नयाँ पासवर्ड (कम्तीमा ६ अक्षर)' : 'New Password (min 6 chars)'} <span className="required">*</span>
                </label>
                <input
                  id="reset-new-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <label htmlFor="reset-confirm-password" className="form-label">
                  {isNe ? 'नयाँ पासवर्ड पुनः लेख्नुहोस्' : 'Confirm New Password'} <span className="required">*</span>
                </label>
                <input
                  id="reset-confirm-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>{isNe ? 'अपडेट गरिँदैछ...' : 'Updating password...'}</span>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>{isNe ? 'पासवर्ड परिवर्तन गर्नुहोस्' : 'Reset Password'}</span>
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

export default ResetPasswordPage;
