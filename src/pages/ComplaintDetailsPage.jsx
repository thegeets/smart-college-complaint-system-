import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { Lock, ArrowRight, KeyRound } from 'lucide-react';

/**
 * ComplaintDetailsPage - Direct URL Access Protection
 * 
 * Enforces requirement:
 * "Students have no accounts, so do not expose complaints through a public list or URL-only lookup.
 * Require both complaint reference and tracking secret to track. Send the secret in a POST request body."
 */
export function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useApp();
  const isNe = language === 'ne';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PublicNavbar />

      <main style={{ flex: 1, padding: 'var(--space-12) var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '540px', width: '100%', textAlign: 'center', padding: 'var(--space-8)' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#EEF4F9',
            color: '#15365D',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-4)'
          }}>
            <Lock size={26} />
          </div>

          <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-heading)', marginBottom: 'var(--space-2)' }}>
            {isNe ? 'गोप्य ट्र्याकिङ कोड आवश्यक' : 'Private Tracking Secret Required'}
          </h1>

          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: 'var(--space-6)' }}>
            {isNe
              ? `विद्यार्थीको गोपनीयता सुरक्षाका लागि केवल सन्दर्भ नम्बर (${id || ''}) बाट मात्र उजुरी हेर्न मिल्दैन। उजुरी दर्ता गर्दा प्राप्त भएको गोप्य ट्र्याकिङ कोड (Tracking Secret) आवश्यक पर्छ।`
              : `To protect student privacy, complaints cannot be accessed via direct URL lookup alone. Both the reference (${id || ''}) and private tracking secret are required.`}
          </p>

          <Link to="/track" className="btn btn-primary btn-md" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={16} />
            <span>{isNe ? 'ट्र्याकिङ पृष्ठमा जानुहोस्' : 'Enter Tracking Secret'}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ComplaintDetailsPage;
