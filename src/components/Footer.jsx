import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { useApp } from '../context/AppContext';

export function Footer() {
  const { getCategoryLabel, categories, language } = useApp();
  const isNe = language === 'ne';

  return (
    <footer className="portal-footer">
      <div className="footer-container">
        {/* Col 1: Institute Profile & Accreditation */}
        <div className="footer-col footer-col-brand">
          <div style={{ marginBottom: '1.25rem' }}>
            <BrandLogo 
              size={40} 
              variant="light" 
              collegeName="Soch College of IT, Pokhara" 
              subtitle={isNe ? 'गुनासो व्यवस्थापन प्रणाली' : 'Complaint Management System'} 
            />
          </div>
          <p className="footer-desc">
            {isNe
              ? 'सोच कलेज अफ आईटी, पोखराका विद्यार्थीहरूका लागि प्राविधिक समस्या दर्ता तथा अनुगमन संयन्त्र। कम्प्युटर ल्याब, इन्टरनेट तथा प्राविधिक उपकरणका समस्याहरूको पारदर्शी समाधान।'
              : 'Student technical grievance and resolution portal for Soch College of IT, Pokhara. Designed for accountable tracking of lab workstations, campus network, and classroom technology.'}
          </p>
          <div style={{ marginTop: '1.25rem' }}>
            <LanguageSwitcher size="sm" />
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div className="footer-col">
          <h4 className="footer-heading">{isNe ? 'पोर्टल नेभिगेसन' : 'Portal Navigation'}</h4>
          <ul className="footer-links">
            <li><Link to="/">{isNe ? 'गृहपृष्ठ' : 'Portal Home'}</Link></li>
            <li><Link to="/submit">{isNe ? 'नयाँ उजुरी दर्ता' : 'Submit a Complaint'}</Link></li>
            <li><Link to="/student/complaints">{isNe ? 'मेरो उजुरीहरू' : 'My Complaints'}</Link></li>
            <li><Link to="/login">{isNe ? 'विद्यार्थी लगइन' : 'Student Login'}</Link></li>
            <li><Link to="/#process">{isNe ? 'समाधान प्रक्रिया' : 'How It Works'}</Link></li>
            <li><Link to="/#faqs">{isNe ? 'प्रश्नोत्तर' : 'Frequently Asked Questions'}</Link></li>
          </ul>
        </div>

        {/* Col 3: Grievance Categories */}
        <div className="footer-col">
          <h4 className="footer-heading">{isNe ? 'स्वीकृत आईटी विधाहरू' : 'IT Categories'}</h4>
          <ul className="footer-links">
            {categories.map((cat) => (
              <li key={cat}>
                <Link to={`/submit?category=${encodeURIComponent(cat)}`}>
                  {getCategoryLabel(cat)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Official Contact & Desk Details */}
        <div className="footer-col">
          <h4 className="footer-heading">{isNe ? 'आधिकारिक सम्पर्क' : 'Campus IT Desk'}</h4>
          <ul className="footer-contact-list">
            <li>
              <MapPin size={15} className="contact-icon" />
              <span>{COLLEGE_CONFIG.name}, {COLLEGE_CONFIG.contact.campusAddress}</span>
            </li>
            <li>
              <Phone size={15} className="contact-icon" />
              <a href={`tel:${COLLEGE_CONFIG.contact.phone}`}>
                {COLLEGE_CONFIG.contact.phone}
              </a>
            </li>
            <li>
              <Mail size={15} className="contact-icon" />
              <a href={`mailto:${COLLEGE_CONFIG.contact.email}`}>
                {COLLEGE_CONFIG.contact.email}
              </a>
            </li>
            <li>
              <Clock size={15} className="contact-icon" />
              <span>{isNe ? COLLEGE_CONFIG.contact.officeHoursNe : COLLEGE_CONFIG.contact.officeHours}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <div className="footer-copyright">
            © {new Date().getFullYear()} {COLLEGE_CONFIG.name}. {isNe ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
          </div>
          <div className="footer-legal-tags">
            <span className="footer-tag">{COLLEGE_CONFIG.name}</span>
            <span className="footer-tag-divider">•</span>
            <span className="footer-tag">
              {COLLEGE_CONFIG.logo.isTemporaryMark 
                ? 'Replaceable Institutional Logo Mark' 
                : 'College Logo'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
