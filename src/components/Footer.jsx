import React from 'react';
import { Link } from 'react-router-dom';
import { m, useReducedMotion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { useApp } from '../context/AppContext';
import { staggerContainer, fadeUp } from '../lib/motion';

export function Footer() {
  const { getCategoryLabel, categories, language } = useApp();
  const isNe = language === 'ne';
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer className="portal-footer">
      <m.div
        className="footer-container"
        variants={staggerContainer(0.08)}
        initial={shouldReduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {/* Col 1: Institute Profile & Accreditation */}
        <m.div className="footer-col footer-col-brand" variants={fadeUp(0)}>
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
        </m.div>

        {/* Col 2: Navigation Links */}
        <m.div className="footer-col" variants={fadeUp(0.06)}>
          <h4 className="footer-heading">{isNe ? 'पोर्टल नेभिगेसन' : 'Portal Navigation'}</h4>
          <ul className="footer-links">
            <li>
              <Link to="/" className="footer-animated-link">
                <span>{isNe ? 'गृहपृष्ठ' : 'Portal Home'}</span>
              </Link>
            </li>
            <li>
              <Link to="/submit" className="footer-animated-link">
                <span>{isNe ? 'नयाँ उजुरी दर्ता' : 'Submit a Complaint'}</span>
              </Link>
            </li>
            <li>
              <Link to="/student/complaints" className="footer-animated-link">
                <span>{isNe ? 'मेरो उजुरीहरू' : 'My Complaints'}</span>
              </Link>
            </li>
            <li>
              <Link to="/login" className="footer-animated-link">
                <span>{isNe ? 'विद्यार्थी लगइन' : 'Student Login'}</span>
              </Link>
            </li>
            <li>
              <Link to="/#process" className="footer-animated-link">
                <span>{isNe ? 'समाधान प्रक्रिया' : 'How It Works'}</span>
              </Link>
            </li>
            <li>
              <Link to="/#faqs" className="footer-animated-link">
                <span>{isNe ? 'प्रश्नोत्तर' : 'Frequently Asked Questions'}</span>
              </Link>
            </li>
          </ul>
        </m.div>

        {/* Col 3: Grievance Categories */}
        <m.div className="footer-col" variants={fadeUp(0.12)}>
          <h4 className="footer-heading">{isNe ? 'स्वीकृत आईटी विधाहरू' : 'IT Categories'}</h4>
          <ul className="footer-links">
            {categories.map((cat) => (
              <li key={cat}>
                <Link to={`/submit?category=${encodeURIComponent(cat)}`} className="footer-animated-link">
                  <span>{getCategoryLabel(cat)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </m.div>

        {/* Col 4: Official Contact & Desk Details */}
        <m.div className="footer-col" variants={fadeUp(0.18)}>
          <h4 className="footer-heading">{isNe ? 'आधिकारिक सम्पर्क' : 'Campus IT Desk'}</h4>
          <ul className="footer-contact-list">
            <li>
              <MapPin size={15} className="contact-icon" />
              <span>{COLLEGE_CONFIG.name}, {COLLEGE_CONFIG.contact.campusAddress}</span>
            </li>
            <li>
              <Phone size={15} className="contact-icon" />
              <a href={`tel:${COLLEGE_CONFIG.contact.phone}`} className="footer-animated-link">
                <span>{COLLEGE_CONFIG.contact.phone}</span>
              </a>
            </li>
            <li>
              <Mail size={15} className="contact-icon" />
              <a href={`mailto:${COLLEGE_CONFIG.contact.email}`} className="footer-animated-link">
                <span>{COLLEGE_CONFIG.contact.email}</span>
              </a>
            </li>
            <li>
              <Clock size={15} className="contact-icon" />
              <span>{isNe ? COLLEGE_CONFIG.contact.officeHoursNe : COLLEGE_CONFIG.contact.officeHours}</span>
            </li>
          </ul>
        </m.div>
      </m.div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <div className="footer-copyright">
            © {new Date().getFullYear()} {COLLEGE_CONFIG.name}. {isNe ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
          </div>
          <div className="footer-legal-tags">
            <span className="footer-tag">{isNe ? 'आधिकारिक विद्यार्थी पोर्टल' : 'Official Student Portal'}</span>
            <span className="footer-tag-divider">•</span>
            <span className="footer-tag">BSc CSIT Department</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
