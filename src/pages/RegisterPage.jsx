import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { UserPlus, AlertCircle, ArrowRight, CheckCircle2, Info, ShieldCheck } from 'lucide-react';

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
  const redirectTarget = searchParams.get('redirect') || '/student/complaints';

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
      const data = await registerStudent({
        name: formData.name.trim(),
        studentId: formData.studentId.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        semester: formData.semester,
        phone: formData.phone.trim(),
        avatar: formData.avatar,
      });

      // Navigate to email verification page with pre-filled email and code
      navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim().toLowerCase())}&token=${encodeURIComponent(data.verificationToken || '')}&redirect=${encodeURIComponent(redirectTarget)}`);
    } catch (err) {
      console.error('Registration failed:', err);
      setServerError(err.message || (isNe ? 'दर्ता असफल भयो।' : 'Registration failed.'));
      if (err.errors) setErrors(err.errors);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PublicNavbar />

      <main style={{ flex: 1, padding: 'var(--space-10) var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '540px', width: '100%', margin: '0 auto' }}>
          
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
              <UserPlus size={26} />
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--color-heading)', marginBottom: 'var(--space-2)' }}>
              {isNe ? 'विद्यार्थी खाता दर्ता' : 'Student Account Registration'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
              {isNe
                ? 'सोच कलेज अफ आईटी, पोखराको अनलाइन गुनासो व्यवस्थापन प्रणालीमा खाता सिर्जना गर्नुहोस्।'
                : 'Create your personal account to lodge campus IT grievances and receive official college replies.'}
            </p>
          </div>

          {/* Form Card */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            
            {/* Verification Disclaimer Notice */}
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
              marginBottom: 'var(--space-6)'
            }}>
              <Info size={16} color="#0D8178" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                {isNe
                  ? 'दर्तापछि इमेल स्वामित्व प्रमाणित गर्न कोड पठाइनेछ। इमेल प्रमाणीकरणले इमेल स्वामित्व मात्र पुष्टि गर्छ; कलेजको सदस्यता प्रशासनिक रूपमा रुजु गरिन्छ।'
                  : 'Students register directly. A verification code confirms email ownership. Note: Email verification confirms email ownership only and does not automatically certify institutional enrollment.'}
              </span>
            </div>

            {serverError && (
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
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name & Student ID Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div className="form-group">
                  <label htmlFor="reg-name" className="form-label">
                    {isNe ? 'पूरा नाम' : 'Full Name'} <span className="required">*</span>
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="e.g. Sujan Poudel"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: null });
                    }}
                    required
                    disabled={isLoading}
                  />
                  {errors.name && <span className="form-error-msg">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="reg-id" className="form-label">
                    {isNe ? 'कलेज रोल नं / आइडी' : 'Student ID / Roll No'} <span className="required">*</span>
                  </label>
                  <input
                    id="reg-id"
                    type="text"
                    className={`form-input ${errors.studentId ? 'error' : ''}`}
                    placeholder="e.g. SOCH-2024-031"
                    value={formData.studentId}
                    onChange={(e) => {
                      setFormData({ ...formData, studentId: e.target.value });
                      if (errors.studentId) setErrors({ ...errors, studentId: null });
                    }}
                    required
                    disabled={isLoading}
                  />
                  {errors.studentId && <span className="form-error-msg">{errors.studentId}</span>}
                </div>
              </div>

              {/* Email */}
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="reg-email" className="form-label">
                  {isNe ? 'इमेल ठेगाना' : 'Email Address'} <span className="required">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="e.g. sujan@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
                {errors.email && <span className="form-error-msg">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="reg-password" className="form-label">
                  {isNe ? 'पासवर्ड (कम्तीमा ६ अक्षर)' : 'Password (min 6 characters)'} <span className="required">*</span>
                </label>
                <input
                  id="reg-password"
                  type="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
                {errors.password && <span className="form-error-msg">{errors.password}</span>}
              </div>

              {/* Semester & Academic Program Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div className="form-group">
                  <label htmlFor="reg-semester" className="form-label">
                    {isNe ? 'सेमेस्टर' : 'Semester'} <span className="required">*</span>
                  </label>
                  <select
                    id="reg-semester"
                    className="form-select"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    disabled={isLoading}
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-program" className="form-label">
                    {isNe ? 'शैक्षिक कार्यक्रम' : 'Program'}
                  </label>
                  <input
                    id="reg-program"
                    type="text"
                    className="form-input"
                    value="BSc CSIT"
                    readOnly
                    disabled
                    style={{ backgroundColor: '#F8FAFC', color: '#475569', cursor: 'default' }}
                  />
                </div>
              </div>

              {/* Optional Phone */}
              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <label htmlFor="reg-phone" className="form-label">
                  {isNe ? 'सम्पर्क फोन (ऐच्छिक)' : 'Contact Phone (Optional)'}
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9800000000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  <span>{isNe ? 'खाता सिर्जना हुँदैछ...' : 'Creating student account...'}</span>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>{isNe ? 'खाता सिर्जना गर्नुहोस्' : 'Register Student Account'}</span>
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
              fontSize: '0.8125rem',
              color: 'var(--color-muted)'
            }}>
              <span>{isNe ? 'पहिले नै खाता छ?' : 'Already have a registered account?'} </span>
              <Link
                to={`/login${redirectTarget !== '/student/complaints' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
                style={{ color: '#0D8178', fontWeight: '700' }}
              >
                {isNe ? 'यहाँ लगइन गर्नुहोस्' : 'Sign In'}
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default RegisterPage;
