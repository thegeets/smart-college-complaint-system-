import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, Check } from 'lucide-react';

/**
 * LanguageSwitcher Component
 * 
 * Replaces the wide segmented control with a compact, accessible dropdown:
 * - Shows only the currently selected language: "EN ▾" or "ने ▾" (~58px width, 34px height)
 * - On click, reveals the full language options: "English" and "नेपाली"
 * - Supports keyboard interaction (Escape to close, focus return), outside-click dismissal
 * - Preserves existing translation behavior and localStorage persistence
 */
export function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Close on Escape key and return focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (langCode) => {
    setLanguage(langCode);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const isEn = language === 'en';
  const displayLabel = isEn ? 'EN' : 'ने';

  return (
    <div 
      ref={containerRef}
      className={`lang-dropdown-wrap ${className}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`lang-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="lang-trigger-text">{displayLabel}</span>
        <ChevronDown 
          size={13} 
          className={`lang-trigger-chevron ${isOpen ? 'rotate' : ''}`} 
          aria-hidden="true" 
        />
      </button>

      {isOpen && (
        <div 
          className="lang-dropdown-menu" 
          role="listbox" 
          aria-label="Language options"
        >
          <button
            type="button"
            role="option"
            aria-selected={isEn}
            className={`lang-dropdown-option ${isEn ? 'selected' : ''}`}
            onClick={() => handleSelect('en')}
          >
            <span>English</span>
            {isEn && <Check size={13} className="lang-option-check" aria-hidden="true" />}
          </button>

          <button
            type="button"
            role="option"
            aria-selected={!isEn}
            className={`lang-dropdown-option ${!isEn ? 'selected' : ''}`}
            onClick={() => handleSelect('ne')}
          >
            <span>नेपाली</span>
            {!isEn && <Check size={13} className="lang-option-check" aria-hidden="true" />}
          </button>
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
