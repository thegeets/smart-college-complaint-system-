import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Languages,
  Save,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

export function ProfilePage() {
  const { 
    currentUser, 
    updateStudentProfile,
    language, 
    setLanguage, 
    showToast,
    t 
  } = useApp();

  const isNe = language === 'ne';

  // Local state for editable profile fields
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '061-574096');
  const [semester, setSemester] = useState(currentUser.semester || '4th Semester (Year 2)');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateStudentProfile({
      name,
      email,
      phone,
      semester,
    });
    showToast(isNe ? 'विद्यार्थी विवरण सफलतापूर्वक अपडेट गरियो।' : 'Student profile details updated successfully.', 'success');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--navy-900)' }}>
          {t('profile.pageTitle', 'Student Profile & Settings')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {t('profile.pageSubtitle', 'Manage your student contact information, portal language preference, and notification settings.')}
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--sky-500)',
              boxShadow: 'var(--shadow-md)',
            }}
          />

          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--navy-900)' }}>
                {currentUser.name}
              </h3>
              <span className="badge badge-status-submitted">
                {isNe ? 'विद्यार्थी' : 'Student'}
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.25rem' }}>
              {t('details.rollNumber', 'Roll Number')}: <strong>{currentUser.rollNumber}</strong> | {currentUser.program} ({currentUser.semester || '4th Semester'})
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ID: <code>{currentUser.id}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Profile Information Form */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">{t('profile.personalDetails', 'Personal Contact Details')}</h3>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">{t('profile.fullName', 'Full Display Name')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('profile.collegeEmail', 'College Email Address')}</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('profile.mobileNumber', 'Contact Phone Number')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('login.semesterLabel', 'Current Semester:')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">{t('profile.departmentBranch', 'Academic Program')}</label>
                <input
                  type="text"
                  className="form-input"
                  readOnly
                  disabled
                  value={COLLEGE_CONFIG.program}
                  style={{ backgroundColor: 'var(--bg-subtle)' }}
                />
                <div className="form-hint">{t('profile.programNotice', 'BSc CSIT is the exclusive academic program offered at Soch College of IT.')}</div>
              </div>
            </div>
          </div>

          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              <Save size={14} />
              <span>{t('profile.saveBtn', 'Save Contact Details')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* System Preferences & Language Toggle */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Languages size={18} color="var(--navy-700)" />
            <h3 className="card-title">{t('profile.langTitle', 'Language & Localization')}</h3>
          </div>
        </div>

        <div className="card-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            {t('profile.langSubtitle', 'Select your preferred portal display language. The interface elements and headings will adjust automatically.')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: language === 'en' ? '2px solid var(--navy-800)' : '1px solid var(--border-medium)',
              background: language === 'en' ? 'var(--sky-50)' : '#ffffff',
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="lang"
                value="en"
                checked={language === 'en'}
                onChange={() => setLanguage('en')}
                style={{ accentColor: 'var(--navy-800)' }}
              />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--navy-900)' }}>{t('profile.langEnglish', 'English (Default)')}</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{t('profile.langEnglishSub', 'Official institutional English')}</p>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: language === 'ne' ? '2px solid var(--navy-800)' : '1px solid var(--border-medium)',
              background: language === 'ne' ? 'var(--sky-50)' : '#ffffff',
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="lang"
                value="ne"
                checked={language === 'ne'}
                onChange={() => setLanguage('ne')}
                style={{ accentColor: 'var(--navy-800)' }}
              />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--navy-900)' }}>{t('profile.langNepali', 'नेपाली (Nepali)')}</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{t('profile.langNepaliSub', 'राष्ट्रिय भाषा इन्टरफेस (National Language)')}</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--navy-700)" />
            <h3 className="card-title">{t('profile.alertsTitle', 'Dispatch Alerts & Subscriptions')}</h3>
          </div>
        </div>

        <div className="card-body">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--navy-800)' }}
            />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--navy-900)' }}>
                {t('profile.emailAlerts', 'Email Notifications for Complaint Updates')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('profile.emailAlertsSub', 'Receive instant emails whenever the status of your complaint changes or staff post notes.')}
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={smsNotifs}
              onChange={(e) => setSmsNotifs(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--navy-800)' }}
            />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--navy-900)' }}>
                {t('profile.smsAlerts', 'SMS Broadcast Alerts')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('profile.smsAlertsSub', 'Receive SMS updates on your registered mobile number for urgent notices.')}
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
