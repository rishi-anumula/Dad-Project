import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLedger } from '../context/LedgerContext';
import { usePreferences, ACCENT_PRESETS, CURRENCY_OPTIONS } from '../context/PreferencesContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Store, MapPin, Palette, Sparkles, ArrowRight, ArrowLeft, Check,
  Coins, IndianRupee, Bot, PartyPopper, Gem
} from 'lucide-react';

const CITIES = [
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana / AP' },
  { id: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu' },
  { id: 'bangalore', name: 'Bengaluru', state: 'Karnataka' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat' }
];

const STEPS = [
  { id: 'shop', title: 'Your Shop', icon: Store, desc: 'Tell us about your jewelry store' },
  { id: 'rates', title: 'City & Rates', icon: Coins, desc: 'Pick your bullion market & billing defaults' },
  { id: 'look', title: 'Look & Feel', icon: Palette, desc: 'Brand colour & language for your app' },
  { id: 'ai', title: 'AI Assistant', icon: Bot, desc: 'Meet your smart shop helper' }
];

/**
 * Feature: "Login page -> Shop preferences"
 * Shown automatically right after login for first-time users, before the dashboard.
 */
export function OnboardingWizard() {
  const navigate = useNavigate();
  const { user, shopProfile, completeBusinessOnboarding, updateShopProfile } = useAuth();
  const { setBusinessName, setDefaultShopCity } = useLedger();
  const { preferences, updatePreferences, accentColors } = usePreferences();
  const { language, setLanguage } = useLanguage();

  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [shop, setShop] = useState({
    shopName: shopProfile?.shopName || '',
    tagline: preferences.tagline || '',
    ownerName: shopProfile?.ownerName || user?.name || '',
    ownerPhone: shopProfile?.ownerPhone || '',
    address: shopProfile?.address || '',
    gstin: shopProfile?.gstin || ''
  });
  const [city, setCity] = useState(shopProfile?.city || 'hyderabad');
  const [making, setMaking] = useState({
    type: preferences.defaultMakingChargeType,
    value: String(preferences.defaultMakingChargeValue)
  });
  const [gst, setGst] = useState(String(preferences.gstPercent));
  const [accent, setAccent] = useState(preferences.accent);
  const [currency, setCurrency] = useState(preferences.currency);
  const [assistantName, setAssistantName] = useState(preferences.assistantName || 'Jewel AI');

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all';
  const labelCls = 'block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5';

  const validateStep = () => {
    if (step === 0 && !shop.shopName.trim()) {
      setError('Please enter your shop name — it appears across the app.');
      return false;
    }
    setError('');
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const back = () => { setError(''); setStep(s => Math.max(s - 1, 0)); };

  const finish = async () => {
    if (!validateStep()) return;
    setIsSaving(true);
    try {
      // 1. Shop profile (auth layer)
      if (!shopProfile?.isConfigured) {
        await completeBusinessOnboarding({
          shopName: shop.shopName.trim(),
          ownerName: shop.ownerName,
          ownerPhone: shop.ownerPhone,
          city,
          gstin: shop.gstin,
          address: shop.address
        });
      } else {
        await updateShopProfile({
          shopName: shop.shopName.trim(),
          ownerName: shop.ownerName,
          ownerPhone: shop.ownerPhone,
          city,
          gstin: shop.gstin,
          address: shop.address
        });
      }

      // 2. Ledger-level settings
      setBusinessName(shop.shopName.trim());
      setDefaultShopCity(city);

      // 3. UI preferences (drive the whole UI)
      updatePreferences({
        tagline: shop.tagline.trim(),
        accent,
        currency,
        defaultMakingChargeType: making.type,
        defaultMakingChargeValue: parseFloat(making.value) || 450,
        gstPercent: parseFloat(gst) || 3,
        assistantName: assistantName.trim() || 'Jewel AI'
      });

      // 4. Language
      if (['en', 'hi', 'te'].includes(language) === false) setLanguage('en');

      // Mark onboarding complete -> AuthGuard lets the user through to /dashboard
      await updateShopProfile({ preferencesCompleted: true });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('[onboarding] failed', err);
      setError('Something went wrong while saving. Please try again.');
      setIsSaving(false);
    }
  };

  // Already onboarded (e.g. back-navigation) -> straight to the dashboard
  if (shopProfile?.preferencesCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/40 to-indigo-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center p-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
      <div className="w-full max-w-xl">

        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl accent-grad mx-auto flex items-center justify-center shadow-lg accent-glow mb-3">
            <Gem className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Set up your shop preferences</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Personalise JewelLedger for your store — takes under a minute.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-5">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                onClick={() => (i < step || validateStep()) && setStep(i)}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold transition-all ${
                  i === step ? 'accent-bg text-white shadow-md'
                    : i < step ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                {i < step ? <Check className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                <span className="hidden sm:inline">{s.title}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`w-3 sm:w-6 h-0.5 rounded ${i < step ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-800'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-xl animate-fade-in">

          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl accent-bg-soft flex items-center justify-center">
              <Sparkles className="w-[18px] h-[18px] accent-text" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{STEPS[step].title}</h2>
              <p className="text-[11px] text-slate-400 font-semibold">{STEPS[step].desc}</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">

            {/* STEP 1: Shop identity */}
            {step === 0 && (
              <>
                <div>
                  <label className={labelCls}>Shop name *</label>
                  <input className={inputCls} value={shop.shopName} onChange={e => setShop(s => ({ ...s, shopName: e.target.value }))} placeholder="e.g. Sri Lakshmi Jewellers" autoFocus />
                </div>
                <div>
                  <label className={labelCls}>Tagline (shown under your shop name)</label>
                  <input className={inputCls} value={shop.tagline} onChange={e => setShop(s => ({ ...s, tagline: e.target.value }))} placeholder="Gold • Silver • Trusted Since 1995" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Owner name</label>
                    <input className={inputCls} value={shop.ownerName} onChange={e => setShop(s => ({ ...s, ownerName: e.target.value }))} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input className={inputCls} value={shop.ownerPhone} onChange={e => setShop(s => ({ ...s, ownerPhone: e.target.value }))} placeholder="98765 43210" inputMode="tel" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Shop address</label>
                  <input className={inputCls} value={shop.address} onChange={e => setShop(s => ({ ...s, address: e.target.value }))} placeholder="Shop no., street, city" />
                </div>
              </>
            )}

            {/* STEP 2: City & rates */}
            {step === 1 && (
              <>
                <div>
                  <label className={labelCls}><MapPin className="w-3 h-3 inline mr-1" />Your bullion market (live rates follow this city)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CITIES.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setCity(c.id)}
                        className={`px-3 py-2 rounded-xl text-left transition-all border ${
                          city === c.id
                            ? 'accent-bg text-white border-transparent shadow-md'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                        }`}
                      >
                        <p className={`text-xs font-extrabold ${city === c.id ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>{c.name}</p>
                        <p className={`text-[10px] font-semibold ${city === c.id ? 'text-white/80' : 'text-slate-400'}`}>{c.state}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Making charges</label>
                    <select className={inputCls} value={making.type} onChange={e => setMaking(m => ({ ...m, type: e.target.value }))}>
                      <option value="PER_GRAM">Per gram (₹/g)</option>
                      <option value="FIXED">Fixed (₹ per piece)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Default value</label>
                    <input type="number" min="0" className={inputCls} value={making.value} onChange={e => setMaking(m => ({ ...m, value: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}><IndianRupee className="w-3 h-3 inline mr-1" />GST %</label>
                    <input type="number" min="0" max="28" step="0.5" className={inputCls} value={gst} onChange={e => setGst(e.target.value)} />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium flex items-start space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                  <span>These defaults pre-fill the Expected Prices calculators and new entries.</span>
                </p>
              </>
            )}

            {/* STEP 3: Look & feel */}
            {step === 2 && (
              <>
                <div>
                  <label className={labelCls}><Palette className="w-3 h-3 inline mr-1" />Brand colour (colours the whole app)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(ACCENT_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        onClick={() => setAccent(key)}
                        className={`relative px-3 py-2.5 rounded-xl border-2 transition-all flex items-center space-x-2 ${
                          accent === key ? 'border-slate-900 dark:border-white shadow-md' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                        style={{ backgroundColor: preset[50] }}
                      >
                        <span className="w-5 h-5 rounded-full shadow-inner" style={{ background: `linear-gradient(135deg, ${preset[500]}, ${preset[700]})` }}></span>
                        <span className="text-[11px] font-extrabold" style={{ color: preset[700] }}>{preset.name}</span>
                        {accent === key && <Check className="w-3.5 h-3.5 absolute top-1.5 right-1.5 text-slate-900 dark:text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Currency symbol</label>
                  <div className="flex flex-wrap gap-2">
                    {CURRENCY_OPTIONS.map(c => (
                      <button
                        key={c.code}
                        onClick={() => setCurrency(c.symbol)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          currency === c.symbol ? 'accent-bg text-white border-transparent shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>App language</label>
                  <div className="flex gap-2">
                    {[{ code: 'en', label: 'English' }, { code: 'hi', label: 'हिंदी' }, { code: 'te', label: 'తెలుగు' }].map(l => (
                      <button
                        key={l.code}
                        onClick={() => setLanguage(l.code)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          language === l.code ? 'accent-bg text-white border-transparent shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* STEP 4: AI assistant */}
            {step === 3 && (
              <>
                <div className="rounded-2xl accent-bg-soft p-4 border accent-border">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                    🤖 <b>{assistantName || 'Jewel AI'}</b> lives on every screen as a floating chat bubble.
                    It answers using <b>your shop's real data</b>: today's live rates, weekly trends, 30-day forecasts,
                    who owes you money, and low-stock alerts. It works fully offline.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Assistant name</label>
                    <input className={inputCls} value={assistantName} onChange={e => setAssistantName(e.target.value)} placeholder="Jewel AI" />
                  </div>
                  <div>
                    <label className={labelCls}>Optional: smarter brain later</label>
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Add a free Gemini / OpenAI key anytime in Shop Preferences → AI Assistant
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {error && <p className="mt-4 text-xs font-bold text-rose-500">{error}</p>}

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={back}
              disabled={step === 0}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700 disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" /> <span>Back</span>
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={next} className="accent-bg flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all">
                <span>Continue</span> <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finish} disabled={isSaving} className="accent-bg flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 disabled:opacity-60 transition-all">
                <PartyPopper className="w-4 h-4" />
                <span>{isSaving ? 'Setting up…' : 'Launch my dashboard'}</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 font-medium mt-4">
          You can change every one of these later in <b>Shop Preferences</b> (⚙️ in the navbar).
        </p>
      </div>
    </div>
  );
}
