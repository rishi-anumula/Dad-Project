import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'jewelledger_language';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'te')) {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read language preference from localStorage:', e);
    }
    return 'en';
  });

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'hi' || lang === 'te') {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {
        console.warn('Could not save language preference to localStorage:', e);
      }
    }
  };

  /**
   * Helper function to get translated text by dot-separated path e.g. t('nav.dashboard')
   * Supports dynamic parameter replacements e.g. {{count}}
   */
  const t = (path, params = {}) => {
    const keys = path.split('.');
    
    // 1. Try selected language dictionary
    let result = translations[language];
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        result = null;
        break;
      }
    }

    // 2. Fallback to English dictionary if key is missing in target language
    if (result === null || result === undefined) {
      let fallback = translations['en'];
      for (const k of keys) {
        if (fallback && fallback[k] !== undefined) {
          fallback = fallback[k];
        } else {
          fallback = path; // Return raw path key if missing everywhere
          break;
        }
      }
      result = fallback;
    }

    // 3. Replace dynamic string placeholders e.g. {{count}} -> 3
    if (typeof result === 'string') {
      Object.keys(params).forEach(paramKey => {
        result = result.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), params[paramKey]);
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
