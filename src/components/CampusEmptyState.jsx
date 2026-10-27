import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PlusCircle, RotateCcw, CheckCircle2 } from 'lucide-react';

export function CampusEmptyState({
  title,
  description,
  actionLabel,
  actionTo = '/submit',
  onReset = null,
  resetLabel,
}) {
  const { t } = useApp();

  const finalTitle = title || t('myComplaints.emptyTitle', 'No Open Grievances');
  const finalDesc = description || t('myComplaints.emptyDesc', 'There are currently no complaints recorded in this view.');
  const finalActionLabel = actionLabel || t('common.reportIssue', 'Submit a Complaint');
  const finalResetLabel = resetLabel || t('common.resetFilters', 'Reset Filters');

  return (
    <div 
      style={{
        textAlign: 'center',
        padding: 'var(--space-12) var(--space-6)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xs)'
      }}
      role="status"
    >
      <div 
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-primary-subtle)',
          color: 'var(--color-primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-3)'
        }}
      >
        <CheckCircle2 size={24} />
      </div>

      <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-heading)', marginBottom: 'var(--space-1)' }}>
        {finalTitle}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', maxWidth: '440px', margin: '0 auto' }}>
        {finalDesc}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
        {onReset && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onReset}>
            <RotateCcw size={14} />
            <span>{finalResetLabel}</span>
          </button>
        )}
        {actionTo && (
          <Link to={actionTo} className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            <span>{finalActionLabel}</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default CampusEmptyState;
