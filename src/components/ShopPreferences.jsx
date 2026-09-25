import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLedger } from '../context/LedgerContext';
import { usePreferences, ACCENT_PRESETS, CURRENCY_OPTIONS } from '../context/PreferencesContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowLeft, Store, Palette, Receipt, Bot, Save, Check, MapPin,
  RotateCcw, ShieldCheck, Sparkles, Info, Languages, Moon, Sun, Eye
} from 'lucide-react';

const CITIES = [
  { id: 'hyderabad', name: 'Hyderabad' }, { id: 'vijayawada', name: 'Vijayawada' },
  { id: 'mumbai', name: 'Mumbai' }, { id: 'delhi', name: 'Delhi NCR' },
  { id: 'chennai', name: 'Chennai' }, { id: 'bangalore', name: 'Bengaluru' },
  { id: 'kolkata', name: 'Kolkata' }, { id: 'ahmedabad', name: 'Ahmedabad' }
];

const SECTIONS = [
  { id: 'profile', label: 'Shop Profile', icon: Store },
  { id: 'appearance', label: 'Look & Feel', icon: Palette },
  { id: 'billing', label: 'Billing & Rates', icon: Receipt },
  { id: 'ai', label: 'AI Assistant', icon: Bot }
];

/**
 * Feature: "Shop preferences -> UI"
 * Central settings page — everything here is applied live across the app.
 */
export function ShopPreferences() {
  const navigate = useNavigate();
  const { user, shopProfile, updateShopProfile } = useAuth();
  const { businessName, setBusinessName, darkMode, setDarkMode, defaultCity, setDefaultShopCity } = useLedger();
  const { preferences, updatePreferences, resetPreferences } = usePreferences();
  const { language, setLanguage } = useLanguage();

  const [activeSection, setActiveSection] = useState('profile');
  const [savedFlash, setSavedFlash] = useState('');

  const [profile, setProfile] = useState({
    shopName: shopProfile?.shopName || businessName,
    tagline: preferences.tagline,
    ownerName: shopProfile?.ownerName || '',
    ownerPhone: shopProfile?.ownerPhone || '',
    address: shopProfile?.address || '',
    gstin: shopProfile?.gstin || ''
  });

  const flashSaved = (msg = 'Saved ✓ Applied across the app') => {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(''), 2500);
  };

  const saveProfile = async () => {
    if (!profile.shopName.trim()) return;
    await updateShopProfile({
      shopName: profile.shopName.trim(),
      ownerName: profile.ownerName,
      ownerPhone: profile.ownerPhone,
      address: profile.address,
      gstin: profile.gstin
    });
    setBusinessName(profile.shopName.trim());
    updatePreferences({ tagline: profile.tagline.trim() });
    flashSaved('Shop profile updated ✓');
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all';
  const labelCls = 'block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pt-[env(safe-area-inset-top,0px)]">
      {/* Header */}
      <header className="glass-card border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-black">Shop Preferences</h1>
              <p className="text-[11px] text-slate-400 font-semibold">Personalise how JewelLedger looks & works</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { resetPreferences(); flashSaved('Preferences reset to defaults ✓'); }}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset defaults
            </button>
            {savedFlash && (
              <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 rounded-xl animate-fade-in">
                <Check className="w-3.5 h-3.5" /> {savedFlash}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[220px,1fr] gap-6">

        {/* Section nav */}
        <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1" style={{ scrollbarWidth: 'none' }}>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSection === s.id
                  ? 'accent-bg text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-800'
              }`}
            >
              <s.icon className="w-4 h-4" />
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        {/* Panels */}
        <div className="space-y-5 animate-fade-in">

          {/* ---------------- PROFILE ---------------- */}
          {activeSection === 'profile' && (
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-extrabold flex items-center space-x-2">
                <Store className="w-4 h-4 accent-text" /> Shop Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Shop name</label>
                  <input className={inputCls} value={profile.shopName} onChange={e => setProfile(p => ({ ...p, shopName: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Tagline (navbar subtitle)</label>
                  <input className={inputCls} value={profile.tagline} onChange={e => setProfile(p => ({ ...p, tagline: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Owner name</label>
                  <input className={inputCls} value={profile.ownerName} onChange={e => setProfile(p => ({ ...p, ownerName: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Owner phone</label>
                  <input className={inputCls} value={profile.ownerPhone} onChange={e => setProfile(p => ({ ...p, ownerPhone: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Shop address</label>
                  <input className={inputCls} value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>GSTIN</label>
                  <input className={inputCls} value={profile.gstin} onChange={e => setProfile(p => ({ ...p, gstin: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Signed in as</label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{user?.email || user?.name || shopProfile?.ownerPhone || 'Local account'}</span>
                  </div>
                </div>
              </div>
              <button onClick={saveProfile} className="accent-bg flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95">
                <Save className="w-4 h-4" /> Save shop profile
              </button>
            </div>
          )}

          {/* ---------------- APPEARANCE ---------------- */}
          {activeSection === 'appearance' && (
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
              <h3 className="text-sm font-extrabold flex items-center space-x-2">
                <Palette className="w-4 h-4 accent-text" /> Look & Feel
                <span className="text-[10px] font-bold text-slate-400 normal-case tracking-normal">(applied instantly ✨)</span>
              </h3>

              <div>
                <label className={labelCls}>Brand accent colour</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(ACCENT_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => { updatePreferences({ accent: key }); flashSaved(`${preset.name} theme applied ✓`); }}
                      className={`relative flex items-center space-x-2.5 px-3 py-3 rounded-xl border-2 transition-all ${
                        preferences.accent === key ? 'border-slate-900 dark:border-white shadow-md' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                      style={{ backgroundColor: preset[50] }}
                    >
                      <span className="w-6 h-6 rounded-full shadow" style={{ background: `linear-gradient(135deg, ${preset[500]}, ${preset[700]})` }}></span>
                      <span className="text-xs font-extrabold" style={{ color: preset[700] }}>{preset.name}</span>
                      {preferences.accent === key && <Check className="w-4 h-4 absolute top-2 right-2 text-slate-900 dark:text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Theme mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDarkMode(false)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        !darkMode ? 'accent-bg text-white border-transparent shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      <Sun className="w-4 h-4" /> Light
                    </button>
                    <button
                      onClick={() => setDarkMode(true)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        darkMode ? 'accent-bg text-white border-transparent shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      <Moon className="w-4 h-4" /> Dark
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}><Languages className="w-3 h-3 inline mr-1" />App language</label>
                  <div className="flex gap-2">
                    {[{ code: 'en', label: 'English' }, { code: 'hi', label: 'हिंदी' }, { code: 'te', label: 'తెలుగు' }].map(l => (
                      <button
                        key={l.code}
                        onClick={() => setLanguage(l.code)}
                        className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          language === l.code ? 'accent-bg text-white border-transparent shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Currency symbol</label>
                <select
                  className={inputCls}
                  value={preferences.currency}
                  onChange={e => { updatePreferences({ currency: e.target.value }); flashSaved('Currency updated ✓'); }}
                >
                  {CURRENCY_OPTIONS.map(c => <option key={c.code} value={c.symbol}>{c.label}</option>)}
                </select>
              </div>

              {/* Live preview */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1">
                  <Eye className="w-3 h-3" /> Live preview
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl accent-grad flex items-center justify-center shadow accent-glow">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{profile.shopName || 'Your Shop'}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">{profile.tagline || 'Your tagline here'}</p>
                  </div>
                  <span className="ml-auto accent-bg text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow">₹ Sample Button</span>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- BILLING & RATES ---------------- */}
          {activeSection === 'billing' && (
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
              <h3 className="text-sm font-extrabold flex items-center space-x-2">
                <Receipt className="w-4 h-4 accent-text" /> Billing & Rate Defaults
              </h3>

              <div>
                <label className={labelCls}><MapPin className="w-3 h-3 inline mr-1" />Default bullion city (drives Live Rates)</label>
                <select
                  className={inputCls}
                  value={defaultCity}
                  onChange={(e) => { setDefaultShopCity(e.target.value); flashSaved(`Live rates now follow ${CITIES.find(c => c.id === e.target.value)?.name} ✓`); }}
                >
                  {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Making charge type</label>
                  <select
                    className={inputCls}
                    value={preferences.defaultMakingChargeType}
                    onChange={e => updatePreferences({ defaultMakingChargeType: e.target.value })}
                  >
                    <option value="PER_GRAM">Per gram (₹/g)</option>
                    <option value="FIXED">Fixed (₹ per piece)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Default making charge</label>
                  <input
                    type="number" min="0"
                    className={inputCls}
                    value={preferences.defaultMakingChargeValue}
                    onChange={e => updatePreferences({ defaultMakingChargeValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className={labelCls}>GST %</label>
                  <input
                    type="number" min="0" max="28" step="0.5"
                    className={inputCls}
                    value={preferences.gstPercent}
                    onChange={e => updatePreferences({ gstPercent: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <label className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 cursor-pointer">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Include GST in Expected Prices totals</span>
                <button
                  onClick={() => updatePreferences({ includeGstInPrices: !preferences.includeGstInPrices })}
                  className={`w-11 h-6 rounded-full relative transition-colors ${preferences.includeGstInPrices ? 'accent-bg' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${preferences.includeGstInPrices ? 'left-[22px]' : 'left-0.5'}`}></span>
                </button>
              </label>

              <div>
                <label className={labelCls}>Forecast horizon for trends & expected prices</label>
                <div className="flex gap-2">
                  {[7, 15, 30, 60].map(d => (
                    <button
                      key={d}
                      onClick={() => updatePreferences({ forecastHorizonDays: d })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        preferences.forecastHorizonDays === d ? 'accent-bg text-white border-transparent shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {d} days
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-2 text-[11px] text-slate-400 font-medium bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl p-3">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
                <p>Making charge & GST defaults pre-fill the <b>Expected Prices</b> calculators on the Live Rates tab. Manual rate override is available on the Live Rates tab itself.</p>
              </div>
            </div>
          )}

          {/* ---------------- AI ---------------- */}
          {activeSection === 'ai' && (
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
              <h3 className="text-sm font-extrabold flex items-center space-x-2">
                <Bot className="w-4 h-4 accent-text" /> AI Assistant
              </h3>

              <div className="rounded-2xl accent-bg-soft border accent-border p-4">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1 accent-text" />
                  The assistant works <b>fully offline</b> by default — answering from your ledger, live rates, trends and forecasts.
                  Optionally connect a free LLM API key below for open-ended conversation (your shop data is sent only to the provider you choose).
                </p>
              </div>

              <div>
                <label className={labelCls}>Assistant name</label>
                <input
                  className={inputCls}
                  value={preferences.assistantName}
                  onChange={e => updatePreferences({ assistantName: e.target.value })}
                  placeholder="Jewel AI"
                />
              </div>

              <div>
                <label className={labelCls}>Brain</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'local', label: 'Built-in', sub: 'Offline • Free', emoji: '⚡' },
                    { id: 'gemini', label: 'Gemini', sub: 'Google AI key', emoji: '✨' },
                    { id: 'openai', label: 'OpenAI', sub: 'GPT key', emoji: '🤖' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => updatePreferences({ chatProvider: opt.id, chatModel: opt.id === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash' })}
                      className={`px-3 py-3 rounded-xl text-center border-2 transition-all ${
                        preferences.chatProvider === opt.id ? 'accent-bg text-white border-transparent shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <p className={`text-lg ${preferences.chatProvider === opt.id ? '' : 'grayscale'}`}>{opt.emoji}</p>
                      <p className={`text-xs font-extrabold ${preferences.chatProvider === opt.id ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{opt.label}</p>
                      <p className={`text-[10px] font-semibold ${preferences.chatProvider === opt.id ? 'text-white/80' : 'text-slate-400'}`}>{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {preferences.chatProvider !== 'local' && (
                <>
                  <div>
                    <label className={labelCls}>API key</label>
                    <input
                      type="password"
                      className={inputCls}
                      value={preferences.chatApiKey}
                      onChange={e => updatePreferences({ chatApiKey: e.target.value })}
                      placeholder={preferences.chatProvider === 'gemini' ? 'Paste your Google AI Studio key (aistudio.google.com)' : 'Paste your OpenAI key (platform.openai.com)'}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Model</label>
                    <select
                      className={inputCls}
                      value={preferences.chatModel}
                      onChange={e => updatePreferences({ chatModel: e.target.value })}
                    >
                      {(preferences.chatProvider === 'gemini'
                        ? ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash']
                        : ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini']
                      ).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Key is stored only on this device. If the API fails, the offline brain answers instead.
                  </p>
                </>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
