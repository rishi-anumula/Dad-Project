import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLedger } from '../context/LedgerContext';
import { AuthModal } from './AuthModal';
import { 
  Coins, 
  Sparkles, 
  BookOpen, 
  FileSpreadsheet, 
  Lock, 
  KeyRound, 
  Smartphone, 
  Store, 
  Sun, 
  Moon, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle,
  Gem,
  Globe,
  Fingerprint
} from 'lucide-react';

const LANGUAGE_PILLS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' }
];

export function LandingPage() {
  const navigate = useNavigate();
  const { shopProfile, isAuthenticated, isBiometricEnabled } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { bullionRates, darkMode, setDarkMode, selectedCity } = useLedger();

  const [authModalState, setAuthModalState] = useState({
    isOpen: true, // Prompt directly with PIN keypad for instant access (or SETUP if first time)
    mode: !shopProfile.isConfigured ? 'SETUP' : 'PIN'
  });

  // If already authenticated and not locked, proceed to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const gold24k = bullionRates?.gold24k?.perGram || 16298;
  const gold22k = bullionRates?.gold22k?.perGram || 14940;
  const silver = bullionRates?.silver999?.perGram || 265;

  const handleAuthSuccess = () => {
    setAuthModalState({ isOpen: false, mode: 'PIN' });
    navigate('/dashboard');
  };

  const openAuth = (mode = 'PIN') => {
    setAuthModalState({
      isOpen: true,
      mode: !shopProfile.isConfigured ? 'SETUP' : mode
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      
      {/* Top Header Bar */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/25">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white flex items-center space-x-1.5">
              <span>{shopProfile.shopName || 'JewelLedger'}</span>
            </span>
            <span className="block text-[11px] font-semibold text-amber-400/90 tracking-wide uppercase">
              {t('nav.subBrand')}
            </span>
          </div>
        </div>

        {/* Top Controls: Language Switcher & Dark Mode */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Centered / Header Language Quick-Selector */}
          <div className="flex items-center bg-slate-800/80 backdrop-blur-md p-1 rounded-2xl border border-slate-700/60 shadow-inner">
            {LANGUAGE_PILLS.map((pill) => {
              const isActive = language === pill.code;
              return (
                <button
                  key={pill.code}
                  onClick={() => setLanguage(pill.code)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{pill.flag}</span>
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            title="Toggle theme mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

        </div>

      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center text-center justify-center">
        
        {/* Live Bullion Ticker Pill */}
        <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6 backdrop-blur-md shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-bold uppercase tracking-wider text-[10px] text-amber-400">
            {t('auth.liveTickerLabel')} ({selectedCity.toUpperCase()})
          </span>
          <span className="text-slate-500">•</span>
          <span>Gold 24K: ₹{gold24k.toLocaleString()}/g</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="hidden sm:inline">Silver: ₹{silver.toLocaleString()}/g</span>
        </div>

        {/* Main Title & Subtitle */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight sm:leading-tight">
          {t('auth.welcomeTitle')}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
          {t('auth.welcomeTagline')}
        </p>

        {/* Primary Call-to-Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
          
          <button
            onClick={() => openAuth('PIN')}
            className="w-full sm:w-auto flex-1 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold text-sm tracking-wide shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{t('auth.ctaUnlock')}</span>
          </button>

          <button
            onClick={() => openAuth('PHONE')}
            className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700/80 active:scale-95 transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>{t('auth.ctaLoginPhone')}</span>
          </button>

          {shopProfile.isConfigured && isBiometricEnabled && (
            <button
              onClick={() => openAuth('PIN')}
              className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-sm border border-amber-500/30 hover:border-amber-500/50 shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2"
              title={t('auth.biometricUnlock') || 'Unlock with Fingerprint'}
            >
              <Fingerprint className="w-5 h-5 text-amber-400" />
              <span className="sm:hidden">{t('auth.biometricUnlock')}</span>
            </button>
          )}

        </div>

        {/* First-Time Setup Link */}
        <div className="mt-4">
          <button
            onClick={() => openAuth('SETUP')}
            className="text-xs text-amber-400/90 hover:text-amber-300 font-semibold hover:underline flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('auth.setupNewNotice')}</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left">
          
          {/* Card 1: Live Bullion Rates */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-800 backdrop-blur-md hover:border-amber-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {t('auth.features.liveRatesTitle')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('auth.features.liveRatesDesc')}
            </p>
          </div>

          {/* Card 2: Customer Khatabook */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-800 backdrop-blur-md hover:border-amber-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {t('auth.features.khatabookTitle')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('auth.features.khatabookDesc')}
            </p>
          </div>

          {/* Card 3: Instant WhatsApp Invoices */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-800 backdrop-blur-md hover:border-amber-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {t('auth.features.invoicesTitle')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('auth.features.invoicesDesc')}
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-5 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {shopProfile.shopName || 'JewelLedger'} • Retail Bullion Credit Ledger</p>
          <div className="flex items-center space-x-3 text-slate-400">
            <span className="flex items-center space-x-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline Ready & Local Storage Secured</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Auth Modal (PIN Keypad / Phone Login / Setup Wizard) */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onSuccess={handleAuthSuccess}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
      />

    </div>
  );
}
