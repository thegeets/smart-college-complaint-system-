import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
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
  Laptop,
  Check,
  FileText,
} from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { SAMPLE_TICKET } from '../data/sampleTicketData';
import { Link } from 'react-router-dom';
import { MOTION_EASE } from '../lib/motion';

export function HeroVisual() {
  const { language } = useApp();
  const isNe = language === 'ne';
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'contact'

  const cardWrapperRef = useRef(null);
  const isInView = useInView(cardWrapperRef, { margin: '80px' });
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document !== 'undefined' ? !document.hidden : true
  );

  // Page Visibility API tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Interactive simulation stage: 1 = Submitted, 2 = Reviewed, 3 = In Progress, 4 = Resolved
  const [simulatedStage, setSimulatedStage] = useState(3);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);

  // Auto-advance stages every 3s: pauses when user clicks, when off-screen, or when tab is hidden
  useEffect(() => {
    if (
      isAutoPlayPaused ||
      shouldReduceMotion ||
      activeTab !== 'pipeline' ||
      !isInView ||
      !isTabVisible
    ) {
      return;
    }

    const timer = setInterval(() => {
      setSimulatedStage((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 3000);

    return () => clearInterval(timer);
  }, [isAutoPlayPaused, shouldReduceMotion, activeTab, isInView, isTabVisible]);

  const handleStageClick = (stageNum) => {
    setIsAutoPlayPaused(true);
    setSimulatedStage(stageNum);
  };

  const stageProgressMap = {
    1: '0%',
    2: '25%',
    3: '50%',
    4: '75%',
  };

  const currentStageData = SAMPLE_TICKET.stages[simulatedStage - 1];

  // Floating animation definition: pauses when off-screen or tab is hidden
  const shouldFloat = isInView && isTabVisible && !shouldReduceMotion;
  const floatingAnimation = shouldFloat
    ? {
      y: [0, -8, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    }
    : { y: 0 };

  return (
    <m.div
      ref={cardWrapperRef}
      className="hero-desk-card-wrapper"
      initial={shouldReduceMotion ? false : { opacity: 0, x: 40 }}
      animate={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 70, damping: 15, duration: 0.7 }}
    >
      <m.div
        className="hero-desk-card"
        animate={floatingAnimation}
        aria-label={isNe ? 'कलेज आईटी सेवा कार्यप्रणाली' : 'Campus IT Resolution Workflow'}
      >
        {/* Floating decorative badge */}
        <div className="floating-tech-badge badge-top" aria-hidden="true">
          <span className="live-pulse-dot" />
          <span>{isNe ? 'नमुना उजुरी सिमुलेसन' : 'Sample Ticket Demo'}</span>
          {isAutoPlayPaused && (
            <span style={{ fontSize: '0.6875rem', opacity: 0.75, marginLeft: '6px' }}>
              ({isNe ? 'रोकिराखिएको' : 'Paused'})
            </span>
          )}
        </div>

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
              <span>{isNe ? 'समाधान प्रक्रिया डेमो' : 'Sample Ticket Resolution'}</span>
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
          /* Real-Time Live Triage Pipeline Preview with Interactive Scrubber */
          <div className="hero-pipeline-body">
            {/* Header row with simulation badge and status chip */}
            <div className="hero-pipeline-header">
              <div>
                <div className="hero-pipeline-eyebrow">
                  <span className="live-pulse-dot" aria-hidden="true" />
                  <span>{isNe ? 'नमुना उजुरी जीवनचक्र' : 'SAMPLE TICKET LIFECYCLE'}</span>
                </div>
                <h3 className="hero-pipeline-case-title">
                  {isNe ? SAMPLE_TICKET.titleNe : SAMPLE_TICKET.title}
                </h3>
                <div className="hero-pipeline-ref-row">
                  <span className="ref-label">{isNe ? 'सन्दर्भ कोड:' : 'Reference:'}</span>
                  <code className="ref-code">{SAMPLE_TICKET.reference}</code>
                  <span className="ref-category-tag">
                    <Laptop size={12} />
                    <span>{isNe ? SAMPLE_TICKET.categoryLabelNe : SAMPLE_TICKET.categoryLabelEn}</span>
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <m.span
                  key={currentStageData.statusClass}
                  className={`hero-status-pill ${currentStageData.statusClass}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="status-indicator-dot" />
                  <span>{isNe ? currentStageData.statusTextNe : currentStageData.statusTextEn}</span>
                </m.span>
              </AnimatePresence>
            </div>

            {/* Stepper Pipeline Visualization with Interactive Stage Trigger */}
            <div className="hero-stepper-box">
              <div className="hero-stepper-track">
                {/* Smooth Animated Progress Fill Line */}
                <m.div
                  className="hero-stepper-progress-line"
                  animate={{ width: stageProgressMap[simulatedStage] }}
                  transition={{ duration: 0.5, ease: MOTION_EASE }}
                />

                <div className="hero-stepper-grid">
                  {/* Stage 1 */}
                  <button
                    type="button"
                    onClick={() => handleStageClick(1)}
                    className={`hero-step-node ${simulatedStage >= 1
                      ? simulatedStage === 1
                        ? 'active pulsating'
                        : 'completed'
                      : 'pending'
                      }`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    title="Click to preview Stage 1: Submitted"
                    aria-label="Stage 1: Submitted"
                  >
                    <div className="step-circle">
                      {simulatedStage > 1 ? <Check size={14} /> : <FileText size={13} />}
                    </div>
                    <div className="step-label">{isNe ? 'दर्ता' : 'Submitted'}</div>
                    <div className="step-time">10:15 AM</div>
                  </button>

                  {/* Stage 2 */}
                  <button
                    type="button"
                    onClick={() => handleStageClick(2)}
                    className={`hero-step-node ${simulatedStage >= 2
                      ? simulatedStage === 2
                        ? 'active pulsating'
                        : 'completed'
                      : 'pending'
                      }`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    title="Click to preview Stage 2: Reviewed"
                    aria-label="Stage 2: Reviewed"
                  >
                    <div className="step-circle">
                      {simulatedStage > 2 ? <Check size={14} /> : <Search size={13} />}
                    </div>
                    <div className="step-label">{isNe ? 'समीक्षा' : 'Reviewed'}</div>
                    <div className="step-time">10:45 AM</div>
                  </button>

                  {/* Stage 3 */}
                  <button
                    type="button"
                    onClick={() => handleStageClick(3)}
                    className={`hero-step-node ${simulatedStage >= 3
                      ? simulatedStage === 3
                        ? 'active pulsating'
                        : 'completed'
                      : 'pending'
                      }`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    title="Click to preview Stage 3: In Progress"
                    aria-label="Stage 3: In Progress"
                  >
                    <div className="step-circle">
                      {simulatedStage > 3 ? <Check size={14} /> : <Wrench size={13} />}
                    </div>
                    <div className="step-label">{isNe ? 'प्रगतिमा' : 'In Progress'}</div>
                    <div className="step-time active-badge">
                      {simulatedStage === 3 ? (isNe ? 'सक्रिय' : 'Active') : '11:20 AM'}
                    </div>
                  </button>

                  {/* Stage 4 */}
                  <button
                    type="button"
                    onClick={() => handleStageClick(4)}
                    className={`hero-step-node ${simulatedStage === 4 ? 'active pulsating' : 'pending'
                      }`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    title="Click to preview Stage 4: Resolved"
                    aria-label="Stage 4: Resolved"
                  >
                    <div className="step-circle">
                      <CheckCircle2 size={13} />
                    </div>
                    <div className="step-label">{isNe ? 'समाधान' : 'Resolved'}</div>
                    <div className="step-time">
                      {simulatedStage === 4 ? '01:10 PM' : isNe ? 'बाँकी' : 'Pending'}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Action Status Telemetry with Cross-Fade Transition */}
            <div
              style={{
                margin: '14px 0',
                padding: '10px 14px',
                backgroundColor: '#F8FAFD',
                border: '1px solid #D5E1F7',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                color: 'var(--color-navy, #101D35)',
                lineHeight: 1.5,
                minHeight: '58px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <AnimatePresence mode="wait">
                <m.div
                  key={simulatedStage}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.25, ease: MOTION_EASE }}
                  style={{ width: '100%' }}
                >
                  <strong style={{ color: 'var(--color-royal-blue, #356ACB)', marginRight: '6px' }}>
                    {isNe ? 'प्राविधिक कार्य टिप्पणी:' : 'Technician Desk Log:'}
                  </strong>
                  <span>{isNe ? currentStageData.noteNe : currentStageData.noteEn}</span>
                </m.div>
              </AnimatePresence>
            </div>

            {/* Incident Telemetry Card */}
            <div className="hero-telemetry-grid">
              <div className="telemetry-item">
                <span className="telemetry-label">{isNe ? 'खटाइएका प्राविधिक' : 'Assigned Technician'}</span>
                <span className="telemetry-value">
                  <UserCheck size={13} className="telemetry-icon" />
                  <span>{isNe ? currentStageData.techNe : currentStageData.techEn}</span>
                </span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">{isNe ? 'स्थान / कोठा' : 'Campus Location'}</span>
                <span className="telemetry-value">
                  <MapPin size={13} className="telemetry-icon" />
                  <span>{isNe ? SAMPLE_TICKET.locationNe : SAMPLE_TICKET.location}</span>
                </span>
              </div>
            </div>

            {/* Action Row with Unified SLA */}
            <div className="hero-pipeline-footer-row">
              <span className="hero-sla-chip">
                <Clock size={13} className="sla-icon" />
                <span>
                  {isNe
                    ? COLLEGE_CONFIG.contact.targetSlaPhraseNe
                    : COLLEGE_CONFIG.contact.targetSlaPhrase}
                </span>
              </span>
              <Link to="/track" className="hero-track-link">
                <span>{isNe ? 'उजुरी स्थिति ट्र्याक गर्नुहोस्' : 'Track any Reference ID'}</span>
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
      </m.div>
    </m.div>
  );
}

export default HeroVisual;
