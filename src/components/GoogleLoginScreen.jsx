import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLedger } from '../context/LedgerContext';
import { 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  TrendingUp,
  Store,
  Phone,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  User,
  MapPin,
  Building2,
  Receipt,
  FileCheck,
  RotateCcw,
  Check,
  Smartphone,
  AlertCircle,
  HelpCircle,
  Gem
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

const LANGUAGE_PILLS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' }
];

export function GoogleLoginScreen() {
  const { 
    user,
    isAuthenticated,
    shopProfile,
    loginWithGoogle, 
    loginWithEmailOrPhone, 
    loginWithStorePin, 
    registerShop, 
    completeBusinessOnboarding,
    resetBusinessProfileForTesting,
    resetPinOrPassword,
    logout
  } = useAuth();

  const { setBusinessName, bullionRates, selectedCity, changeSelectedCity } = useLedger();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Main Active Tab: 'GOOGLE' or 'NORMAL'
  const [activeTab, setActiveTab] = useState('GOOGLE');

  // If true, user is in step 2: "Give Business Details"
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);

  // Business Onboarding Form state
  const [businessForm, setBusinessForm] = useState({
    shopName: '',
    ownerName: '',
    ownerPhone: '',
    city: 'hyderabad',
    gstin: '',
    address: '',
    pin: '1234'
  });

  // Normal Sign-In Sub-mode: 'CREDENTIALS' | 'PIN' | 'REGISTER' | 'FORGOT'
  const [normalMode, setNormalMode] = useState('CREDENTIALS');

  // Normal Sign-In Credentials Form
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // 4-Digit Quick Store PIN Pad
  const [storePin, setStorePin] = useState('');

  // Normal Manual Registration Form
  const [registerForm, setRegisterForm] = useState({
    shopName: '',
    ownerName: '',
    identifier: '',
    password: '',
    pin: '1234',
    city: 'hyderabad'
  });

  // Reset PIN Form
  const [resetPhone, setResetPhone] = useState('');
  const [newResetPin, setNewResetPin] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [forceNewUserMode, setForceNewUserMode] = useState(false);

  const gold24k = bullionRates?.gold24k?.perGram || 16298;
  const silver = bullionRates?.silver999?.perGram || 265;

  // Physical keyboard support for 4-digit PIN Pad
  useEffect(() => {
    if (activeTab !== 'NORMAL' || normalMode !== 'PIN') return;

    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        if (storePin.length < 4) {
          setStorePin((prev) => prev + e.key);
          setErrorMessage('');
        }
      } else if (e.key === 'Backspace') {
        setStorePin((prev) => prev.slice(0, -1));
        setErrorMessage('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [storePin, normalMode, activeTab]);

  // Auto-submit 4-digit PIN when complete
  useEffect(() => {
    if (activeTab === 'NORMAL' && normalMode === 'PIN' && storePin.length === 4) {
      handlePinSubmit(storePin);
    }
  }, [storePin, normalMode, activeTab]);

  // 1. Google Sign-In Action
  const handleGoogleSignIn = async (forceNew = false) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await loginWithGoogle({ forceNew: forceNew || forceNewUserMode });
      if (res?.redirecting) {
        setSuccessMessage('Redirecting to Google Sign-In...');
        return;
      }
      if (res?.success) {
        setGoogleUserData(res.user);

        // If user is NEW (no configured business profile yet), guide them to enter business details
        if (res.isNewUser || !shopProfile?.isConfigured) {
          setIsOnboarding(true);
          const userName = res.user?.name || '';
          setBusinessForm((prev) => ({
            ...prev,
            ownerName: userName,
            ownerPhone: prev.ownerPhone || '9876543210',
            shopName: prev.shopName || `${userName ? userName.split(' ')[0] : 'Sri Lakshmi'} Jewellers`
          }));
          setSuccessMessage('Google Account verified! Please enter your business details to continue.');
        } else {
          // Returning user: seamless entry to dashboard
          const userName = res.user?.name || 'User';
          setSuccessMessage(`Welcome back, ${userName}!`);
          setTimeout(() => {
            const target = (!from || from === '/login') ? '/dashboard' : from;
            navigate(target, { replace: true });
          }, 400);
        }
      } else {
        setErrorMessage(res?.error || 'Google sign-in could not be completed.');
      }
    } catch (err) {
      setErrorMessage('Google sign-in error. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Instant Temporary Email Login
  const handleInstantTempMailLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const tempEmail = `store.owner${randomSuffix}@tempmail.org`;
      const res = await loginWithEmailOrPhone({
        identifier: tempEmail,
        password: 'password123',
        name: 'Store Owner',
        unlockDirectly: true
      });
      if (res?.success) {
        setSuccessMessage(`Logged in as ${tempEmail}! Loading Dashboard...`);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 300);
      } else {
        setErrorMessage(res?.error || 'Failed to login with temporary mail.');
      }
    } catch (e) {
      setErrorMessage('Temporary mail login error.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Business Details (New User Onboarding)
  const handleCompleteBusinessOnboarding = async (e) => {
    e?.preventDefault();
    if (!businessForm.shopName.trim()) {
      setErrorMessage('Please enter your Jewelry Store / Business Name.');
      return;
    }
    if (!businessForm.ownerPhone.trim()) {
      setErrorMessage('Please enter your business contact phone number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await completeBusinessOnboarding({
        shopName: businessForm.shopName.trim(),
        ownerName: businessForm.ownerName.trim() || googleUserData?.name || 'Store Owner',
        ownerPhone: businessForm.ownerPhone.trim(),
        city: businessForm.city,
        gstin: businessForm.gstin.trim(),
        address: businessForm.address.trim(),
        pin: businessForm.pin || '1234'
      });

      if (res.success) {
        setBusinessName(businessForm.shopName.trim());
        if (changeSelectedCity && businessForm.city) {
          changeSelectedCity(businessForm.city);
        }
        setSuccessMessage('Store profile created successfully! Launching your ledger...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 600);
      } else {
        setErrorMessage(res.error || 'Failed to save business details.');
      }
    } catch (err) {
      setErrorMessage('Failed to save business profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Normal Sign-In: Mobile / Email & Password
  const handleNormalSignIn = async (e) => {
    e?.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your mobile number or email address');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await loginWithEmailOrPhone({
        identifier: identifier.trim(),
        password: password.trim(),
        unlockDirectly: true
      });
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.error || 'Sign-in failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMessage('Sign-in failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Normal Sign-In: Quick Store PIN
  const handlePinSubmit = async (pinToVerify) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await loginWithStorePin(pinToVerify);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.error || 'Invalid 4-digit PIN. (Demo PIN is 1234)');
        setStorePin('');
      }
    } catch (err) {
      setErrorMessage('PIN verification failed.');
      setStorePin('');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Normal Sign-Up: Manual Store Registration
  const handleRegisterStore = async (e) => {
    e?.preventDefault();
    if (!registerForm.shopName.trim()) {
      setErrorMessage('Please enter your jewelry store name');
      return;
    }
    if (!registerForm.identifier.trim()) {
      setErrorMessage('Please enter your mobile number or email');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await registerShop({
        shopName: registerForm.shopName.trim(),
        ownerName: registerForm.ownerName.trim(),
        identifier: registerForm.identifier.trim(),
        password: registerForm.password || 'password123',
        pin: registerForm.pin || '1234',
        city: registerForm.city
      });

      if (res.success) {
        setBusinessName(registerForm.shopName.trim());
        setSuccessMessage('Store registered successfully!');
        setTimeout(() => navigate('/dashboard', { replace: true }), 500);
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    } catch (err) {
      setErrorMessage('Registration failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Reset PIN
  const handleResetPin = async (e) => {
    e?.preventDefault();
    if (!newResetPin || newResetPin.length < 4) {
      setErrorMessage('New PIN must be at least 4 digits');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await resetPinOrPassword({ newPin: newResetPin });
      if (res.success) {
        setSuccessMessage('PIN reset successfully! You can now log in.');
        setNormalMode('PIN');
        setStorePin('');
      } else {
        setErrorMessage(res.error || 'Failed to reset PIN.');
      }
    } catch (err) {
      setErrorMessage('Failed to reset PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to reset and test new user flow
  const handleTestNewUserFlow = async () => {
    await resetBusinessProfileForTesting();
    setIsOnboarding(false);
    setForceNewUserMode(true);
    setSuccessMessage('Simulating New User mode. Click "Continue with Google" below!');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navigation Bar: Bullion Rates Ticker & Language Switcher */}
      <header className="border-b border-amber-500/20 bg-slate-950/70 backdrop-blur-md px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
            <Coins className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white">Jewel<span className="text-amber-400">Ledger</span></span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">PRO</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smart Credit, Bullion & Counter Ledger</p>
          </div>
        </div>

        {/* Live Bullion Ticker */}
        <div className="hidden md:flex items-center space-x-4 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs shadow-inner">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400 font-medium">Live Rates ({selectedCity || 'Hyderabad'}):</span>
          </div>
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="text-amber-400">Gold 24K: ₹{gold24k.toLocaleString('en-IN')}/g</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">Silver: ₹{silver.toLocaleString('en-IN')}/g</span>
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {LANGUAGE_PILLS.map((pill) => (
            <button
              key={pill.code}
              onClick={() => setLanguage(pill.code)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                language === pill.code
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="mr-1">{pill.flag}</span>
              {pill.label}
            </button>
          ))}
        </div>
      </header>

      {/* Center Authentication Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl">

          {/* New User Business Onboarding Card (Step 2 after Google Login) */}
          {isOnboarding ? (
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      Set Up Your Business
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Step 2 of 2</span>
                    </h2>
                    <p className="text-xs text-slate-400">Enter your store details to customize your ledger, receipts & rates</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOnboarding(false)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Change Account
                </button>
              </div>

              {/* Verified Google Account Banner */}
              {googleUserData && (
                <div className="flex items-center space-x-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl p-3 mb-6">
                  {googleUserData.avatar ? (
                    <img 
                      src={googleUserData.avatar} 
                      alt={googleUserData.name} 
                      className="w-10 h-10 rounded-full border border-amber-500/40 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                      {googleUserData.name ? googleUserData.name[0] : 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-bold text-white truncate">{googleUserData.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-400 truncate">{googleUserData.email}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                    Google Connected
                  </span>
                </div>
              )}

              {/* Alert Feedback */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Business Details Form */}
              <form onSubmit={handleCompleteBusinessOnboarding} className="space-y-4">
                
                {/* 1. Jewelry Store / Business Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-amber-400" />
                      Jewelry Business / Store Name *
                    </span>
                    <span className="text-[10px] text-amber-400">Required</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Lakshmi Jewellers & Bullion Mart"
                    value={businessForm.shopName}
                    onChange={(e) => setBusinessForm({ ...businessForm, shopName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-medium transition-all"
                  />
                </div>

                {/* 2. Owner Name & Contact Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      Owner Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Sharma"
                      value={businessForm.ownerName}
                      onChange={(e) => setBusinessForm({ ...businessForm, ownerName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        Business Mobile / WhatsApp *
                      </span>
                      <span className="text-[10px] text-amber-400">Required</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-400 border-r border-slate-700 pr-2">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="98765 43210"
                        value={businessForm.ownerPhone}
                        onChange={(e) => setBusinessForm({ ...businessForm, ownerPhone: e.target.value.replace(/\D/g, '') })}
                        className="w-full pl-14 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-medium tracking-wide"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Primary Bullion City / Benchmark */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    Store City (For Live Bullion Rate Benchmarks)
                  </label>
                  <select
                    value={businessForm.city}
                    onChange={(e) => setBusinessForm({ ...businessForm, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-sm font-medium cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Your ledger and catalog will automatically sync live 24K, 22K gold & silver rates for this city.
                  </p>
                </div>

                {/* 4. GSTIN & Store Address (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-amber-400" />
                      GSTIN / Registration No. (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 36AAAAA0000A1Z5"
                      value={businessForm.gstin}
                      onChange={(e) => setBusinessForm({ ...businessForm, gstin: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-medium uppercase tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      4-Digit Counter Security PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="1234"
                      value={businessForm.pin}
                      onChange={(e) => setBusinessForm({ ...businessForm, pin: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-mono tracking-widest text-center"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Saving Your Business Details...</span>
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Complete Setup & Launch Ledger</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          ) : (
            /* Main Login Card */
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
              
              {/* Header Title */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
                  <Gem className="w-3.5 h-3.5" />
                  <span>Jewelry Store & Counter Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">JewelLedger</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                  Secure khata credit management, live bullion pricing & digital jewelry invoices
                </p>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* If already authenticated, show friendly status bar */}
              {isAuthenticated && user && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-500/40">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.name ? user.name[0] : 'U'
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{user.name || 'Store Owner'}</p>
                      <p className="text-slate-400 text-[11px]">{user.email || 'Authenticated Session'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-xl shadow-md hover:from-amber-400 hover:to-yellow-300 transition-all cursor-pointer text-center"
                    >
                      Go to Dashboard →
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        setSuccessMessage('Signed out successfully.');
                      }}
                      className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all border border-slate-700 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Method Selector Tabs */}
              <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('GOOGLE');
                    setErrorMessage('');
                  }}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                    activeTab === 'GOOGLE'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google Sign-In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('NORMAL');
                    setErrorMessage('');
                  }}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                    activeTab === 'NORMAL'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Normal Sign-In</span>
                </button>
              </div>

              {/* TAB 1: GOOGLE SIGN-IN OPTION */}
              {activeTab === 'GOOGLE' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Google Action Container */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
                    
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-xl shadow-white/5 flex items-center justify-center p-3 border border-slate-200">
                      <svg className="w-full h-full" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white">One-Click Google Authentication</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        New business owners can sign in with Google and enter their store details in step 2.
                      </p>
                    </div>

                    {/* Prominent Google Sign-In Button */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleGoogleSignIn(false)}
                      className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-3 cursor-pointer group active:scale-[0.99] border border-slate-200"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span className="group-hover:text-slate-950 font-extrabold">Continue with Google</span>
                    </button>

                    <div className="flex items-center space-x-3 py-1">
                      <div className="flex-1 h-px bg-slate-800"></div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">or instant demo</span>
                      <div className="flex-1 h-px bg-slate-800"></div>
                    </div>

                    {/* Instant Temporary Mail Button */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleInstantTempMailLogin}
                      className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 text-amber-300 hover:text-amber-200 font-bold text-xs sm:text-sm border border-amber-500/40 shadow-lg shadow-amber-950/30 transition-all flex items-center justify-center space-x-2.5 cursor-pointer active:scale-[0.99]"
                    >
                      <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Instant Access with Temporary Mail</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    </button>

                    {/* New User Business Setup Badge */}
                    <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
                        <Sparkles className="w-3.5 h-3.5" />
                        First time here?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleGoogleSignIn(true)}
                        className="text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
                      >
                        Sign in with Google & Set Up New Store
                      </button>
                    </div>

                  </div>

                  {/* Feature Highlights Grid */}
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-start space-x-3">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Custom Store Name</h4>
                        <p className="text-[11px] text-slate-400">Branded PDFs & receipts for your customers</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-start space-x-3">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Live City Rates</h4>
                        <p className="text-[11px] text-slate-400">Syncs local 24K & 22K bullion market rates</p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: NORMAL SIGN-IN OPTION */}
              {activeTab === 'NORMAL' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  
                  {/* Normal Sub-Mode Pills: Credentials vs Quick PIN vs Register */}
                  <div className="flex items-center justify-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setNormalMode('CREDENTIALS');
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                        normalMode === 'CREDENTIALS'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Phone / Email
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNormalMode('PIN');
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                        normalMode === 'PIN'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      4-Digit PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNormalMode('REGISTER');
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                        normalMode === 'REGISTER'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      New Store
                    </button>
                  </div>

                  {/* Sub-mode A: Credentials (Mobile / Email + Password) */}
                  {normalMode === 'CREDENTIALS' && (
                    <form onSubmit={handleNormalSignIn} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                          Mobile Number or Email
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 9876543210 or store@gmail.com"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-medium"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => setNormalMode('FORGOT')}
                            className="text-xs text-amber-400 hover:underline"
                          >
                            Forgot PIN?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-medium pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500"
                          />
                          <span>Remember this store</span>
                        </label>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? 'Signing In...' : 'Sign In to Store'}
                      </button>
                    </form>
                  )}

                  {/* Sub-mode B: 4-Digit Quick PIN Pad */}
                  {normalMode === 'PIN' && (
                    <div className="space-y-4 text-center">
                      <div>
                        <h4 className="text-sm font-bold text-white">Enter 4-Digit Counter PIN</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Quick unlock for retail store counter (Default: 1234)</p>
                      </div>

                      {/* 4 Dots PIN Display */}
                      <div className="flex justify-center space-x-3 py-2">
                        {[0, 1, 2, 3].map((index) => {
                          const isFilled = storePin.length > index;
                          return (
                            <div
                              key={index}
                              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                                isFilled
                                  ? 'bg-amber-400 ring-4 ring-amber-400/30 scale-110'
                                  : 'bg-slate-800 border border-slate-700'
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Numeric Keypad Buttons */}
                      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                          <button
                            key={digit}
                            type="button"
                            onClick={() => {
                              if (storePin.length < 4) setStorePin((prev) => prev + digit);
                            }}
                            className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 active:bg-amber-500/20 active:border-amber-500 border border-slate-800 text-lg font-bold text-white shadow-sm transition-all"
                          >
                            {digit}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setStorePin('')}
                          className="h-12 rounded-xl bg-slate-950 hover:bg-rose-950/40 border border-slate-800 text-xs font-bold text-slate-400 hover:text-rose-300 transition-all"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (storePin.length < 4) setStorePin((prev) => prev + '0');
                          }}
                          className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-lg font-bold text-white shadow-sm transition-all"
                        >
                          0
                        </button>
                        <button
                          type="button"
                          onClick={() => setStorePin((prev) => prev.slice(0, -1))}
                          className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center"
                        >
                          ⌫
                        </button>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setNormalMode('FORGOT')}
                          className="text-xs text-amber-400 hover:underline"
                        >
                          Forgot or want to reset PIN?
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sub-mode C: Register New Store (Manual Sign-Up) */}
                  {normalMode === 'REGISTER' && (
                    <form onSubmit={handleRegisterStore} className="space-y-3.5 text-left">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Store / Business Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sri Krishna Ornaments"
                          value={registerForm.shopName}
                          onChange={(e) => setRegisterForm({ ...registerForm, shopName: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Owner Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Rajesh Kumar"
                            value={registerForm.ownerName}
                            onChange={(e) => setRegisterForm({ ...registerForm, ownerName: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            City Benchmark
                          </label>
                          <select
                            value={registerForm.city}
                            onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm cursor-pointer"
                          >
                            {CITIES.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Mobile or Email *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="9876543210 or store@gmail.com"
                          value={registerForm.identifier}
                          onChange={(e) => setRegisterForm({ ...registerForm, identifier: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            4-Digit PIN
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="1234"
                            value={registerForm.pin}
                            onChange={(e) => setRegisterForm({ ...registerForm, pin: e.target.value.replace(/\D/g, '') })}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm text-center font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-sm shadow-md hover:brightness-110 active:scale-[0.99] transition-all"
                      >
                        Register Store & Sign In
                      </button>
                    </form>
                  )}

                  {/* Sub-mode D: Reset PIN */}
                  {normalMode === 'FORGOT' && (
                    <form onSubmit={handleResetPin} className="space-y-4 text-left">
                      <div>
                        <h4 className="text-sm font-bold text-white">Reset Counter Security PIN</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Enter your registered mobile number and set a new 4-digit PIN</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Mobile Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="9876543210"
                          value={resetPhone}
                          onChange={(e) => setResetPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">New 4-Digit PIN</label>
                        <input
                          type="password"
                          maxLength={4}
                          required
                          placeholder="e.g. 5678"
                          value={newResetPin}
                          onChange={(e) => setNewResetPin(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono text-center"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNormalMode('PIN')}
                          className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
                        >
                          Save New PIN
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              )}

              {/* Footer Helper Actions */}
              <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                <button
                  type="button"
                  onClick={handleTestNewUserFlow}
                  className="flex items-center space-x-1 text-slate-400 hover:text-amber-400 transition-colors"
                  title="Wipe current profile and test the new business onboarding flow"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Test New Business Flow</span>
                </button>

                <div className="flex items-center space-x-1.5 text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>End-to-End Local Storage & Offline Safe</span>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-800/60 py-3.5 px-4 text-center text-xs text-slate-500">
        <p>JewelLedger • Enterprise Jewellery & Bullion Credit Management • Works Online & Offline</p>
      </footer>

    </div>
  );
}
