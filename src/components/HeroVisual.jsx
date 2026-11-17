import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

export function HeroVisual() {
  const { language } = useApp();
  const isNe = language === 'ne';

  return (
    <div className="hero-desk-card" aria-label={isNe ? 'कलेज सम्पर्क तथा सहायता' : 'College Contact and Support'}>
      {/* Top Header */}
      <div className="hero-desk-header">
        <div className="hero-desk-badge">
          <Building2 size={13} aria-hidden="true" />
          <span>{isNe ? 'कलेज सहायता विवरण' : 'Campus Support Desk'}</span>
        </div>
        <h2 className="hero-desk-title">
          {isNe ? 'आधिकारिक सम्पर्क तथा सहायता' : 'Official Contact & Support'}
        </h2>
        <p className="hero-desk-subtitle">
          {COLLEGE_CONFIG.name}
        </p>
      </div>

      {/* Desk Operating Facts from collegeConfig.js */}
      <div className="hero-desk-body">
        {/* Campus Address */}
        <div className="hero-desk-row">
          <MapPin size={16} className="hero-desk-icon" aria-hidden="true" />
          <div>
            <div className="hero-desk-row-label">
              {isNe ? 'कलेज ठेगाना' : 'Campus Address'}
            </div>
            <div className="hero-desk-row-val">
              {COLLEGE_CONFIG.contact.campusAddress}
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="hero-desk-row">
          <Clock size={16} className="hero-desk-icon" aria-hidden="true" />
          <div>
            <div className="hero-desk-row-label">
              {isNe ? 'कार्यालय समय' : 'Office Hours'}
            </div>
            <div className="hero-desk-row-val">
              {isNe ? COLLEGE_CONFIG.contact.officeHoursNe : COLLEGE_CONFIG.contact.officeHours}
            </div>
          </div>
        </div>

        {/* Official Email */}
        <div className="hero-desk-row">
          <Mail size={16} className="hero-desk-icon" aria-hidden="true" />
          <div>
            <div className="hero-desk-row-label">
              {isNe ? 'इमेल सम्पर्क' : 'Configured Email'}
            </div>
            <div className="hero-desk-row-val">
              <a href={`mailto:${COLLEGE_CONFIG.contact.email}`} className="hero-desk-link">
                {COLLEGE_CONFIG.contact.email}
              </a>
            </div>
          </div>
        </div>

        {/* Direct Telephone */}
        <div className="hero-desk-row">
          <Phone size={16} className="hero-desk-icon" aria-hidden="true" />
          <div>
            <div className="hero-desk-row-label">
              {isNe ? 'कलेज फोन' : 'Direct Telephone'}
            </div>
            <div className="hero-desk-row-val">
              <a href={`tel:${COLLEGE_CONFIG.contact.phone}`} className="hero-desk-link">
                {COLLEGE_CONFIG.contact.phone}
              </a>
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
