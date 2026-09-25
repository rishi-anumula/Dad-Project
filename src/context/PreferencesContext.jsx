import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Shop Preferences Context
 * ------------------------
 * Feature: "Shop preference -> UI"
 * Stores shop-wide preferences and applies them to the UI live:
 *  - Accent theme color (CSS variables consumed across components)
 *  - Tagline shown under the shop name in the navbar
 *  - Currency symbol for new money components
 *  - Billing defaults (making charges, GST %) used by calculators
 *  - AI chatbot provider / API key
 */

const PREFS_KEY = 'khatabook_shop_preferences_v1';

export const ACCENT_PRESETS = {
  amber:   { name: 'Royal Gold',  50: '#fffbeb', 100: '#fef3c7', 300: '#fcd34d', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', glow: 'rgba(245,158,11,0.35)' },
  indigo:  { name: 'Classic Indigo', 50: '#eef2ff', 100: '#e0e7ff', 300: '#a5b4fc', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', glow: 'rgba(99,102,241,0.35)' },
  emerald: { name: 'Emerald',     50: '#ecfdf5', 100: '#d1fae5', 300: '#6ee7b7', 500: '#10b981', 600: '#059669', 700: '#047857', glow: 'rgba(16,185,129,0.35)' },
  rose:    { name: 'Rose',        50: '#fff1f2', 100: '#ffe4e6', 300: '#fda4af', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', glow: 'rgba(244,63,94,0.35)' },
  sky:     { name: 'Sky',         50: '#f0f9ff', 100: '#e0f2fe', 300: '#7dd3fc', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', glow: 'rgba(14,165,233,0.35)' },
  violet:  { name: 'Violet',      50: '#f5f3ff', 100: '#ede9fe', 300: '#c4b5fd', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', glow: 'rgba(139,92,246,0.35)' }
};

export const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'AED', symbol: 'AED ', label: 'UAE Dirham' }
];

const DEFAULT_PREFERENCES = {
  tagline: 'Gold • Silver • Trusted Since 1995',
  accent: 'amber',
  currency: '₹',
  defaultMakingChargeType: 'PER_GRAM', // 'PER_GRAM' | 'FIXED'
  defaultMakingChargeValue: 450,       // ₹ per gram
  gstPercent: 3,
  includeGstInPrices: true,
  chatProvider: 'local',               // 'local' | 'gemini' | 'openai'
  chatApiKey: '',
  chatModel: 'gemini-2.0-flash',
  forecastHorizonDays: 30,
  assistantName: 'Jewel AI'
};

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    } catch (e) { console.warn('[preferences] failed to load', e); }
    return DEFAULT_PREFERENCES;
  });

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
    } catch (e) { console.warn('[preferences] failed to persist', e); }
  }, [preferences]);

  // Apply accent color to the document as CSS variables -> drives the whole UI
  useEffect(() => {
    const preset = ACCENT_PRESETS[preferences.accent] || ACCENT_PRESETS.amber;
    const root = document.documentElement;
    root.style.setProperty('--accent-50', preset[50]);
    root.style.setProperty('--accent-100', preset[100]);
    root.style.setProperty('--accent-300', preset[300]);
    root.style.setProperty('--accent-500', preset[500]);
    root.style.setProperty('--accent-600', preset[600]);
    root.style.setProperty('--accent-700', preset[700]);
    root.style.setProperty('--accent-glow', preset.glow);
  }, [preferences.accent]);

  const updatePreferences = useCallback((partial) => {
    setPreferences(prev => ({ ...prev, ...partial }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const accentColors = ACCENT_PRESETS[preferences.accent] || ACCENT_PRESETS.amber;

  const formatMoney = useCallback((amount, opts = {}) => {
    const num = Number(amount);
    const safe = isNaN(num) ? 0 : num;
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: opts.decimals ?? 0,
      minimumFractionDigits: 0
    }).format(Math.abs(safe));
    return `${safe < 0 ? '-' : ''}${preferences.currency} ${formatted}`;
  }, [preferences.currency]);

  return (
    <PreferencesContext.Provider value={{
      preferences,
      updatePreferences,
      resetPreferences,
      accentColors,
      formatMoney,
      DEFAULT_PREFERENCES
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within a PreferencesProvider');
  return ctx;
}
