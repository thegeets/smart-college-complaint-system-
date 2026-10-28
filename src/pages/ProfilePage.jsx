import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  User,
  Mail,
  BookOpen,
  Phone,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Link2,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';

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

export function ProfilePage() {
  const {
    isStudentLoggedIn,
    studentUser,
    isCheckingStudentSession,
    updateStudentProfile,
    logoutStudent,
    claimLegacyComplaint,
    language,
    showToast,
  } = useApp();

  const isNe = language === 'ne';
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCheckingStudentSession && !isStudentLoggedIn) {
      navigate('/login?redirect=/student/profile', { replace: true });
    }
  }, [isCheckingStudentSession, isStudentLoggedIn, navigate]);

  const [name, setName] = useState('');
  const [semester, setSemester] = useState('1st Semester');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Claim legacy state
  const [legacyRef, setLegacyRef] = useState('');
  const [legacySecret, setLegacySecret] = useState('');
  const [claimStatus, setClaimStatus] = useState({ error: '', success: '', loading: false });

  useEffect(() => {
    if (studentUser) {
      setName(studentUser.name || '');
      setSemester(studentUser.semester || '1st Semester');
      setPhone(studentUser.phone || '');
    }
  }, [studentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast(isNe ? 'नाम खाली हुन सक्दैन।' : 'Name cannot be empty.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateStudentProfile({
        name: name.trim(),
        semester,
        phone: phone.trim(),
      });
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClaimLegacy = async (e) => {
    e.preventDefault();
    if (!legacyRef.trim() || !legacySecret.trim()) {
      setClaimStatus({ error: isNe ? 'सन्दर्भ कोड र गोप्य ट्र्याकिङ कोड दुवै प्रविष्ट गर्नुहोस्।' : 'Please enter both Reference ID and Tracking Secret.', success: '', loading: false });
      return;
    }

    setClaimStatus({ error: '', success: '', loading: true });

    try {
      await claimLegacyComplaint(legacyRef.trim().toUpperCase(), legacySecret.trim());
      setClaimStatus({ error: '', success: isNe ? 'उजुरी तपाईंको खातामा सफलतापूर्वक लिंक गरियो।' : 'Complaint claimed and linked to your dashboard successfully.', loading: false });
      setLegacyRef('');
      setLegacySecret('');
    } catch (err) {
      setClaimStatus({ error: err.message || 'Failed to link complaint.', success: '', loading: false });
    }
  };

  const handleLogout = async () => {
    await logoutStudent();
    navigate('/');
  };

  if (isCheckingStudentSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
        <p style={{ fontWeight: '600', color: '#15365B' }}>Loading student profile...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PublicNavbar />

      <main style={{ flex: 1, padding: 'var(--space-8) var(--space-4)' }}>
        <div style={{ maxWidth: '780px', width: '100%', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#15365B', margin: '0 0 4px' }}>
                {isNe ? 'विद्यार्थी प्रोफाइल' : 'Student Profile & Settings'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                {isNe
                  ? 'आफ्नो व्यक्तिगत जानकारी, इमेल प्रमाणीकरण र खाता सेटिङहरू व्यवस्थापन गर्नुहोस्।'
                  : 'Manage your contact information, email verification, and account settings.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#B91C1C', borderColor: '#FECACA' }}
            >
              <LogOut size={14} />
              <span>{isNe ? 'लगआउट गर्नुहोस्' : 'Sign Out'}</span>
            </button>
          </div>

          {/* Email Verification Banner */}
          {studentUser && !studentUser.isEmailVerified ? (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={22} color="#DC2626" />
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#991B1B' }}>
                    {isNe ? 'इमेल स्वामित्व प्रमाणित भएको छैन' : 'Email Ownership Not Verified'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#7F1D1D' }}>
                    {isNe ? 'नयाँ उजुरी दर्ता गर्न इमेल प्रमाणीकरण अनिवार्य छ।' : 'Verify your email address to enable lodging grievances.'}
                  </div>
                </div>
              </div>

              <Link
                to={`/verify-email?email=${encodeURIComponent(studentUser.email)}`}
                className="btn btn-sm"
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF', fontWeight: '700' }}
              >
                {isNe ? 'अहिले प्रमाणित गर्नुहोस्' : 'Verify Email'}
              </Link>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#F0FDFA',
              border: '1px solid #CCFBF1',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#0F766E',
              fontSize: '0.875rem'
            }}>
              <CheckCircle2 size={18} />
              <span>
                {isNe
                  ? 'इमेल स्वामित्व सफलतापूर्वक प्रमाणित भइसकेको छ।'
                  : 'Email ownership confirmed. Your student account is fully active.'}
              </span>
            </div>
          )}

          {/* Profile Overview Card */}
          <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#15365B', margin: '0 0 16px' }}>
              {isNe ? 'खाता विवरण' : 'Account Details'}
            </h2>

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="profile-name" className="form-label">
                    {isNe ? 'पूरा नाम' : 'Full Name'} <span className="required">*</span>
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Student ID (Readonly) */}
                <div className="form-group">
                  <label htmlFor="profile-id" className="form-label">
                    {isNe ? 'रोल नं / विद्यार्थी आइडी' : 'Student ID / Roll No'}
                  </label>
                  <input
                    id="profile-id"
                    type="text"
                    className="form-input"
                    value={studentUser?.studentId || ''}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#F8FAFC', color: '#64748B', cursor: 'default' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                {/* Email (Readonly) */}
                <div className="form-group">
                  <label htmlFor="profile-email" className="form-label">
                    {isNe ? 'इमेल' : 'Email Address'}
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    className="form-input"
                    value={studentUser?.email || ''}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#F8FAFC', color: '#64748B', cursor: 'default' }}
                  />
                </div>

                {/* Academic Program */}
                <div className="form-group">
                  <label htmlFor="profile-program" className="form-label">
                    {isNe ? 'कार्यक्रम' : 'Academic Program'}
                  </label>
                  <input
                    id="profile-program"
                    type="text"
                    className="form-input"
                    value={studentUser?.program || 'BSc CSIT'}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#F8FAFC', color: '#64748B', cursor: 'default' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {/* Semester */}
                <div className="form-group">
                  <label htmlFor="profile-semester" className="form-label">
                    {isNe ? 'सेमेस्टर' : 'Current Semester'} <span className="required">*</span>
                  </label>
                  <select
                    id="profile-semester"
                    className="form-select"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Contact Phone */}
                <div className="form-group">
                  <label htmlFor="profile-phone" className="form-label">
                    {isNe ? 'फोन नम्बर' : 'Contact Phone'}
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9800000000"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-md"
                  disabled={isSaving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={16} />
                  <span>{isSaving ? (isNe ? 'सुरक्षित गरिँदैछ...' : 'Saving...') : (isNe ? 'परिवर्तन सुरक्षित गर्नुहोस्' : 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Claim Legacy Guest Complaint Section */}
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Link2 size={18} color="#0D8178" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#15365B', margin: 0 }}>
                {isNe ? 'पुरानो उजुरी खातामा लिंक गर्नुहोस्' : 'Link Previous Guest Complaint'}
              </h2>
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px' }}>
              {isNe
                ? 'यदि तपाईंले पहिले खाता बिना उजुरी दर्ता गर्नुभएको थियो भने, Reference ID र Tracking Secret प्रविष्ट गरी यसलाई आफ्नो ड्यासबोर्डमा सुरक्षित रूपमा जोड्नुहोस्।'
                : 'If you submitted a complaint prior to account creation, link it here using your Complaint Reference ID and Private Tracking Secret.'}
            </p>

            {claimStatus.success && (
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
                marginBottom: '14px'
              }}>
                <CheckCircle2 size={16} />
                <span>{claimStatus.success}</span>
              </div>
            )}

            {claimStatus.error && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                color: '#B91C1C',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px'
              }}>
                <AlertCircle size={16} />
                <span>{claimStatus.error}</span>
              </div>
            )}

            <form onSubmit={handleClaimLegacy}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div className="form-group">
                  <label htmlFor="legacy-ref" className="form-label">
                    {isNe ? 'सन्दर्भ कोड (Reference ID)' : 'Reference ID'}
                  </label>
                  <input
                    id="legacy-ref"
                    type="text"
                    className="form-input"
                    placeholder="e.g. CMP-2026-A8F2K"
                    value={legacyRef}
                    onChange={(e) => setLegacyRef(e.target.value)}
                    style={{ fontFamily: 'monospace', fontWeight: '700' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="legacy-secret" className="form-label">
                    {isNe ? 'गोप्य ट्र्याकिङ कोड (Tracking Secret)' : 'Private Tracking Secret'}
                  </label>
                  <input
                    id="legacy-secret"
                    type="password"
                    className="form-input"
                    placeholder="trk_..."
                    value={legacySecret}
                    onChange={(e) => setLegacySecret(e.target.value)}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm"
                  disabled={claimStatus.loading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Link2 size={14} />
                  <span>{claimStatus.loading ? (isNe ? 'लिंक गरिँदैछ...' : 'Linking...') : (isNe ? 'खातामा जोड्नुहोस्' : 'Link to Account')}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProfilePage;
