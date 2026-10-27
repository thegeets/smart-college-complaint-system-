import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck
} from 'lucide-react';

/**
 * PathwayIllustration
 * Custom UI illustration demonstrating a campus grievance moving through
 * Submitted → In Review → Resolved along connected pathway nodes.
 */
export function PathwayIllustration({ onSelectSampleId }) {
  const { t } = useApp();

  const stages = [
    {
      id: 0,
      nameKey: 'statuses.Submitted',
      defaultName: 'Submitted',
      stepNum: '01',
      icon: Clock,
      time: '09:15 AM',
      note: 'Grievance registered. Complaint #CMP-2024-001 created for computer lab workstation.',
      badgeColor: '#4338ca',
      badgeBg: '#eef2ff'
    },
    {
      id: 1,
      nameKey: 'statuses.Under Review',
      defaultName: 'In Review',
      stepNum: '02',
      icon: Search,
      time: '10:00 AM',
      note: 'Technical support reviewed diagnostics; replacement power supply unit scheduled.',
      badgeColor: '#0369a1',
      badgeBg: '#e0f2fe'
    },
    {
      id: 2,
      nameKey: 'statuses.Resolved',
      defaultName: 'Resolved',
      stepNum: '03',
      icon: CheckCircle2,
      time: 'Next Day',
      note: 'Workstation power supply installed, OS booted, and monitor signal verified.',
      badgeColor: '#065f46',
      badgeBg: '#d1fae5'
    }
  ];

  const [activeStageIndex, setActiveStageIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Auto cycle smoothly through stages to create a living demonstration
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % stages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, stages.length]);

  const activeStage = stages[activeStageIndex];
  const progressPercent = (activeStageIndex / (stages.length - 1)) * 100;

  return (
    <div 
      className="pathway-illustration-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Interactive Resolution Pipeline Illustration"
    >
      {/* Decorative campus nodes watermark */}
      <div className="pathway-watermark-nodes" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
          <circle cx="30" cy="40" r="3" fill="#38bdf8" fillOpacity="0.25"/>
          <circle cx="160" cy="50" r="4" fill="#14b8a6" fillOpacity="0.25"/>
          <circle cx="120" cy="170" r="3" fill="#38bdf8" fillOpacity="0.2"/>
          <line x1="30" y1="40" x2="160" y2="50" stroke="#38bdf8" strokeOpacity="0.15" strokeDasharray="3 3"/>
          <line x1="160" y1="50" x2="120" y2="170" stroke="#14b8a6" strokeOpacity="0.15" strokeDasharray="3 3"/>
        </svg>
      </div>

      {/* Card Header Bar */}
      <div className="pathway-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="pathway-live-badge">
            <span className="live-dot" /> {t('common.liveMarker', 'LIVE RESOLUTION PIPELINE')}
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          {t('common.autoCycleDemo', 'Auto-tracking demo • Click any stage')}
        </span>
      </div>

      {/* Connected Pathway Rail */}
      <div className="pathway-track-wrapper">
        <div className="pathway-track-bg" />
        <div 
          className="pathway-track-active" 
          style={{ width: `${progressPercent}%` }}
        >
          <span className="pathway-traveling-beacon" />
        </div>

        <div className="pathway-nodes-row">
          {stages.map((st, idx) => {
            const isCompleted = idx < activeStageIndex;
            const isCurrent = idx === activeStageIndex;
            const Icon = st.icon;
            const stageName = t(st.nameKey, st.defaultName);

            return (
              <button
                key={st.defaultName}
                type="button"
                className={`pathway-node-btn ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setActiveStageIndex(idx)}
                title={`View stage: ${stageName}`}
              >
                <div className="pathway-node-circle">
                  <Icon size={16} />
                  {isCurrent && <span className="active-radar-ring" />}
                </div>
                <div className="pathway-node-label">
                  <span className="node-step">{st.stepNum}</span>
                  <span className="node-name">{stageName}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulated Live Complaint Docket Card Moving on the Pathway */}
      <div className="pathway-docket-card animate-scale-in" key={activeStageIndex}>
        <div className="pathway-docket-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="docket-id-tag">CMP-2024-001</span>
              <span 
                className="docket-status-badge" 
                style={{ color: activeStage.badgeColor, backgroundColor: activeStage.badgeBg }}
              >
                {t(activeStage.nameKey, activeStage.defaultName)}
              </span>
            </div>
            <h4 className="docket-title">
              {t('pathway.sampleTitle', 'Computer in programming lab is not starting')}
            </h4>
          </div>
          <span className="docket-time-stamp">{activeStage.time}</span>
        </div>

        <p className="docket-note">
          <strong>{t('timeline.stageAudit', 'Stage Audit:')}</strong> {activeStage.note}
        </p>

        <div className="docket-footer">
          <div className="docket-meta-pill">
            <ShieldCheck size={13} color="#0d9488" />
            <span>{t('timeline.auditTrace', 'Digital Audit Trace')}</span>
          </div>
          <div className="docket-meta-pill">
            <UserCheck size={13} color="#0284c7" />
            <span>{t('timeline.assignedTo', 'Assigned to')}: {t('pathway.sampleAssigned', 'IT Technical Support')}</span>
          </div>
        </div>
      </div>

      {/* Trust & Efficiency Metrics Strip */}
      <div className="pathway-metrics-strip">
        <div className="metric-col">
          <span className="metric-val">48 hrs</span>
          <span className="metric-lbl">{t('common.targetSla', 'Target Resolution SLA')}</span>
        </div>
        <div className="metric-divider" />
        <div className="metric-col">
          <span className="metric-val">100%</span>
          <span className="metric-lbl">{t('common.confidentialRate', 'Confidential & Verified')}</span>
        </div>
        <div className="metric-divider" />
        <div className="metric-col">
          <span className="metric-val">94.8%</span>
          <span className="metric-lbl">{t('common.resolutionRate', 'Resolution Rate')}</span>
        </div>
      </div>
    </div>
  );
}

export default PathwayIllustration;
