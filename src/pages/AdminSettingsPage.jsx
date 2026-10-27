import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export function AdminSettingsPage() {
  const { categories, changeAdminPassword, language } = useApp();
  const isNe = language === 'ne';

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError(isNe ? 'कृपया हालको पासवर्ड लेख्नुहोस्।' : 'Current password is required.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordError(isNe ? 'नयाँ पासवर्ड कम्तीमा ८ अक्षरको हुनुपर्छ।' : 'New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(isNe ? 'नयाँ पासवर्ड र पुष्टि पासवर्ड मिलेन।' : 'New password and confirmation password do not match.');
      return;
    }

    setIsUpdating(true);
    try {
      await changeAdminPassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(err.message || 'Password update failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-1)' }}>
          {isNe ? 'प्रणाली सेटिङ्स तथा सुरक्षा' : 'Portal Parameters & Security Settings'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
          {isNe ? 'संस्थागत विवरण, तोकिएका आईटी विधाहरू र प्रशासक पासवर्ड व्यवस्थापन' : 'Institutional parameters, authorized IT categories, and administrator credential management'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-6)' }}>
        
        {/* Card 1: College Identification */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Building2 size={18} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
              {isNe ? 'संस्थागत विवरण तथा आधिकारिक सम्पर्क' : 'Institutional Profile'}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '2px' }}>
                {isNe ? 'कलेजको नाम' : 'Institution Name:'}
              </span>
              <strong style={{ color: 'var(--color-heading)' }}>{COLLEGE_CONFIG.name}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={15} color="var(--color-teal)" />
              <span>{isNe ? 'शैक्षिक कार्यक्रम: ' : 'Academic Program: '}<strong>{COLLEGE_CONFIG.program}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} color="var(--color-muted)" />
              <span>{COLLEGE_CONFIG.contact.email}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={15} color="var(--color-muted)" />
              <span>{COLLEGE_CONFIG.contact.phone}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={15} color="var(--color-muted)" />
              <span>{COLLEGE_CONFIG.contact.campusAddress}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={15} color="var(--color-muted)" />
              <span>{isNe ? COLLEGE_CONFIG.contact.officeHoursNe : COLLEGE_CONFIG.contact.officeHours}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Authorized IT Categories */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <CheckCircle2 size={18} color="var(--color-teal)" />
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
              {isNe ? 'तोकिएका आईटी समस्याका विधाहरू' : 'Designated IT Categories'}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {categories.map((cat, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-heading)'
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-teal)' }} />
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Protected Change Administrator Password */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <KeyRound size={18} color="#15365D" />
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
              {isNe ? 'प्रशासक पासवर्ड परिवर्तन' : 'Change Admin Password'}
            </h2>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: '1.5', marginBottom: 'var(--space-4)' }}>
            {isNe
              ? 'पासवर्ड परिवर्तन गर्दा हालको पासवर्ड प्रमाणीकरण गरिन्छ र सुरक्षाका लागि पुराना सबै सक्रिय सत्रहरू खारेज हुन्छन्।'
              : 'Verifies current password with Argon2id and invalidates prior sessions for security.'}
          </p>

          {passwordError && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              color: '#B91C1C',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: 'var(--space-3)'
            }}>
              <AlertCircle size={14} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label htmlFor="currentPassword" className="form-label" style={{ fontSize: '0.75rem' }}>
                {isNe ? 'हालको पासवर्ड' : 'Current Password'} <span className="required">*</span>
              </label>
              <input
                id="currentPassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isUpdating}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label htmlFor="newPassword" className="form-label" style={{ fontSize: '0.75rem' }}>
                {isNe ? 'नयाँ पासवर्ड (कम्तीमा ८ अक्षर)' : 'New Password (min 8 chars)'} <span className="required">*</span>
              </label>
              <input
                id="newPassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isUpdating}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="confirmPassword" className="form-label" style={{ fontSize: '0.75rem' }}>
                {isNe ? 'नयाँ पासवर्ड पुष्टि गर्नुहोस्' : 'Confirm New Password'} <span className="required">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isUpdating}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isUpdating}
              style={{ width: '100%' }}
            >
              {isUpdating ? (
                <span>{isNe ? 'अद्यावधिक हुँदैछ...' : 'Updating password...'}</span>
              ) : (
                <span>{isNe ? 'पासवर्ड सुरक्षित गर्नुहोस्' : 'Update Password'}</span>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default AdminSettingsPage;
