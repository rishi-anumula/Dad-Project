import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Phone, 
  Store, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Delete, 
  Sparkles,
  Smartphone,
  Eye,
  EyeOff,
  X,
  Fingerprint
} from 'lucide-react';

const CITIES = [
  { id: 'hyderabad', name: 'Hyderabad (TG/AP)' },
  { id: 'vijayawada', name: 'Vijayawada (AP)' },
  { id: 'mumbai', name: 'Mumbai (MH)' },
  { id: 'delhi', name: 'Delhi NCR' },
  { id: 'chennai', name: 'Chennai (TN)' },
  { id: 'bangalore', name: 'Bengaluru (KA)' },
  { id: 'kolkata', name: 'Kolkata (WB)' },
  { id: 'ahmedabad', name: 'Ahmedabad (GJ)' }
];

export function AuthModal({ 
  isOpen = true, 
  initialMode = 'PIN', // 'PIN' | 'PHONE' | 'SETUP' | 'FORGOT'
  onSuccess,
  onClose
}) {
  const { 
    shopProfile, 
    loginWithPin, 
    loginWithPhone, 
    setupShop, 
    resetPinWithPhone,
    isBiometricEnabled,
    biometricInfo,
    loginWithBiometrics
  } = useAuth();

  const { t } = useLanguage();

  const [mode, setMode] = useState(
    !shopProfile.isConfigured ? 'SETUP' : initialMode
  );

  // Sync mode if initialMode changes
  useEffect(() => {
    if (shopProfile.isConfigured && initialMode) {
      setMode(initialMode);
    }
  }, [initialMode, shopProfile.isConfigured]);

  // PIN state
  const [pin, setPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Phone Login state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passwordOrOtp, setPasswordOrOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Setup Wizard state
  const [setupStep, setSetupStep] = useState(1);
  const [setupForm, setSetupForm] = useState({
    shopName: shopProfile.shopName || '',
    ownerPhone: shopProfile.ownerPhone || '',
    city: shopProfile.city || 'hyderabad',
    pin: '',
    confirmPin: ''
  });

  // Forgot PIN state
  const [resetPhone, setResetPhone] = useState('');
  const [newResetPin, setNewResetPin] = useState('');
  const [confirmResetPin, setConfirmResetPin] = useState('');

  // Auto-submit PIN when 4 digits are reached
  useEffect(() => {
    if (mode === 'PIN' && pin.length === 4) {
      handlePinSubmit(pin);
    }
  }, [pin, mode]);

  // Physical keyboard support for PIN
  useEffect(() => {
    if (mode !== 'PIN') return;

    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < 4) {
          setPin((prev) => prev + e.key);
          setErrorMessage('');
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
        setErrorMessage('');
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, mode, onClose]);

  // Biometric verification handler
  const handleBiometricAuth = async () => {
    setErrorMessage('');
    const promptOptions = {
      title: t('auth.biometricPromptTitle') || 'Authenticate to access Khatabook',
      reason: t('auth.biometricPromptReason') || 'Touch fingerprint sensor',
      subtitle: t('auth.biometricPromptSubtitle') || 'Store Security Verification',
      cancelTitle: t('auth.back') || 'Use PIN'
    };

    const res = await loginWithBiometrics(promptOptions);
    if (res.success) {
      setSuccessMessage('Biometric verified successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 300);
    } else {
      // Graceful fallback to PIN keypad without locking out
      setErrorMessage(t('auth.biometricFailed') || 'Biometric verification cancelled or failed. Please use PIN.');
    }
  };

  // Auto-prompt biometrics once on open if enabled & configured
  const hasAutoPromptedRef = useRef(false);
  useEffect(() => {
    if (isOpen && mode === 'PIN' && isBiometricEnabled && shopProfile.isConfigured && !hasAutoPromptedRef.current) {
      hasAutoPromptedRef.current = true;
      const timer = setTimeout(() => {
        handleBiometricAuth();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, isBiometricEnabled, shopProfile.isConfigured]);

  const triggerShake = (msg) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setPin('');
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleNumpadPress = (val) => {
    setErrorMessage('');
    if (val === 'CLEAR') {
      setPin('');
    } else if (val === 'BACK') {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < 4) {
      setPin((prev) => prev + val);
    }
  };

  const handlePinSubmit = (enteredPin) => {
    const res = loginWithPin(enteredPin);
    if (res.success) {
      setSuccessMessage('Store unlocked successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 400);
    } else {
      triggerShake(t('auth.errorPin') || 'Incorrect PIN. Try 1234.');
    }
  };

  const handlePhoneLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const res = loginWithPhone(phoneNumber, passwordOrOtp || '123456');
    if (res.success) {
      setSuccessMessage('Logged in successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 400);
    } else {
      setErrorMessage(res.error || t('auth.errorPassword'));
    }
  };

  const handleSendOtp = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMessage(t('auth.errorPhone') || 'Enter valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
    setPasswordOrOtp('123456');
    setSuccessMessage(t('auth.otpSentTo', { phone: phoneNumber }) || `OTP sent: 123456`);
  };

  const handleSetupStep1 = (e) => {
    e.preventDefault();
    if (!setupForm.shopName.trim()) {
      setErrorMessage('Please enter your jewelry store name');
      return;
    }
    setErrorMessage('');
    setSetupStep(2);
  };

  const handleCompleteSetup = (e) => {
    e.preventDefault();
    if (setupForm.pin.length !== 4) {
      setErrorMessage('PIN must be exactly 4 digits');
      return;
    }
    if (setupForm.pin !== setupForm.confirmPin) {
      setErrorMessage(t('auth.pinMismatch') || 'PINs do not match');
      return;
    }

    setupShop({
      shopName: setupForm.shopName,
      ownerPhone: setupForm.ownerPhone,
      city: setupForm.city,
      pin: setupForm.pin
    });

    setSuccessMessage('Store created successfully!');
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 500);
  };

  const handleResetPin = (e) => {
    e.preventDefault();
    if (newResetPin.length !== 4) {
      setErrorMessage('New PIN must be 4 digits');
      return;
    }
    if (newResetPin !== confirmResetPin) {
      setErrorMessage(t('auth.pinMismatch') || 'PINs do not match');
      return;
    }
    const res = resetPinWithPhone(resetPhone, newResetPin);
    if (res.success) {
      setSuccessMessage(t('auth.pinChangedSuccess') || 'PIN reset successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      setErrorMessage(res.error || 'Phone verification failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className={`relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 ${isShaking ? 'animate-bounce' : ''}`}>
        
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-600" />

        {/* Close Button if onClose is available */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Card Header */}
        <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800/60 bg-gradient-to-b from-amber-50/40 dark:from-amber-950/10 to-transparent">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            {mode === 'SETUP' ? (
              <Store className="w-7 h-7" />
            ) : mode === 'PHONE' ? (
              <Smartphone className="w-7 h-7" />
            ) : (
              <KeyRound className="w-7 h-7" />
            )}
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {mode === 'SETUP' 
              ? (setupStep === 1 ? t('auth.step1Title') : t('auth.step2Title'))
              : mode === 'PHONE'
              ? t('auth.phoneLoginTitle')
              : mode === 'FORGOT'
              ? t('auth.resetTitle')
              : t('auth.enterPinTitle')}
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {mode === 'SETUP'
              ? (setupStep === 1 ? t('auth.step1Subtitle') : t('auth.step2Subtitle'))
              : mode === 'PHONE'
              ? t('auth.phoneLoginSubtitle')
              : mode === 'FORGOT'
              ? t('auth.verifyPhonePrompt')
              : `${shopProfile.shopName || 'JewelLedger'} • ${t('auth.enterPinSubtitle')}`}
          </p>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Body Content by Mode */}
        <div className="p-6">

          {/* MODE A: 4-DIGIT PIN KEYPAD */}
          {mode === 'PIN' && (
            <div className="space-y-6">
              
              {/* PIN Bubbles Display */}
              <div className="flex justify-center items-center space-x-4 py-2">
                {[0, 1, 2, 3].map((index) => {
                  const isFilled = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full transition-all duration-200 ${
                        isFilled
                          ? 'bg-amber-500 scale-125 ring-4 ring-amber-500/20 shadow-md shadow-amber-500/30'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Counter Demo Hint */}
              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/30 py-1.5 px-3 rounded-lg border border-amber-200/50 dark:border-amber-800/40 max-w-fit mx-auto">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('auth.quickDemoPinNotice')}</span>
              </div>

              {/* Numeric Touch Keypad (3x4 Grid) */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((btn) => {
                  if (btn === 'CLEAR') {
                    return (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => handleNumpadPress('CLEAR')}
                        className="h-14 rounded-2xl flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                      >
                        {t('auth.clear')}
                      </button>
                    );
                  }
                  if (btn === 'BACK') {
                    return (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => handleNumpadPress('BACK')}
                        className="h-14 rounded-2xl flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                        aria-label="Delete"
                      >
                        <Delete className="w-5 h-5" />
                      </button>
                    );
                  }
                  return (
                    <button
                      key={btn}
                      type="button"
                      onClick={() => handleNumpadPress(btn)}
                      className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xl font-bold border border-slate-200/60 dark:border-slate-700/60 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                    >
                      {btn}
                    </button>
                  );
                })}
              </div>

              {/* Prominent Biometric / Fingerprint Unlock Button */}
              {isBiometricEnabled && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleBiometricAuth}
                    className="w-full py-3 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs sm:text-sm border border-amber-500/30 hover:border-amber-500/50 shadow-sm active:scale-95 transition-all flex items-center justify-center space-x-2.5"
                  >
                    <Fingerprint className="w-5 h-5 text-amber-500" />
                    <span>{t('auth.biometricUnlock') || 'Unlock with Fingerprint'}</span>
                  </button>
                </div>
              )}

              {/* Mode Switchers */}
              <div className="pt-2 flex flex-col items-center space-y-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setMode('PHONE');
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  {t('auth.switchModePhone')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setMode('FORGOT');
                  }}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {t('auth.forgotPin')}
                </button>
              </div>

            </div>
          )}

          {/* MODE B: OWNER PHONE & PASSWORD / OTP */}
          {mode === 'PHONE' && (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('auth.ownerPhoneLabel')}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('auth.passwordLabel')}
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline"
                  >
                    {otpSent ? 'OTP Auto-filled' : t('auth.sendOtp')}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordOrOtp}
                    onChange={(e) => setPasswordOrOtp(e.target.value)}
                    placeholder="Enter password or 123456"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  {t('auth.orUseOtp')} • Instant code: <span className="font-bold text-amber-500">123456</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>{t('auth.verifyOtp')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setMode('PIN');
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  {t('auth.switchModePin')}
                </button>
              </div>
            </form>
          )}

          {/* INITIAL SETUP WIZARD (2 STEPS) */}
          {mode === 'SETUP' && (
            <div>
              {setupStep === 1 ? (
                <form onSubmit={handleSetupStep1} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('auth.shopNameLabel')} *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Store className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={setupForm.shopName}
                        onChange={(e) => setSetupForm({ ...setupForm, shopName: e.target.value })}
                        placeholder={t('auth.shopNamePlaceholder')}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('auth.ownerPhoneLabel')}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={setupForm.ownerPhone}
                        onChange={(e) => setSetupForm({ ...setupForm, ownerPhone: e.target.value.replace(/\D/g, '') })}
                        placeholder={t('auth.ownerPhonePlaceholder')}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('auth.cityLabel')}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <select
                        value={setupForm.city}
                        onChange={(e) => setSetupForm({ ...setupForm, city: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                      >
                        {CITIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{t('auth.continue')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteSetup} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('auth.pinLabel')} (4 Digits)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      value={setupForm.pin}
                      onChange={(e) => setSetupForm({ ...setupForm, pin: e.target.value.replace(/\D/g, '') })}
                      placeholder="e.g. 1234"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center tracking-[0.5em] text-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('auth.confirmPinLabel')}
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      value={setupForm.confirmPin}
                      onChange={(e) => setSetupForm({ ...setupForm, confirmPin: e.target.value.replace(/\D/g, '') })}
                      placeholder="Repeat PIN"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center tracking-[0.5em] text-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSetupStep(1)}
                      className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center space-x-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{t('auth.back')}</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center space-x-1"
                    >
                      <span>{t('auth.completeSetup')}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* FORGOT PIN / RESET MODE */}
          {mode === 'FORGOT' && (
            <form onSubmit={handleResetPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('auth.ownerPhoneLabel')}
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={resetPhone}
                  onChange={(e) => setResetPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={shopProfile.ownerPhone || '9876543210'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('auth.newPinLabel')}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  value={newResetPin}
                  onChange={(e) => setNewResetPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center tracking-[0.4em] text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('auth.confirmPinLabel')}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  value={confirmResetPin}
                  onChange={(e) => setConfirmResetPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center tracking-[0.4em] text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setMode('PIN');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  {t('auth.back')}
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all"
                >
                  {t('auth.setNewPin')}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
