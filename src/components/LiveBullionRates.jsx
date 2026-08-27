import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateMetalValuation } from '../utils/bullionRatesApi';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Coins, 
  Calculator, 
  Clock, 
  Flame,
  Gem,
  Globe,
  Sliders,
  Lock,
  Unlock,
  X,
  Check,
  MapPin,
  Star
} from 'lucide-react';

const CITIES_LIST = [
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', primary: true },
  { id: 'delhi', name: 'Delhi', state: 'NCR', primary: true },
  { id: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', primary: true },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', primary: true },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', primary: false },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', primary: false },
  { id: 'bangalore', name: 'Bengaluru', state: 'Karnataka', primary: false },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', primary: false }
];

export function LiveBullionRates() {
  const { 
    bullionRates, 
    ratesLastUpdated, 
    isRatesLoading, 
    isLiveConnected, 
    refreshRates,
    selectedCity,
    defaultCity,
    changeSelectedCity,
    setDefaultShopCity,
    overrideConfig,
    updateOverrideConfig
  } = useLedger();

  // Calculator state
  const [calcPurity, setCalcPurity] = useState('22K');
  const [calcWeight, setCalcWeight] = useState('10');
  const [calcMaking, setCalcMaking] = useState('1200');

  // Override Modal state
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState({
    isOverride: false,
    gold24kPerGram: 16298,
    gold22kPerGram: 14940,
    gold18kPerGram: 12224,
    silver999PerGram: 265,
    silver925PerGram: 245
  });

  const activeCityObj = CITIES_LIST.find(c => c.id === selectedCity) || CITIES_LIST[0];

  const openOverrideModal = () => {
    setTempConfig({
      isOverride: overrideConfig.isOverride,
      gold24kPerGram: overrideConfig.gold24kPerGram || bullionRates?.gold24k?.perGram || 16298,
      gold22kPerGram: overrideConfig.gold22kPerGram || bullionRates?.gold22k?.perGram || 14940,
      gold18kPerGram: overrideConfig.gold18kPerGram || bullionRates?.gold18k?.perGram || 12224,
      silver999PerGram: overrideConfig.silver999PerGram || bullionRates?.silver999?.perGram || 265,
      silver925PerGram: overrideConfig.silver925PerGram || bullionRates?.silver925?.perGram || 245
    });
    setIsOverrideModalOpen(true);
  };

  const saveOverrideConfig = () => {
    updateOverrideConfig(tempConfig);
    setIsOverrideModalOpen(false);
  };

  if (!bullionRates) {
    return (
      <div className="py-16 text-center">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Fetching live domestic market rates for {activeCityObj.name} (Goodreturns & IBJA)...
        </p>
      </div>
    );
  }

  const { gold24k, gold22k, gold18k, silver999, silver925 } = bullionRates;
  const estimatedValuation = calculateMetalValuation(calcPurity, parseFloat(calcWeight) || 0, parseFloat(calcMaking) || 0, bullionRates);
  const isDefaultCityActive = selectedCity === defaultCity;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Multi-City Selection Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Trading Hub City Selector
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {activeCityObj.name} Market Feed
            </span>
          </div>
        </div>

        {/* Quick Filter City Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-wrap gap-y-1">
          {CITIES_LIST.map((city) => (
            <button
              key={city.id}
              onClick={() => changeSelectedCity(city.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1 ${
                selectedCity === city.id
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span>{city.name}</span>
              {defaultCity === city.id && <Star className="w-3 h-3 fill-white text-white ml-0.5" />}
            </button>
          ))}
        </div>

        {/* Set Default Shop City Action */}
        <button
          onClick={() => setDefaultShopCity(selectedCity)}
          disabled={isDefaultCityActive}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isDefaultCityActive
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 cursor-default'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isDefaultCityActive ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
          <span>{isDefaultCityActive ? 'Default Shop City' : `Set ${activeCityObj.name} as Default`}</span>
        </button>

      </div>
      
      {/* Header Banner */}
      <div className={`glass-card rounded-3xl p-6 relative overflow-hidden border transition-all ${
        overrideConfig.isOverride
          ? 'bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-purple-600/10 border-purple-300/60 dark:border-purple-900/40'
          : 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-600/10 border-amber-200/60 dark:border-amber-900/40'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              overrideConfig.isOverride
                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-purple-500/20'
                : 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/20'
            }`}>
              {overrideConfig.isOverride ? <Lock className="w-7 h-7" /> : <Coins className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {overrideConfig.isOverride ? `${activeCityObj.name} Shop Benchmark (Locked)` : `${activeCityObj.name} Live Market Bullion Rates`}
                </h2>
                <span className={`flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  overrideConfig.isOverride
                    ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : isLiveConnected 
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${overrideConfig.isOverride ? 'bg-purple-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                  <span>{overrideConfig.isOverride ? '🔒 Manual City Lock Active' : `🟢 ${activeCityObj.name} Live Feed`}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center space-x-2 flex-wrap gap-1">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{overrideConfig.isOverride ? 'Local Jeweler Association Lock' : `Last Refreshed: ${ratesLastUpdated ? formatDate(ratesLastUpdated) : 'Just now'}`}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 text-slate-500">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{activeCityObj.name} Bullion & Goodreturns Feed</span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <button
              onClick={openOverrideModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shadow-md active:scale-95 transition-all"
            >
              <Sliders className="w-4 h-4 text-amber-400 dark:text-amber-600" />
              <span>Set {activeCityObj.name} Shop Rate</span>
            </button>

            <button
              onClick={() => refreshRates(selectedCity)}
              disabled={isRatesLoading || overrideConfig.isOverride}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-amber-500 ${isRatesLoading ? 'animate-spin' : ''}`} />
              <span>{isRatesLoading ? 'Syncing...' : 'Refresh Rates'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Gold Rates Section */}
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>{activeCityObj.name} Gold Rates (INR)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 24K Gold Card */}
          <div className="glass-card rounded-2xl p-5 border-amber-200/50 dark:border-amber-900/30 hover:border-amber-500/50 transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500 text-white shadow-sm">
                    24K
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    99.9% Fine Gold
                  </h4>
                </div>

                {gold24k.change && !overrideConfig.isOverride && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                    gold24k.change.isUp 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  }`}>
                    {gold24k.change.isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{gold24k.change.diff >= 0 ? `+₹${gold24k.change.diff}` : `-₹${Math.abs(gold24k.change.diff)}`} ({gold24k.change.isUp ? '+' : ''}{gold24k.change.percent}%)</span>
                  </span>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">1 Gram (1g)</span>
                  <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                    {formatCurrency(gold24k.perGram)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">8 Grams (1 Sovereign / Pavan)</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(gold24k.per8g || gold24k.perGram * 8)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">10 Grams</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(gold24k.per10g)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 22K Gold Card */}
          <div className="glass-card rounded-2xl p-5 border-amber-200/50 dark:border-amber-900/30 hover:border-amber-500/50 transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-600 text-white shadow-sm">
                    22K
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    91.6% Hallmark Gold
                  </h4>
                </div>

                {gold22k.change && !overrideConfig.isOverride && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                    gold22k.change.isUp 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  }`}>
                    {gold22k.change.isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{gold22k.change.diff >= 0 ? `+₹${gold22k.change.diff}` : `-₹${Math.abs(gold22k.change.diff)}`} ({gold22k.change.isUp ? '+' : ''}{gold22k.change.percent}%)</span>
                  </span>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">1 Gram (1g)</span>
                  <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                    {formatCurrency(gold22k.perGram)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">8 Grams (1 Sovereign / Pavan)</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(gold22k.per8g || gold22k.perGram * 8)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">10 Grams</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(gold22k.per10g)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 18K Gold Card */}
          <div className="glass-card rounded-2xl p-5 border-amber-200/50 dark:border-amber-900/30 hover:border-amber-500/50 transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-700 text-white shadow-sm">
                    18K
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    75.0% Jewelry Gold
                  </h4>
                </div>

                {gold18k.change && !overrideConfig.isOverride && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                    gold18k.change.isUp 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  }`}>
                    {gold18k.change.isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{gold18k.change.diff >= 0 ? `+₹${gold18k.change.diff}` : `-₹${Math.abs(gold18k.change.diff)}`} ({gold18k.change.isUp ? '+' : ''}{gold18k.change.percent}%)</span>
                  </span>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">1 Gram (1g)</span>
                  <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                    {formatCurrency(gold18k.perGram)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">8 Grams (1 Sovereign / Pavan)</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(gold18k.per8g || gold18k.perGram * 8)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">10 Grams</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(gold18k.per10g)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Silver Rates Section */}
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-2">
          <Gem className="w-4 h-4 text-slate-400" />
          <span>{activeCityObj.name} Silver Rates (INR)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Fine Silver 999 Card */}
          <div className="glass-card rounded-2xl p-5 border-slate-300/60 dark:border-slate-800 hover:border-slate-400 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-700 text-white shadow-sm">
                  999 Silver
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Fine Silver (99.9%)
                </h4>
              </div>

              {silver999.change && !overrideConfig.isOverride && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                  silver999.change.isUp 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                }`}>
                  {silver999.change.isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{silver999.change.diff >= 0 ? `+₹${silver999.change.diff}` : `-₹${Math.abs(silver999.change.diff)}`} ({silver999.change.isUp ? '+' : ''}{silver999.change.percent}%)</span>
                </span>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Rate per Gram (1g)</span>
                <span className="text-lg font-extrabold text-slate-700 dark:text-slate-300">
                  {formatCurrency(silver999.perGram)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Rate per 100 Grams (100g)</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(silver999.per100g || silver999.perGram * 100)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Rate per 1 KG (1,000g)</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(silver999.perKg)}
                </span>
              </div>
            </div>
          </div>

          {/* Sterling Silver 925 Card */}
          <div className="glass-card rounded-2xl p-5 border-slate-300/60 dark:border-slate-800 hover:border-slate-400 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-600 text-white shadow-sm">
                  925 Silver
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Sterling Silver (92.5%)
                </h4>
              </div>

              {silver925.change && !overrideConfig.isOverride && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                  silver925.change.isUp 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                }`}>
                  {silver925.change.isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{silver925.change.diff >= 0 ? `+₹${silver925.change.diff}` : `-₹${Math.abs(silver925.change.diff)}`} ({silver925.change.isUp ? '+' : ''}{silver925.change.percent}%)</span>
                </span>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Rate per Gram (1g)</span>
                <span className="text-lg font-extrabold text-slate-700 dark:text-slate-300">
                  {formatCurrency(silver925.perGram)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Rate per 100 Grams (100g)</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(silver925.per100g || silver925.perGram * 100)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Rate per 1 KG (1,000g)</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(silver925.perKg)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Metal Valuation Calculator Tool */}
      <div className="glass-card rounded-3xl p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center space-x-2 mb-4">
          <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {activeCityObj.name} Metal Valuation Calculator
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Select Purity
            </label>
            <select
              value={calcPurity}
              onChange={(e) => setCalcPurity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="24K">24K Fine Gold (99.9%)</option>
              <option value="22K">22K Standard Gold (91.6%)</option>
              <option value="18K">18K Jewelry Gold (75.0%)</option>
              <option value="999 Silver">999 Fine Silver (99.9%)</option>
              <option value="925 Silver">925 Sterling Silver (92.5%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Net Weight (Grams)
            </label>
            <input
              type="number"
              step="0.01"
              value={calcWeight}
              onChange={(e) => setCalcWeight(e.target.value)}
              placeholder="e.g. 10.5"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Making Charges / Wastage (₹)
            </label>
            <input
              type="number"
              value={calcMaking}
              onChange={(e) => setCalcMaking(e.target.value)}
              placeholder="e.g. 1200"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Calculated Result Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-indigo-500/15 border border-amber-300/50 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
              Estimated {activeCityObj.name} Market Valuation:
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Based on {calcPurity} @ {activeCityObj.name} rate + ₹{calcMaking || 0} making charges
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(estimatedValuation)}
            </span>
          </div>
        </div>

      </div>

      {/* Admin Manual Override Modal */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Set {activeCityObj.name} Shop Rate Override
                </h3>
              </div>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Mode Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div>
                  <span className="text-xs font-extrabold uppercase text-slate-800 dark:text-slate-200 block">
                    {activeCityObj.name} Sync Mode
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {tempConfig.isOverride ? "Shop Lock Active (Local Association)" : `Auto-Sync with ${activeCityObj.name} Live Market`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setTempConfig(prev => ({ ...prev, isOverride: !prev.isOverride }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    tempConfig.isOverride
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-emerald-600 text-white shadow-sm'
                  }`}
                >
                  {tempConfig.isOverride ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{tempConfig.isOverride ? 'Manual Lock ON' : 'Live Auto-Sync ON'}</span>
                </button>
              </div>

              {/* Rate Inputs */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  {activeCityObj.name} Custom Rates (₹ per 1 Gram)
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    24K Gold Rate (₹/g)
                  </label>
                  <input
                    type="number"
                    value={tempConfig.gold24kPerGram}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setTempConfig(prev => ({
                        ...prev,
                        gold24kPerGram: val,
                        gold22kPerGram: +(val * 0.916).toFixed(2),
                        gold18kPerGram: +(val * 0.750).toFixed(2)
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      22K Gold Rate (₹/g)
                    </label>
                    <input
                      type="number"
                      value={tempConfig.gold22kPerGram}
                      onChange={(e) => setTempConfig(prev => ({ ...prev, gold22kPerGram: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      18K Gold Rate (₹/g)
                    </label>
                    <input
                      type="number"
                      value={tempConfig.gold18kPerGram}
                      onChange={(e) => setTempConfig(prev => ({ ...prev, gold18kPerGram: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      999 Fine Silver (₹/g)
                    </label>
                    <input
                      type="number"
                      value={tempConfig.silver999PerGram}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setTempConfig(prev => ({
                          ...prev,
                          silver999PerGram: val,
                          silver925PerGram: +(val * 0.925).toFixed(2)
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      925 Sterling Silver (₹/g)
                    </label>
                    <input
                      type="number"
                      value={tempConfig.silver925PerGram}
                      onChange={(e) => setTempConfig(prev => ({ ...prev, silver925PerGram: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Save Controls */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={saveOverrideConfig}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Lock {activeCityObj.name} Rates</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}


