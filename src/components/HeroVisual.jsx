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
  ArrowRight
} from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { Link } from 'react-router-dom';

export function HeroVisual() {
  const { language } = useApp();
  const isNe = language === 'ne';
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'contact'

  return (
    <div className="hero-desk-card" aria-label={isNe ? 'कलेज आईटी सेवा कार्यप्रणाली' : 'Campus IT Resolution Workflow'}>
      {/* Visual Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', padding: '16px 20px 0', borderBottom: '1px solid var(--color-border)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('pipeline')}
          style={{
            padding: '8px 14px',
            fontSize: '0.8125rem',
            fontWeight: activeTab === 'pipeline' ? '700' : '500',
            color: activeTab === 'pipeline' ? '#101D35' : '#697586',
            borderBottom: activeTab === 'pipeline' ? '2px solid #5278C8' : '2px solid transparent',
            background: 'transparent',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={14} color={activeTab === 'pipeline' ? '#5278C8' : '#697586'} />
          <span>{isNe ? 'प्रत्यक्ष समाधान प्रणाली' : 'Resolution Pipeline'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          style={{
            padding: '8px 14px',
            fontSize: '0.8125rem',
            fontWeight: activeTab === 'contact' ? '700' : '500',
            color: activeTab === 'contact' ? '#101D35' : '#697586',
            borderBottom: activeTab === 'contact' ? '2px solid #5278C8' : '2px solid transparent',
            background: 'transparent',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Building2 size={14} color={activeTab === 'contact' ? '#5278C8' : '#697586'} />
          <span>{isNe ? 'सहायता डेस्क सम्पर्क' : 'Campus Support Desk'}</span>
        </button>
      </div>

      {activeTab === 'pipeline' ? (
        /* Real-Time Live Triage Pipeline Preview */
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5278C8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isNe ? 'प्रमाणीकृत उजुरी पूर्वावलोकन' : 'Live Triage Lifecycle'}
              </span>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#101D35', margin: '4px 0 2px' }}>
                Lab 2: Workstation #14 Network Drop
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#697586', margin: 0 }}>
                Reference: <code style={{ color: '#203B64', fontWeight: 600 }}>#SCCS-2026-084</code>
              </p>
            </div>
            <span style={{
              background: '#EEF3FB',
              color: '#203B64',
              border: '1px solid #D5E1F7',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {isNe ? 'प्रगतिमा' : 'In Progress'}
            </span>
          </div>

          {/* Stepper Pipeline Visualization */}
          <div style={{ background: '#F8FAFD', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0', marginBottom: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', position: 'relative' }}>
              <div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#101D35', color: '#fff', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={15} />
                </div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#101D35' }}>Submitted</div>
                <div style={{ fontSize: '0.625rem', color: '#697586' }}>10:15 AM</div>
              </div>

              <div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#203B64', color: '#fff', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={14} />
                </div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#203B64' }}>Reviewed</div>
                <div style={{ fontSize: '0.625rem', color: '#697586' }}>10:45 AM</div>
              </div>

              <div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#5278C8', color: '#fff', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px rgba(82,120,200,0.2)' }}>
                  <Wrench size={14} />
                </div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#5278C8' }}>In Progress</div>
                <div style={{ fontSize: '0.625rem', color: '#5278C8', fontWeight: 600 }}>Active</div>
              </div>

              <div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E2E8F0', color: '#697586', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={14} />
                </div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#697586' }}>Resolved</div>
                <div style={{ fontSize: '0.625rem', color: '#697586' }}>Pending</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#697586', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} color="#5278C8" />
              {isNe ? 'औसत सम्बोधन: २४ घण्टा भित्र' : 'Target SLA: Within 24 Hours'}
            </span>
            <Link to="/track" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#5278C8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>{isNe ? 'उजुरी खोजी' : 'Search Any ID'}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      ) : (
        /* Support Desk Facts */
        <div className="hero-desk-body" style={{ padding: '20px' }}>
          <div className="hero-desk-row">
            <MapPin size={16} className="hero-desk-icon" aria-hidden="true" />
            <div>
              <div className="hero-desk-row-label">{isNe ? 'कलेज ठेगाना' : 'Campus Address'}</div>
              <div className="hero-desk-row-val">{COLLEGE_CONFIG.contact.campusAddress}</div>
            </div>
          </div>

          <div className="hero-desk-row">
            <Clock size={16} className="hero-desk-icon" aria-hidden="true" />
            <div>
              <div className="hero-desk-row-label">{isNe ? 'कार्यालय समय' : 'Office Hours'}</div>
              <div className="hero-desk-row-val">{isNe ? COLLEGE_CONFIG.contact.officeHoursNe : COLLEGE_CONFIG.contact.officeHours}</div>
            </div>
          </div>

          <div className="hero-desk-row">
            <Mail size={16} className="hero-desk-icon" aria-hidden="true" />
            <div>
              <div className="hero-desk-row-label">{isNe ? 'इमेल सम्पर्क' : 'Configured Email'}</div>
              <div className="hero-desk-row-val">
                <a href={`mailto:${COLLEGE_CONFIG.contact.email}`} className="hero-desk-link">
                  {COLLEGE_CONFIG.contact.email}
                </a>
              </div>
            </div>
          </div>

          <div className="hero-desk-row">
            <Phone size={16} className="hero-desk-icon" aria-hidden="true" />
            <div>
              <div className="hero-desk-row-label">{isNe ? 'कलेज फोन' : 'Direct Telephone'}</div>
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
      <div className="hero-desk-footer" style={{ borderTop: '1px solid var(--color-border)', padding: '12px 20px', background: '#F8FAFD' }}>
        <ShieldCheck size={14} color="#5278C8" aria-hidden="true" />
        <span style={{ fontSize: '0.75rem', color: '#203B64', fontWeight: 600 }}>
          {isNe
            ? 'सोच कलेज अफ आईटी — आधिकारिक तथा सुरक्षित आईटी पोर्टल'
            : 'Soch College of IT — Official Campus Grievance Desk'}
        </span>
      </div>
    </div>
  );
}

export default HeroVisual;
