import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from './StatusBadge';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  FileCheck,
  Wrench,
  AlertCircle,
  RotateCcw,
  KeyRound,
  Eye,
  EyeOff,
  ExternalLink,
  Calendar
} from 'lucide-react';

/**
 * HeroVisual Component
 * 
 * An authentic, fully functional complaint-tracking console for the hero section.
 * Reflects the 4-stage institutional complaint lifecycle:
 * 1. Submitted → 2. Under Review → 3. In Progress → 4. Resolved
 * 
 * Implements polished states:
 * - Ready / Empty input state
 * - Loading query state
 * - Invalid-reference / missing credentials warning state
 * - Network-error / Not-found state
 * - Successful authenticated result state
 * 
 * Protected by student tracking secret. Never exposes unauthenticated complaints.
 */
export function HeroVisual() {
  const { language, trackComplaint, getCategoryLabel } = useApp();
  const isNe = language === 'ne';
  const navigate = useNavigate();

  // Form input state
  const [referenceInput, setReferenceInput] = useState('');
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // Console query state: 'idle' | 'loading' | 'error' | 'success'
  const [consoleState, setConsoleState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [trackedResult, setTrackedResult] = useState(null);

  // Status mapping to 4 stages (0: Submitted, 1: Under Review, 2: In Progress, 3: Resolved)
  const getStageIndex = (status) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'In Progress': return 2;
      case 'Resolved': return 3;
      default: return 0;
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    const cleanRef = referenceInput.trim().toUpperCase();
    const cleanSecret = secretInput.trim();

    if (!cleanRef) {
      setConsoleState('error');
      setErrorMessage(
        isNe 
          ? 'कृपया उजुरी सन्दर्भ कोड (Reference ID) प्रविष्ट गर्नुहोस्।' 
          : 'Please enter your Complaint Reference ID.'
      );
      return;
    }

    // If the student hasn't entered a secret, prompt for secret or allow quick jump
    if (!cleanSecret) {
      setConsoleState('error');
      setErrorMessage(
        isNe
          ? 'गोपनीयताका लागि Private Tracking Secret अनिवार्य छ। यदि कोड छैन भने तलको लिङ्क प्रयोग गर्नुहोस्।'
          : 'Private Tracking Secret is required to verify identity. If you misplaced it, use the full portal link below.'
      );
      return;
    }

    setConsoleState('loading');
    setErrorMessage('');

    try {
      const complaint = await trackComplaint(cleanRef, cleanSecret);
      setTrackedResult(complaint);
      setConsoleState('success');
    } catch (err) {
      console.error('Hero console tracking error:', err);
      setTrackedResult(null);
      setConsoleState('error');
      setErrorMessage(
        isNe
          ? 'यो सन्दर्भ कोड (Reference ID) र ट्र्याकिङ कोडसँग मिल्ने कुनै उजुरी फेला परेन। कृपया विवरण सही छ भनी जाँच गर्नुहोस्।'
          : 'No complaint found matching the provided Reference ID and Tracking Secret. Please verify your credentials.'
      );
    }
  };

  const handleResetConsole = () => {
    setConsoleState('idle');
    setErrorMessage('');
    setTrackedResult(null);
  };

  const handleQuickJumpToPortal = () => {
    const cleanRef = referenceInput.trim().toUpperCase();
    if (cleanRef) {
      navigate(`/track?ref=${encodeURIComponent(cleanRef)}`);
    } else {
      navigate('/track');
    }
  };

  const activeStageIndex = trackedResult ? getStageIndex(trackedResult.status) : 1; // Default highlight stage 1 in idle

  return (
    <div className="hero-console-preview-card" aria-label={isNe ? 'उजुरी अनुगमन कन्सोल' : 'Complaint Tracking Console'}>
      {/* Console Frame Topbar */}
      <div className="hero-console-topbar">
        <div className="hero-console-dots">
          <span className="dot dot-red" aria-hidden="true" />
          <span className="dot dot-amber" aria-hidden="true" />
          <span className="dot dot-teal" aria-hidden="true" />
          <span className="hero-console-ref">
            {isNe ? 'कलेज उजुरी अनुगमन प्रणाली' : 'OFFICIAL GRIEVANCE TRACKER'}
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
            <span>{isNe ? 'सुरक्षित प्रमाणीकरण' : 'Secure API'}</span>
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
              {isNe ? 'पारदर्शी अनुगमन' : 'Live Status'}
            </span>
          </div>

          <div className="hero-console-pipeline" style={{ margin: 0, padding: '10px 12px' }}>
            {/* Step 1: Submitted */}
            <div className={`pipeline-node ${activeStageIndex >= 0 ? 'completed' : ''}`}>
              <div className="node-marker">
                <CheckCircle2 size={13} />
              </div>
              <div className="node-text">
                <span className="node-title">{isNe ? '१. दर्ता' : '1. Submitted'}</span>
                <span className="node-time">{isNe ? 'उजुरी दर्ता' : 'Lodged'}</span>
              </div>
            </div>
            
            <div className={`pipeline-connector ${activeStageIndex >= 1 ? 'active' : ''}`} />

            {/* Step 2: Under Review */}
            <div className={`pipeline-node ${activeStageIndex > 1 ? 'completed' : activeStageIndex === 1 ? 'current' : ''}`}>
              <div className="node-marker">
                <Search size={13} />
              </div>
              <div className="node-text">
                <span className="node-title">{isNe ? '२. समीक्षा' : '2. Review'}</span>
                <span className="node-time">{isNe ? 'छानबिन' : 'Triage'}</span>
              </div>
            </div>

            <div className={`pipeline-connector ${activeStageIndex >= 2 ? 'active' : ''}`} />

            {/* Step 3: In Progress */}
            <div className={`pipeline-node ${activeStageIndex > 2 ? 'completed' : activeStageIndex === 2 ? 'current' : ''}`}>
              <div className="node-marker">
                <Wrench size={13} />
              </div>
              <div className="node-text">
                <span className="node-title">{isNe ? '३. प्रगति' : '3. In Progress'}</span>
                <span className="node-time">{isNe ? 'मर्मत कार्य' : 'Repair'}</span>
              </div>
            </div>

            <div className={`pipeline-connector ${activeStageIndex >= 3 ? 'active' : ''}`} />

            {/* Step 4: Resolved */}
            <div className={`pipeline-node ${activeStageIndex >= 3 ? 'completed' : ''}`}>
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

        {/* STATE: SUCCESSFUL AUTHENTICATED RESULT */}
        {consoleState === 'success' && trackedResult && (
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '1rem', color: '#15365B' }}>
                    {trackedResult.reference}
                  </span>
                  <StatusBadge status={trackedResult.status} />
                </div>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.3' }}>
                  {trackedResult.title}
                </h4>
              </div>

              <button
                type="button"
                onClick={handleResetConsole}
                className="btn btn-secondary btn-sm"
                title={isNe ? 'अर्को उजुरी खोज्नुहोस्' : 'Search Another'}
                style={{ height: '32px', padding: '0 8px', fontSize: '0.75rem' }}
              >
                <RotateCcw size={12} />
                <span>{isNe ? 'नयाँ खोजी' : 'Reset'}</span>
              </button>
            </div>

            {/* Category & Details */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.75rem', color: '#64748B', marginBottom: '10px' }}>
              <div>
                <strong style={{ color: '#0F172A' }}>{isNe ? 'विधा:' : 'Category:'} </strong>
                <span>{getCategoryLabel(trackedResult.category)}</span>
              </div>
              <div>
                <strong style={{ color: '#0F172A' }}>{isNe ? 'कार्यक्रम:' : 'Program:'} </strong>
                <span>{trackedResult.program || COLLEGE_CONFIG.program}</span>
              </div>
              {trackedResult.status === 'Resolved' && (
                <div style={{ color: '#065F46', fontWeight: '700' }}>
                  ✓ {isNe ? 'समाधान भइसकेको' : 'Officially Resolved'}
                </div>
              )}
            </div>

            {/* Official Response Box */}
            <div style={{
              backgroundColor: '#F0FDFA',
              border: '1px solid #CCFBF1',
              borderRadius: '6px',
              padding: '10px 12px',
              marginBottom: '12px',
              fontSize: '0.8125rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontWeight: '700', marginBottom: '4px' }}>
                <MessageSquare size={14} />
                <span>{isNe ? 'कलेजको आधिकारिक जवाफ:' : 'College Official Response:'}</span>
              </div>
              <p style={{ margin: 0, color: '#0F172A', lineHeight: '1.45', fontSize: '0.8125rem' }}>
                {trackedResult.responses && trackedResult.responses.length > 0
                  ? trackedResult.responses[trackedResult.responses.length - 1].message
                  : (isNe 
                      ? 'उजुरी प्राविधिक समीक्षा तथा कार्यभार निर्धारणको क्रममा छ।' 
                      : 'Complaint is currently undergoing laboratory desk triage. An official response will be posted shortly.')}
              </p>
            </div>

            {/* Direct Link to Complete Audit Timeline */}
            <Link
              to={`/track?ref=${encodeURIComponent(trackedResult.reference)}&secret=${encodeURIComponent(secretInput)}`}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', height: '38px', justifyContent: 'center', fontSize: '0.8125rem' }}
            >
              <span>{isNe ? 'पूरा इतिहास तथा टाइमलाइन हेर्नुहोस्' : 'View Full History & Audit Log'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* STATE: LOADING INDICATOR */}
        {consoleState === 'loading' && (
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '28px 16px',
            textAlign: 'center',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#EEF4F9', color: '#15365B', marginBottom: '8px' }}>
              <Search size={18} className="animate-spin" />
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
              {isNe ? 'डाटाबेसमा प्रमाणीकरण गरिँदैछ...' : 'Verifying credentials with college database...'}
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
              {isNe ? 'कृपया केही सेकेन्ड प्रतीक्षा गर्नुहोस्' : 'Querying secure record for ' + referenceInput.toUpperCase()}
            </p>
          </div>
        )}

        {/* STATE: IDLE OR ERROR INPUT FORM */}
        {consoleState !== 'success' && consoleState !== 'loading' && (
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FileCheck size={16} color="#0D8178" />
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '800', color: '#0F172A' }}>
                {isNe ? 'आफ्नो उजुरीको अवस्था जाँच्नुहोस्' : 'Track Your Complaint Status'}
              </h4>
            </div>

            <p style={{ margin: '0 0 12px', fontSize: '0.8125rem', color: '#475569', lineHeight: '1.45' }}>
              {isNe
                ? 'उजुरी दर्ता गर्दा प्राप्त भएको Reference ID र Private Tracking Secret प्रविष्ट गर्नुहोस्:'
                : 'Enter the Complaint Reference ID and Private Tracking Secret received upon submission:'}
            </p>

            {/* Error Message Box */}
            {consoleState === 'error' && errorMessage && (
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                color: '#B91C1C',
                fontSize: '0.75rem',
                lineHeight: '1.4',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '10px'
              }} role="alert">
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleTrackSubmit}>
              {/* Row 1: Reference ID & Secret Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                {/* Reference Input */}
                <div>
                  <label htmlFor="hero-ref-input" style={{ display: 'block', fontSize: '0.6875rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '3px' }}>
                    {isNe ? 'सन्दर्भ कोड' : 'Reference ID'} *
                  </label>
                  <input
                    id="hero-ref-input"
                    type="text"
                    placeholder="e.g. CMP-2026-A8F2K"
                    value={referenceInput}
                    onChange={(e) => {
                      setReferenceInput(e.target.value);
                      if (consoleState === 'error') setConsoleState('idle');
                    }}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 10px',
                      fontSize: '0.8125rem',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                    aria-label="Complaint Reference ID"
                    required
                  />
                </div>

                {/* Tracking Secret Input */}
                <div>
                  <label htmlFor="hero-secret-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '3px' }}>
                    <span>{isNe ? 'गोप्य कोड' : 'Tracking Secret'} *</span>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#0D8178', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      tabIndex={-1}
                      title={showSecret ? "Hide secret" : "Show secret"}
                    >
                      {showSecret ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="hero-secret-input"
                      type={showSecret ? "text" : "password"}
                      placeholder="trk_..."
                      value={secretInput}
                      onChange={(e) => {
                        setSecretInput(e.target.value);
                        if (consoleState === 'error') setConsoleState('idle');
                      }}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 10px',
                        fontSize: '0.8125rem',
                        fontFamily: 'monospace',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        outline: 'none'
                      }}
                      aria-label="Private Tracking Secret"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    flex: '1 1 140px',
                    height: '38px',
                    padding: '0 14px',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Search size={14} />
                  <span>{isNe ? 'ट्र्याक गर्नुहोस्' : 'Track Status'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickJumpToPortal}
                  className="btn btn-secondary"
                  style={{
                    height: '38px',
                    padding: '0 12px',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title={isNe ? 'ट्र्याकिङ पोर्टल खोल्नुहोस्' : 'Open full tracking page'}
                >
                  <span>{isNe ? 'विस्तृत पोर्टल' : 'Full Page'}</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Real Complaint Policy Notice */}
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
          <MessageSquare size={15} color="#0D8178" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.75rem', color: '#134E4A', lineHeight: '1.45' }}>
            <strong>{isNe ? 'आधिकारिक समाधान नीति:' : 'Institutional Policy:'} </strong>
            <span>
              {isNe
                ? 'उजुरीहरू कलेज प्राविधिक डेस्कद्वारा सिधै समीक्षा गरिन्छ। विद्यार्थीको व्यक्तिगत गोपनीयता संरक्षण गर्न उजुरीहरू सार्वजनिक रूपमा सूचीकृत हुँदैनन्।'
                : 'Campus grievances are triaged directly by Soch College IT technicians. Tracking secrets prevent unauthorized access to student issues.'}
            </span>
          </div>
        </div>

        {/* Console Card Footer with Privacy Guarantee */}
        <div className="hero-console-footer">
          <div className="footer-privacy-badge">
            <Lock size={12} color="#0D8178" />
            <span>
              {isNe 
                ? 'गोप्य ट्र्याकिङ कोडद्वारा सुरक्षित • कुनै सार्वजनिक सूचीकरण हुँदैन' 
                : 'Argon2id Hash Protected • Zero Public Directory'}
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
