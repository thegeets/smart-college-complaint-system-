import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  CheckCircle2,
  Clock,
  Search,
  Wrench,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  FileText,
  UserCheck,
  Sparkles
} from 'lucide-react';

export function HeroVisual() {
  const { language, isStudentLoggedIn, studentUser } = useApp();
  const isNe = language === 'ne';

  return (
    <div className="hero-console-preview-card" aria-label={isNe ? 'उजुरी व्यवस्थापन कन्सोल' : 'Complaint Tracking Console'}>
      {/* Console Frame Topbar */}
      <div className="hero-console-topbar">
        <div className="hero-console-dots">
          <span className="dot dot-red" aria-hidden="true" />
          <span className="dot dot-amber" aria-hidden="true" />
          <span className="dot dot-teal" aria-hidden="true" />
          <span className="hero-console-ref">
            {isNe ? 'कलेज उजुरी व्यवस्थापन कन्सोल' : 'OFFICIAL GRIEVANCE PORTAL'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '0.6875rem',
            fontWeight: '700',
            color: '#A7F3D0',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={12} color="#10B981" />
            <span>{isNe ? 'प्रमाणित पोर्टल' : 'Official Portal'}</span>
          </span>
        </div>
      </div>

      {/* Main Console Body */}
      <div className="hero-console-content">
        
        {/* 4-Stage Resolution Pipeline Workflow */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '0.75rem', 
            fontWeight: '700', 
            color: '#15365B', 
            textTransform: 'uppercase', 
            letterSpacing: '0.04em', 
            marginBottom: '8px' 
          }}>
            <span>{isNe ? 'उजुरी समाधानका ४ चरणहरू' : '4-Stage Resolution Process'}</span>
            <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '600' }}>
              {isNe ? 'पारदर्शी प्रक्रिया' : 'Transparent Workflow'}
            </span>
          </div>

          <div className="hero-console-pipeline" style={{ margin: 0, padding: '10px 12px' }}>
            {/* Step 1: Submitted */}
            <div className="pipeline-node completed">
              <div className="node-marker">
                <CheckCircle2 size={13} />
              </div>
              <div className="node-text">
                <span className="node-title">{isNe ? '१. दर्ता' : '1. Submitted'}</span>
                <span className="node-time">{isNe ? 'उजुरी दर्ता' : 'Lodged'}</span>
              </div>
            </div>
            
            <div className="pipeline-connector active" />

            {/* Step 2: Under Review */}
            <div className="pipeline-node current">
              <div className="node-marker">
                <Search size={13} />
              </div>
              <div className="node-text">
                <span className="node-title">{isNe ? '२. समीक्षा' : '2. Review'}</span>
                <span className="node-time">{isNe ? 'छानबिन' : 'Triage'}</span>
              </div>
            </div>

            <div className="pipeline-connector" />

            {/* Step 3: In Progress */}
            <div className="pipeline-node">
              <div className="node-marker">
                <Wrench size={13} />
              </div>
              <div className="node-text">
                <span className="node-title">{isNe ? '३. प्रगति' : '3. In Progress'}</span>
                <span className="node-time">{isNe ? 'मर्मत कार्य' : 'Repair'}</span>
              </div>
            </div>

            <div className="pipeline-connector" />

            {/* Step 4: Resolved */}
            <div className="pipeline-node">
              <div className="node-marker">
                <Clock size={13} />
              </div>
              <div className="node-text">
                <span className="node-title">{isNe ? '४. समाधान' : '4. Resolved'}</span>
                <span className="node-time">{isNe ? 'सम्पन्न' : 'Closed'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Console Action State Card */}
        {isStudentLoggedIn ? (
          /* LOGGED IN STUDENT CARD */
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={16} color="#0D8178" />
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '800', color: '#15365B' }}>
                {isNe ? 'तपाईंको विद्यार्थी ड्यासबोर्ड' : 'Your Student Grievance Dashboard'}
              </h4>
            </div>

            <p style={{ margin: '0 0 14px', fontSize: '0.8125rem', color: '#475569', lineHeight: '1.45' }}>
              {isNe
                ? `स्वागत छ, ${studentUser?.name}! तपाईं आफ्नो दर्ता भएका उजुरीहरू र कलेजका जवाफहरू प्रत्यक्ष अनुगमन गर्न सक्नुहुन्छ।`
                : `Welcome, ${studentUser?.name}! Track your submitted IT issues, inspect official administration replies, or report a new problem.`}
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link
                to="/student/complaints"
                className="btn btn-primary btn-sm"
                style={{ flex: '1 1 140px', height: '38px', justifyContent: 'center', fontSize: '0.8125rem' }}
              >
                <FileText size={14} />
                <span>{isNe ? 'मेरो उजुरीहरू हेर्नुहोस्' : 'Open My Complaints'}</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/submit"
                className="btn btn-secondary btn-sm"
                style={{ height: '38px', padding: '0 12px', fontSize: '0.8125rem' }}
              >
                <span>{isNe ? 'नयाँ उजुरी' : 'New Complaint'}</span>
              </Link>
            </div>
          </div>
        ) : (
          /* LOGGED OUT VISITOR CARD */
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <UserCheck size={16} color="#0D8178" />
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '800', color: '#0F172A' }}>
                {isNe ? 'विद्यार्थी खाता आवश्यक' : 'Student Account Required'}
              </h4>
            </div>

            <p style={{ margin: '0 0 14px', fontSize: '0.8125rem', color: '#475569', lineHeight: '1.45' }}>
              {isNe
                ? 'क्याम्पस ल्याब वा इन्टरनेट समस्या दर्ता गर्न तथा कलेजको जवाफ हेर्न विद्यार्थी खाता अनिवार्य छ। विद्यार्थीहरूले सिधै दर्ता गर्न सक्नुहुन्छ।'
                : 'Sign in with your student account to lodge grievances, view progress timelines, and receive official administration replies.'}
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link
                to="/login"
                className="btn btn-primary btn-sm"
                style={{
                  flex: '1 1 140px',
                  height: '38px',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LogIn size={14} />
                <span>{isNe ? 'ड्यासबोर्ड लगइन' : 'Login to Track'}</span>
              </Link>

              <Link
                to="/register"
                className="btn btn-secondary btn-sm"
                style={{
                  height: '38px',
                  padding: '0 12px',
                  fontSize: '0.8125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <UserPlus size={13} />
                <span>{isNe ? 'खाता दर्ता' : 'Register Account'}</span>
              </Link>
            </div>
          </div>
        )}

        {/* Institutional Policy Notice */}
        <div style={{
          backgroundColor: '#F0FDFA',
          border: '1px solid #CCFBF1',
          borderRadius: '8px',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <ShieldCheck size={15} color="#0D8178" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.75rem', color: '#134E4A', lineHeight: '1.45' }}>
            <strong>{isNe ? 'आधिकारिक समाधान नीति:' : 'Institutional Policy:'} </strong>
            <span>
              {isNe
                ? 'उजुरीहरू कलेज प्राविधिक डेस्कद्वारा सिधै छानबिन र मर्मत गरिन्छ। विद्यार्थी विवरण खाता प्रमाणीकरणद्वारा सुरक्षित रहन्छ।'
                : 'Complaints are triaged and resolved directly by college IT staff. Student privacy and status updates are secured through authenticated sessions.'}
            </span>
          </div>
        </div>

        {/* Console Card Footer */}
        <div className="hero-console-footer">
          <div className="footer-privacy-badge">
            <span>
              {isNe 
                ? 'विद्यार्थी ड्यासबोर्डद्वारा सुरक्षित • वास्तविक समय स्थिति अनुगमन' 
                : 'Authenticated Student Dashboard • Real-time Updates'}
            </span>
          </div>
          <span className="footer-helper-tag">
            {COLLEGE_CONFIG.shortName}
          </span>
        </div>

      </div>
    </div>
  );
}

export default HeroVisual;
