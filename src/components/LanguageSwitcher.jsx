import React from 'react';
import { useApp } from '../context/AppContext';
import { Languages } from 'lucide-react';

/**
 * LanguageSwitcher Component
 * 
 * Provides an accessible, bilingual segmented toggle control labeled "English | नेपाली".
 * Remembers selected language in localStorage ('en' or 'ne') and dynamically
 * sets document.documentElement.lang.
 */
export function LanguageSwitcher({ size = 'default', showIcon = true, className = '' }) {
  const { language, setLanguage } = useApp();

  return (
    <div
      className={`lang-switcher-wrap ${className}`}
      role="group"
      aria-label="Language selection: English or Nepali"
    >
      {showIcon && (
        <span className="lang-switcher-icon" aria-hidden="true">
          <Languages size={size === 'sm' ? 14 : 16} />
        </span>
      )}

      <div className={`lang-segmented-control ${size === 'sm' ? 'control-sm' : ''}`}>
        <button
          type="button"
          className={`lang-option-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
          aria-pressed={language === 'en'}
          title="Switch to English interface"
        >
          English
        </button>

        <span className="lang-divider" aria-hidden="true">|</span>

        <button
          type="button"
          className={`lang-option-btn ${language === 'ne' ? 'active' : ''}`}
          onClick={() => setLanguage('ne')}
          aria-pressed={language === 'ne'}
          title="नेपाली भाषामा स्विच गर्नुहोस्"
        >
          नेपाली
        </button>
      </div>
    </div>
  );
}

export default LanguageSwitcher;
