import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Wrench,
  Search,
  Sparkles,
  ArrowRight,
  UserCheck,
  Laptop
} from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { Link } from 'react-router-dom';

export function HeroVisual() {
  const { language } = useApp();
  const isNe = language === 'ne';
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'contact'

  return (
    <div className="hero-desk-card" aria-label={isNe ? 'कलेज आईटी सेवा कार्यप्रणाली' : 'Campus IT Resolution Workflow'}>
      {/* Top Segmented Tab Switcher */}
      <div className="hero-desk-tabs-wrap">
        <div className="hero-desk-tabs-segmented">
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`hero-desk-tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
            aria-selected={activeTab === 'pipeline'}
          >
            <Sparkles size={14} className="tab-icon" />
            <span>{isNe ? 'प्रत्यक्ष समाधान प्रणाली' : 'Resolution Pipeline'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`hero-desk-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            aria-selected={activeTab === 'contact'}
          >
            <Building2 size={14} className="tab-icon" />
            <span>{isNe ? 'कलेज डेस्क सम्पर्क' : 'Campus Support Desk'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'pipeline' ? (
        /* Real-Time Live Triage Pipeline Preview */
        <div className="hero-pipeline-body">
          {/* Header row with simulation badge and status chip */}
          <div className="hero-pipeline-header">
            <div>
              <div className="hero-pipeline-eyebrow">
                <span className="live-pulse-dot" aria-hidden="true" />
                <span>{isNe ? 'प्रत्यक्ष उजुरी जीवनचक्र' : 'LIVE TICKET TRIAGE SIMULATION'}</span>
              </div>
              <h3 className="hero-pipeline-case-title">
                Lab 2: Workstation #14 Network Drop
              </h3>
              <div className="hero-pipeline-ref-row">
                <span className="ref-label">{isNe ? 'सन्दर्भ कोड:' : 'Reference:'}</span>
                <code className="ref-code">#SCCS-2026-084</code>
                <span className="ref-category-tag">
                  <Laptop size={12} />
                  <span>Lab Workstations</span>
                </span>
              </div>
            </div>

            <span className="hero-status-pill in-progress">
              <span className="status-indicator-dot" />
              <span>{isNe ? 'प्रगतिमा' : 'In Progress'}</span>
            </span>
          </div>

          {/* Stepper Pipeline Visualization */}
          <div className="hero-stepper-box">
            <div className="hero-stepper-track">
              <div className="hero-stepper-progress-line" style={{ width: '66%' }} />
              
              <div className="hero-stepper-grid">
                {/* Stage 1 */}
                <div className="hero-step-node completed">
                  <div className="step-circle">
                    <CheckCircle2 size={14} />
                  </div>
                  <div className="step-label">{isNe ? 'दर्ता' : 'Submitted'}</div>
                  <div className="step-time">10:15 AM</div>
                </div>

                {/* Stage 2 */}
                <div className="hero-step-node completed">
                  <div className="step-circle">
                    <Search size={13} />
                  </div>
                  <div className="step-label">{isNe ? 'समीक्षा' : 'Reviewed'}</div>
                  <div className="step-time">10:45 AM</div>
                </div>

                {/* Stage 3 */}
                <div className="hero-step-node active">
                  <div className="step-circle">
                    <Wrench size={13} />
                  </div>
                  <div className="step-label">{isNe ? 'प्रगतिमा' : 'In Progress'}</div>
                  <div className="step-time active-badge">{isNe ? 'सक्रिय' : 'Active'}</div>
                </div>

                {/* Stage 4 */}
                <div className="hero-step-node pending">
                  <div className="step-circle">
                    <CheckCircle2 size={13} />
                  </div>
                  <div className="step-label">{isNe ? 'समाधान' : 'Resolved'}</div>
                  <div className="step-time">{isNe ? 'बाँकी' : 'Pending'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Telemetry Card */}
          <div className="hero-telemetry-grid">
            <div className="telemetry-item">
              <span className="telemetry-label">{isNe ? 'खटाइएका प्राविधिक' : 'Assigned Technician'}</span>
              <span className="telemetry-value">
                <UserCheck size={13} className="telemetry-icon" />
                <span>Bikash Sharma (Senior Network Tech)</span>
              </span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">{isNe ? 'स्थान / कोठा' : 'Campus Location'}</span>
              <span className="telemetry-value">
                <MapPin size={13} className="telemetry-icon" />
                <span>Block B, Lab 2 (Row 3, PC-14)</span>
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="hero-pipeline-footer-row">
            <span className="hero-sla-chip">
              <Clock size={13} className="sla-icon" />
              <span>{isNe ? 'औसत सम्बोधन: २४ घण्टा भित्र' : 'Target Desk SLA: < 24 Hours'}</span>
            </span>
            <Link to="/track" className="hero-track-link">
              <span>{isNe ? 'उजुरी खोजी गर्नुहोस्' : 'Search Any Reference ID'}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      ) : (
        /* Support Desk Facts */
        <div className="hero-desk-body">
          <div className="hero-desk-row">
            <div className="hero-desk-icon-box">
              <MapPin size={16} />
            </div>
            <div>
              <div className="hero-desk-row-label">{isNe ? 'कलेज ठेगाना' : 'Campus Location'}</div>
              <div className="hero-desk-row-val">{COLLEGE_CONFIG.contact.campusAddress}</div>
            </div>
          </div>

          <div className="hero-desk-row">
            <div className="hero-desk-icon-box">
              <Clock size={16} />
            </div>
            <div>
              <div className="hero-desk-row-label">{isNe ? 'कार्यालय समय' : 'Desk Operating Hours'}</div>
              <div className="hero-desk-row-val">
                {isNe ? COLLEGE_CONFIG.contact.officeHoursNe : COLLEGE_CONFIG.contact.officeHours}
              </div>
            </div>
          </div>

          <div className="hero-desk-row">
            <div className="hero-desk-icon-box">
              <Mail size={16} />
            </div>
            <div>
              <div className="hero-desk-row-label">{isNe ? 'इमेल सम्पर्क' : 'Official IT Support Email'}</div>
              <div className="hero-desk-row-val">
                <a href={`mailto:${COLLEGE_CONFIG.contact.email}`} className="hero-desk-link">
                  {COLLEGE_CONFIG.contact.email}
                </a>
              </div>
            </div>
          </div>

          <div className="hero-desk-row">
            <div className="hero-desk-icon-box">
              <Phone size={16} />
            </div>
            <div>
              <div className="hero-desk-row-label">{isNe ? 'कलेज फोन' : 'Direct Campus Hotline'}</div>
              <div className="hero-desk-row-val">
                <a href={`tel:${COLLEGE_CONFIG.contact.phone}`} className="hero-desk-link">
                  {COLLEGE_CONFIG.contact.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Footer Institutional Guarantee */}
      <div className="hero-desk-footer">
        <ShieldCheck size={14} className="hero-footer-shield" aria-hidden="true" />
        <span>
          {isNe
            ? 'सोच कलेज अफ आईटी — आधिकारिक तथा सुरक्षित आईटी पोर्टल'
            : 'Soch College of IT — Official Campus Grievance Desk'}
        </span>
      </div>
    </div>
  );
}

export default HeroVisual;
