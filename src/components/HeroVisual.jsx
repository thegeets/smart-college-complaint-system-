import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  MapPin,
  Mail,
  ShieldCheck,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

export function HeroVisual() {
  const { language } = useApp();
  const isNe = language === 'ne';

  return (
    <div className="hero-desk-card" aria-label={isNe ? 'कलेज आईटी सेवा जानकारी' : 'Campus IT Service Information'}>
      {/* Top Header */}
      <div className="hero-desk-header">
        <div className="hero-desk-badge">
          <span className="desk-status-indicator" aria-hidden="true" />
          <span>{isNe ? 'सेवा सञ्चालनमा छ' : 'Service Active'}</span>
        </div>
        <h2 className="hero-desk-title">
          {isNe ? 'केन्द्रीय आईटी सेवा डेस्क' : 'Central IT Support Desk'}
        </h2>
        <p className="hero-desk-subtitle">
          {isNe
            ? 'सोच कलेज अफ आईटी — मुख्य शैक्षिक भवन'
            : `${COLLEGE_CONFIG.name} — Main Academic Facility`}
        </p>
      </div>

      {/* Desk Operating Facts */}
      <div className="hero-desk-body">
        <div className="hero-desk-row">
          <Clock size={16} className="hero-desk-icon" aria-hidden="true" />
          <div>
            <div className="hero-desk-row-label">
              {isNe ? 'सञ्चालन समय' : 'Operating Hours'}
            </div>
            <div className="hero-desk-row-val">
              {isNe ? 'आइतबार – शुक्रबार: बिहान ७:०० – साँझ ५:००' : 'Sunday – Friday: 7:00 AM – 5:00 PM'}
            </div>
          </div>
        </div>

        <div className="hero-desk-row">
          <MapPin size={16} className="hero-desk-icon" aria-hidden="true" />
          <div>
            <div className="hero-desk-row-label">
              {isNe ? 'स्थान' : 'Physical Location'}
            </div>
            <div className="hero-desk-row-val">
              {isNe ? 'ब्लक ए, दोस्रो तला (कम्प्युटर ल्याब २ नजिक)' : 'Block A, 2nd Floor (Adjacent to Computer Lab 2)'}
            </div>
          </div>
        </div>

        <div className="hero-desk-row">
          <Mail size={16} className="hero-desk-icon" aria-hidden="true" />
          <div>
            <div className="hero-desk-row-label">
              {isNe ? 'सहयोग इमेल' : 'Desk Email'}
            </div>
            <div className="hero-desk-row-val">
              <a href="mailto:itdesk@sochcollege.edu.np" className="hero-desk-link">
                itdesk@sochcollege.edu.np
              </a>
            </div>
          </div>
        </div>

        <div className="hero-desk-row">
          <CheckCircle2 size={16} className="hero-desk-icon text-teal" aria-hidden="true" />
          <div>
            <div className="hero-desk-row-label">
              {isNe ? 'प्रक्रिया प्रतिबद्धता' : 'Resolution Commitment'}
            </div>
            <div className="hero-desk-row-val">
              {isNe
                ? '२४ कार्यघन्टाभित्र प्रारम्भिक समीक्षा र प्राविधिक असाइनमेन्ट'
                : 'Initial triage & technical review within 24 working hours'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="hero-desk-footer">
        <ShieldCheck size={14} className="text-teal" aria-hidden="true" />
        <span>
          {isNe
            ? 'उजुरी दर्ता गर्न विद्यार्थी लगइन आवश्यक पर्दछ'
            : 'Authenticated student account required to lodge tickets'}
        </span>
      </div>
    </div>
  );
}

export default HeroVisual;
