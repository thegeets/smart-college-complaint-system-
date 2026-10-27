import React, { useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant = 'primary',
  noteValue,
  onNoteChange,
  showNoteInput = false,
  noteLabel,
  notePlaceholder,
  showSelect = false,
  selectLabel,
  selectOptions = [],
  selectValue,
  onSelectChange,
  showSecondarySelect = false,
  secondarySelectLabel,
  secondarySelectOptions = [],
  secondarySelectValue,
  onSecondarySelectChange,
}) {
  const { t } = useApp();
  const modalRef = useRef(null);

  const finalTitle = title || t('common.confirm', 'Confirm Action');
  const finalMessage = message || t('common.confirm', 'Are you sure you want to proceed with this update?');
  const finalConfirmText = confirmText || t('common.confirm', 'Confirm');
  const finalCancelText = cancelText || t('common.cancel', 'Cancel');
  const finalNoteLabel = noteLabel || t('common.instructions', 'Internal Note / Reason:');
  const finalNotePlaceholder = notePlaceholder || t('common.addDetails', 'Add details or instructions for this update...');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-dialog" 
        ref={modalRef} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
              {finalTitle}
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            aria-label={t('common.close', 'Close dialog')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {finalMessage && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-body)', marginBottom: 'var(--space-4)', lineHeight: '1.5' }}>
              {finalMessage}
            </p>
          )}

          {showSelect && (
            <div className="form-group">
              {selectLabel && <label className="form-label">{selectLabel}</label>}
              <select
                className="form-select"
                value={selectValue}
                onChange={(e) => onSelectChange && onSelectChange(e.target.value)}
              >
                {selectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {showSecondarySelect && (
            <div className="form-group">
              {secondarySelectLabel && <label className="form-label">{secondarySelectLabel}</label>}
              <select
                className="form-select"
                value={secondarySelectValue}
                onChange={(e) => onSecondarySelectChange && onSecondarySelectChange(e.target.value)}
              >
                {secondarySelectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {showNoteInput && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{finalNoteLabel}</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder={finalNotePlaceholder}
                value={noteValue || ''}
                onChange={(e) => onNoteChange && onNoteChange(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary btn-sm" 
            onClick={onClose}
          >
            {finalCancelText}
          </button>
          <button
            type="button"
            className={`btn btn-${confirmVariant} btn-sm`}
            onClick={onConfirm}
          >
            {finalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
