import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Fingerprint, 
  KeyRound, 
  Lock, 
  Delete, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  LogOut,
  ArrowRight,
  ShieldCheck,
  User
} from 'lucide-react';

export function BiometricPinOverlay() {
  const { 
    user, 
    isAuthenticated,
    isLocked, 
    hasBackupPin, 
    biometricAvailable, 
    authenticateBiometrics, 
    verifyPin, 
    setupBackupPin, 
    logout 
  } = useAuth();
  
  const { t } = useLanguage();

  // Mode: 'UNLOCK' (standard PIN/Biometric unlock) or 'SETUP_PIN' (initial PIN creation)
  const [mode, setMode] = useState(!hasBackupPin ? 'SETUP_PIN' : 'UNLOCK');

  // PIN state
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState(1); // 1 = Enter PIN, 2 = Confirm PIN
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Auto-prompt native biometrics on initial mount if locked
  const hasAutoPromptedRef = useRef(false);

  const triggerBiometrics = async () => {
    setErrorMessage('');
    const promptOptions = {
      title: t('auth.biometricPromptTitle') || 'Authenticate to access Khatabook',
      reason: t('auth.biometricPromptReason') || 'Touch fingerprint sensor',
      subtitle: user?.name ? `Welcome back, ${user.name}` : 'Store Security Verification',
      cancelTitle: 'Use PIN'
    };

    const res = await authenticateBiometrics(promptOptions);
    if (!res.success) {
      // Graceful fallback to PIN pad
      setErrorMessage(t('auth.biometricFailed') || 'Biometric scan cancelled. Please enter PIN.');
    }
  };

  useEffect(() => {
    if (isLocked && isAuthenticated && mode === 'UNLOCK' && biometricAvailable && !hasAutoPromptedRef.current) {
      hasAutoPromptedRef.current = true;
      const timer = setTimeout(() => {
        triggerBiometrics();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isLocked, isAuthenticated, mode, biometricAvailable]);

  // When 4 to 6 digits are entered, auto-verify in UNLOCK mode
  useEffect(() => {
    if (mode === 'UNLOCK' && pin.length >= 4) {
      // Auto-submit on 4 digits (standard retail counter speed)
      handlePinSubmit(pin);
    }
  }, [pin, mode]);

  // Physical keyboard support
  useEffect(() => {
    if (!isLocked || !isAuthenticated) return;

    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < 6) {
          setPin((prev) => prev + e.key);
          setErrorMessage('');
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
        setErrorMessage('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, isAuthenticated, pin]);

  if (!isLocked || !isAuthenticated) return null;

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
    } else if (pin.length < 6) {
      setPin((prev) => prev + val);
    }
  };

  const handlePinSubmit = async (enteredPin) => {
    const res = await verifyPin(enteredPin);
    if (!res.success) {
      triggerShake(res.error || 'Incorrect PIN. Please retry.');
    }
  };

  const handleSetupStep1 = () => {
    if (pin.length < 4) {
      setErrorMessage('PIN must be at least 4 digits');
      return;
    }
    setConfirmPin(pin);
    setPin('');
    setSetupStep(2);
    setErrorMessage('');
  };

  const handleCompletePinSetup = async () => {
    if (pin !== confirmPin) {
      triggerShake('PINs do not match. Please re-enter.');
      setPin('');
      setSetupStep(1);
      return;
    }
    const res = await setupBackupPin(confirmPin);
    if (res.success) {
      setSuccessMessage('Backup Security PIN activated!');
    } else {
      setErrorMessage(res.error || 'Failed to save PIN.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className={`w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 ${isShaking ? 'animate-bounce' : ''}`}>
        
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-600" />

        {/* Card Header & User Profile Greetings */}
        <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800/60 bg-gradient-to-b from-amber-50/30 dark:from-amber-950/15 to-transparent">
          
          {/* User Avatar */}
          <div className="relative w-16 h-16 mx-auto mb-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-500">
                <User className="w-8 h-8" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shadow-sm">
              <Lock className="w-3 h-3" />
            </div>
          </div>

          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            {mode === 'SETUP_PIN' 
              ? (setupStep === 1 ? 'Create Fallback Security PIN' : 'Confirm Your PIN')
              : (user?.name ? `Welcome back, ${user.name}` : 'App Locked')}
          </h2>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px] mx-auto">
            {mode === 'SETUP_PIN'
              ? 'Required for retail counter fallback & device unlock'
              : (user?.email || 'Verify identity to access ledger')}
          </p>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 pt-4 space-y-4">

          {/* PIN Indicators Display */}
          <div className="flex justify-center items-center space-x-3 py-2">
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

          {/* Setup Action Button if in SETUP_PIN mode */}
          {mode === 'SETUP_PIN' && (
            <div className="text-center">
              {setupStep === 1 ? (
                <button
                  type="button"
                  disabled={pin.length < 4}
                  onClick={handleSetupStep1}
                  className="w-full py-2.5 rounded-xl bg-amber-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Continue to Confirm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pin.length < 4}
                  onClick={handleCompletePinSetup}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Save PIN & Open Dashboard</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Numeric Touch Keypad (3x4 Grid) */}
          <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((btn) => {
              if (btn === 'CLEAR') {
                return (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => handleNumpadPress('CLEAR')}
                    className="h-12 rounded-2xl flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                  >
                    Clear
                  </button>
                );
              }
              if (btn === 'BACK') {
                return (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => handleNumpadPress('BACK')}
                    className="h-12 rounded-2xl flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                    aria-label="Delete"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                );
              }
              return (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleNumpadPress(btn)}
                  className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-lg font-bold border border-slate-200/60 dark:border-slate-700/60 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                >
                  {btn}
                </button>
              );
            })}
          </div>

          {/* Biometric Unlock Action Button */}
          {mode === 'UNLOCK' && biometricAvailable && (
            <div className="pt-1">
              <button
                type="button"
                onClick={triggerBiometrics}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs border border-amber-500/30 hover:border-amber-500/50 shadow-sm active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Fingerprint className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>{t('auth.biometricUnlock') || 'Unlock with Fingerprint'}</span>
              </button>
            </div>
          )}

          {/* Quick Counter Demo Hint */}
          <div className="text-center pt-1">
            <p className="text-[10px] text-slate-400">
              Default Counter PIN: <span className="font-bold text-amber-500">1234</span>
            </p>
          </div>

          {/* Explicit Logout Option */}
          <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center space-x-1 text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign out of Google account</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
