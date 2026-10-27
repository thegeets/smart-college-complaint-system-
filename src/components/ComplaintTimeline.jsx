import React from 'react';
import { useApp } from '../context/AppContext';
import { Check, Clock, Search, Wrench, CheckCircle2, AlertCircle } from 'lucide-react';

export function ComplaintTimeline({ currentStatus = 'Submitted', timeline = [] }) {
  const { t, getStatusLabel, language } = useApp();
  const isNe = language === 'ne';

  // Ordered pipeline steps
  const steps = [
    { key: 'Submitted', labelKey: 'timeline.step1', fallback: '1. Submitted', icon: Clock },
    { key: 'Under Review', labelKey: 'timeline.step2', fallback: '2. Under Review', icon: Search },
    { key: 'In Progress', labelKey: 'timeline.step3', fallback: '3. In Progress', icon: Wrench },
    { key: 'Resolved', labelKey: 'timeline.step4', fallback: '4. Resolved', icon: CheckCircle2 },
  ];

  const statusIndexMap = {
    'Submitted': 0,
    'Under Review': 1,
    'In Progress': 2,
    'Resolved': 3,
    'Rejected': 1,
  };

  const currentIndex = statusIndexMap[currentStatus] ?? 0;
  const isRejected = currentStatus === 'Rejected';

  return (
    <div style={{ margin: 'var(--space-4) 0' }}>
      
      {/* 4-Step Clean Visual Stepper */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--space-2)',
          position: 'relative',
          marginBottom: 'var(--space-6)'
        }}
        role="progressbar" 
        aria-valuenow={currentIndex + 1} 
        aria-valuemin={1} 
        aria-valuemax={4}
      >
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || (idx === currentIndex && currentStatus === 'Resolved');
          const isActive = idx === currentIndex && currentStatus !== 'Resolved';
          const Icon = step.icon;
          const stepLabel = t(step.labelKey, step.fallback);

          return (
            <div 
              key={step.key} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              {/* Stepper Node Circle */}
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isCompleted ? 'var(--color-primary)' : isActive ? 'var(--color-surface)' : 'var(--color-surface-subtle)',
                  border: isCompleted 
                    ? '2px solid var(--color-primary)' 
                    : isActive 
                    ? '2px solid var(--color-teal)' 
                    : '2px solid var(--color-border)',
                  color: isCompleted ? '#FFFFFF' : isActive ? 'var(--color-teal)' : 'var(--color-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-1)',
                  zIndex: 2,
                  transition: 'all 0.15s ease'
                }}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (
                  <Icon size={14} />
                )}
              </div>

              {/* Step Label */}
              <div style={{ 
                fontSize: '0.8125rem', 
                fontWeight: isActive || isCompleted ? '700' : '500',
                color: isActive ? 'var(--color-teal)' : isCompleted ? 'var(--color-heading)' : 'var(--color-muted)',
                lineHeight: '1.2'
              }}>
                {stepLabel}
              </div>

              {/* Status text */}
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                {isCompleted ? (isNe ? 'सम्पन्न' : 'Done') : isActive ? (isNe ? 'प्रक्रियामा' : 'Active') : (isNe ? 'बाँकी' : 'Pending')}
              </div>
            </div>
          );
        })}
      </div>

      {isRejected && (
        <div style={{
          backgroundColor: 'var(--color-error-bg)',
          border: '1px solid var(--color-error-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          color: 'var(--color-error)',
          fontSize: '0.8125rem',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)'
        }}>
          <AlertCircle size={16} />
          <span>{isNe ? 'सूचना: यो उजुरी कलेज प्रशासनद्वारा अस्वीकृत गरिएको छ।' : 'Notice: This complaint was reviewed and marked as Rejected by college administration.'}</span>
        </div>
      )}

      {/* Historical Audit Trail with Timestamps and Notes */}
      {timeline.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-heading)', marginBottom: 'var(--space-3)' }}>
            {isNe ? 'कार्यप्रगति इतिहास' : 'Recorded Status History'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {timeline.map((entry, i) => {
              const formattedDate = new Date(entry.timestamp).toLocaleString(isNe ? 'ne-NP' : 'en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              const targetStatus = entry.toStatus || entry.status;
              const displayStatus = targetStatus ? getStatusLabel(targetStatus) : entry.action;

              return (
                <div 
                  key={entry.id || entry._id || i} 
                  style={{
                    backgroundColor: 'var(--color-surface-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {displayStatus && (
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                          [{displayStatus}]
                        </span>
                      )}
                      {entry.action && entry.action !== displayStatus && entry.action !== `Status Changed to ${targetStatus}` && (
                        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-heading)' }}>
                          {entry.action}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      {formattedDate}
                    </span>
                  </div>

                  {entry.note && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-body)', lineHeight: '1.4' }}>
                      {entry.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintTimeline;
