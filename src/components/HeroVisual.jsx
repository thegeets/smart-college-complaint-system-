import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  FileCheck
} from 'lucide-react';

/**
 * HeroVisual Component
 * 
 * An authentic complaint-tracking console gateway for the hero section.
 * Illustrates the 3-stage institutional complaint lifecycle:
 * Submitted → Under Review → Resolved (College response)
 * Allows students to quickly jump to the real tracking flow with their Reference ID.
 * Free of fabricated student complaints, fake technician names, or invented timestamps.
 */
export function HeroVisual() {
  const { language } = useApp();
  const isNe = language === 'ne';
  const navigate = useNavigate();
  const [referenceInput, setReferenceInput] = useState('');

  const handleQuickTrack = (e) => {
    e.preventDefault();
    const cleanRef = referenceInput.trim().toUpperCase();
    if (cleanRef) {
      navigate(`/track?ref=${encodeURIComponent(cleanRef)}`);
    } else {
      navigate('/track');
    }
  };

  return (
    <div className="hero-console-preview-card">
      {/* Console Frame Topbar */}
      <div className="hero-console-topbar">
        <div className="hero-console-dots">
          <span className="dot dot-red" />
          <span className="dot dot-amber" />
          <span className="dot dot-teal" />
          <span className="hero-console-ref">
            {isNe ? 'गुनासो ट्र्याकिङ पोर्टल' : 'COMPLAINT TRACKING GATEWAY'}
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
            <span>{isNe ? 'कलेज डेस्क' : 'Campus Desk'}</span>
          </span>
        </div>
      </div>

      {/* Main Console Body */}
      <div className="hero-console-content">
        
        {/* Institutional 3-Stage Resolution Progression */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15365D', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            {isNe ? 'उजुरी समाधान चरणहरू' : 'Official Resolution Process'}
          </div>

          <div className="hero-console-pipeline" style={{ margin: 0 }}>
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
                <span className="node-title">{isNe ? '२. समीक्षा' : '2. Under Review'}</span>
                <span className="node-time">{isNe ? 'प्रशासनिक छानबिन' : 'Desk Triage'}</span>
              </div>
            </div>

            <div className="pipeline-connector active" />

            {/* Step 3: Resolved */}
            <div className="pipeline-node">
              <div className="node-marker" style={{ backgroundColor: '#F0FDFA', color: '#0F766E', border: '1px solid #CCFBF1' }}>
                <Clock size={13} />
              </div>
              <div className="node-text">
                <span className="node-title">{isNe ? '३. समाधान' : '3. Resolved'}</span>
                <span className="node-time">{isNe ? 'कलेजको जवाफ' : 'College Response'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Real Tracking Gateway Box */}
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <FileCheck size={16} color="#0F766E" />
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '800', color: '#0F172A' }}>
              {isNe ? 'आफ्नो उजुरीको अवस्था जाँच्नुहोस्' : 'Track Your Complaint Status'}
            </h4>
          </div>

          <p style={{ margin: '0 0 12px', fontSize: '0.8125rem', color: '#475569', lineHeight: '1.45' }}>
            {isNe
              ? 'उजुरी दर्ता गर्दा प्राप्त भएको Complaint Reference ID प्रविष्ट गरी वास्तविक स्थिति र कलेजको आधिकारिक जवाफ हेर्नुहोस्:'
              : 'Enter the Complaint Reference ID received upon submission to view current administrative progress and college responses:'}
          </p>

          <form onSubmit={handleQuickTrack} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder={isNe ? 'जस्तै: CMP-2026-A8F2K' : 'e.g. CMP-2026-A8F2K'}
              value={referenceInput}
              onChange={(e) => setReferenceInput(e.target.value)}
              style={{
                flex: '1 1 180px',
                height: '40px',
                padding: '0 12px',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                fontWeight: '700',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                outline: 'none'
              }}
              aria-label="Complaint Reference ID"
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                height: '40px',
                padding: '0 16px',
                fontSize: '0.875rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Search size={15} />
              <span>{isNe ? 'ट्र्याक गर्नुहोस्' : 'Track Status'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Real Complaint Policy Notice */}
        <div style={{
          backgroundColor: '#F0FDFA',
          border: '1px solid #CCFBF1',
          borderRadius: '8px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          marginBottom: '14px'
        }}>
          <MessageSquare size={16} color="#0F766E" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.75rem', color: '#134E4A', lineHeight: '1.45' }}>
            <strong>{isNe ? 'कलेजको आधिकारिक जवाफ:' : 'College response:'} </strong>
            <span>
              {isNe
                ? 'उजुरी समाधान भएपछि कलेज प्रशासनद्वारा आधिकारिक जवाफ र समाधान मिति रेकर्ड गरिन्छ। केवल मान्य ट्र्याकिङ कोड भएका उजुरीहरू मात्र प्रदर्शित हुन्छन्।'
                : 'Official responses and resolution timestamps are documented upon administrative review. Only authentic complaints retrieved with valid credentials are displayed.'}
            </span>
          </div>
        </div>

        {/* Console Card Footer with Privacy Guarantee */}
        <div className="hero-console-footer">
          <div className="footer-privacy-badge">
            <Lock size={13} color="#0F766E" />
            <span>
              {isNe 
                ? 'गोप्य ट्र्याकिङ कोडद्वारा सुरक्षित • कुनै सार्वजनिक सूचीकरण हुँदैन' 
                : 'Protected by Private Tracking Secret • No public directory'}
            </span>
          </div>
          <span className="footer-helper-tag">
            {isNe ? 'सोच कलेज' : 'Soch College'}
          </span>
        </div>

      </div>
    </div>
  );
}

export default HeroVisual;
