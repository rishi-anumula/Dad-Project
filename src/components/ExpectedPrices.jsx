import React, { useState, useMemo, useEffect } from 'react';
import { useLedger } from '../context/LedgerContext';
import { usePreferences } from '../context/PreferencesContext';
import {
  Package, Plus, Trash2, Pencil, CalendarClock, IndianRupee,
  TrendingUp, TrendingDown, Check, X, Sparkles, AlertTriangle
} from 'lucide-react';
import { buildSeries, forecastSeries, expectedProductPrice } from '../utils/rateHistory';
import { formatDate } from '../utils/formatters';

const PRODUCTS_KEY = 'khatabook_upcoming_products_v1';

const PURITIES = ['24K', '22K', '18K', '999 Silver', '925 Silver'];
const CATEGORIES = ['Ring', 'Necklace', 'Chain', 'Bangles', 'Earrings', 'Pendant', 'Bracelet', 'Coin/Bar', 'Anklet', 'Other'];

const emptyForm = {
  id: null,
  name: '',
  category: 'Ring',
  purity: '22K',
  netWeightGrams: '',
  makingCharges: '',
  targetDate: '',
  notes: ''
};

function loadProducts() {
  try {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { /* ignore */ }
  return [
    {
      id: 'up_demo_1',
      name: 'Antique Nakshi Haram (Demo)',
      category: 'Necklace',
      purity: '22K',
      netWeightGrams: 45,
      makingCharges: 35000,
      targetDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      notes: 'Wedding season special order — confirm with karigar'
    }
  ];
}

/**
 * Feature: "Expected prices for upcoming products"
 * Shop owner adds products that are in the pipeline (not yet priced/launched).
 * Each shows the expected price TODAY (live rates) vs the expected price on the
 * launch date (AI rate forecast), with a book-now vs wait recommendation.
 */
export function ExpectedPrices() {
  const { bullionRates, selectedCity } = useLedger();
  const { formatMoney, preferences, accentColors } = usePreferences();

  const [products, setProducts] = useState(loadProducts);
  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  // metal series needed per product purity
  const analysis = useMemo(() => {
    const city = selectedCity || 'hyderabad';
    const seriesCache = {};
    const getSeriesFor = (purity) => {
      const key = purity.includes('Silver') ? 'SILVER' : purity;
      if (!seriesCache[key]) {
        const { points } = buildSeries(city, bullionRates, key);
        seriesCache[key] = { points, forecast: forecastSeries(points, Math.max(120, preferences.forecastHorizonDays || 30)) };
      }
      return seriesCache[key];
    };
    return { getSeriesFor };
  }, [bullionRates, selectedCity, preferences.forecastHorizonDays]);

  const priced = useMemo(() => {
    return products.map(p => {
      const { points, forecast } = analysis.getSeriesFor(p.purity);
      const pricing = expectedProductPrice(p, bullionRates, forecast.points, {
        gstPercent: preferences.gstPercent,
        includeGst: preferences.includeGstInPrices
      });
      return { ...p, pricing, historyPoints: points.length };
    });
  }, [products, analysis, bullionRates, preferences.gstPercent, preferences.includeGstInPrices]);

  const totalsToday = priced.reduce((a, p) => a + p.pricing.totalNow, 0);
  const totalsFuture = priced.reduce((a, p) => a + (p.pricing.future?.total || p.pricing.totalNow), 0);

  const openAddForm = () => { setForm(emptyForm); setFormError(''); setIsFormOpen(true); };
  const openEditForm = (p) => {
    setForm({
      id: p.id, name: p.name, category: p.category, purity: p.purity,
      netWeightGrams: String(p.netWeightGrams || ''), makingCharges: String(p.makingCharges || ''),
      targetDate: p.targetDate || '', notes: p.notes || ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const saveProduct = () => {
    if (!form.name.trim()) return setFormError('Please give the product a name.');
    const weight = parseFloat(form.netWeightGrams);
    if (!weight || weight <= 0) return setFormError('Enter the net weight in grams.');
    if (form.targetDate && new Date(form.targetDate) < new Date(new Date().toDateString())) {
      return setFormError('Target date should be in the future.');
    }
    if (form.id) {
      setProducts(prev => prev.map(p => p.id === form.id ? {
        ...p, ...form,
        netWeightGrams: weight,
        makingCharges: parseFloat(form.makingCharges) || 0,
        name: form.name.trim()
      } : p));
    } else {
      setProducts(prev => [{
        id: `up_${Date.now()}`, ...form,
        netWeightGrams: weight,
        makingCharges: parseFloat(form.makingCharges) || 0,
        name: form.name.trim(),
        createdAt: new Date().toISOString()
      }, ...prev]);
    }
    setIsFormOpen(false);
  };

  const removeProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40';

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl accent-bg-soft flex items-center justify-center">
            <Package className="w-4 h-4 accent-text" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Expected Prices — Upcoming Products
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Price new pieces at today's rate vs forecast launch-date rate</p>
          </div>
        </div>

        <button
          onClick={openAddForm}
          className="accent-bg flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Upcoming Product</span>
        </button>
      </div>

      {/* Summary banner */}
      {priced.length > 0 && (
        <div className="glass-card rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center space-x-2">
            <IndianRupee className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {priced.length} upcoming product{priced.length > 1 ? 's' : ''}:
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Cost at <b>today's rates</b>: <span className="text-slate-900 dark:text-white font-extrabold">{formatMoney(totalsToday)}</span>
          </p>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Expected at <b>launch dates</b>: <span className="accent-text font-extrabold">{formatMoney(totalsFuture)}</span>
          </p>
          <p className={`text-xs font-black ${totalsFuture > totalsToday ? 'text-rose-500' : 'text-emerald-500'}`}>
            {totalsFuture > totalsToday ? '▲' : '▼'} {formatMoney(Math.abs(totalsFuture - totalsToday))} difference
          </p>
        </div>
      )}

      {/* Add / Edit form */}
      {isFormOpen && (
        <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-dashed accent-border space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 accent-text" />
              <span>{form.id ? 'Edit upcoming product' : 'New upcoming product'}</span>
            </h4>
            <button onClick={() => setIsFormOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Product name *</label>
              <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Antique Kasu Mala" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Category</label>
              <select className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Purity</label>
              <select className={inputCls} value={form.purity} onChange={e => setForm(f => ({ ...f, purity: e.target.value }))}>
                {PURITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Net weight (g) *</label>
              <input type="number" min="0" step="0.01" className={inputCls} value={form.netWeightGrams} onChange={e => setForm(f => ({ ...f, netWeightGrams: e.target.value }))} placeholder="e.g. 32.5" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Making charges (₹)</label>
              <input type="number" min="0" className={inputCls} value={form.makingCharges} onChange={e => setForm(f => ({ ...f, makingCharges: e.target.value }))} placeholder={String(preferences.defaultMakingChargeValue * (parseFloat(form.netWeightGrams) || 0) | 0)} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Expected launch date</label>
              <input type="date" className={inputCls} value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Notes</label>
              <input className={inputCls} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Customer advance received, karigar confirmed…" />
            </div>
          </div>

          {formError && (
            <p className="text-xs font-bold text-rose-500 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" /> <span>{formError}</span>
            </p>
          )}

          <div className="flex items-center space-x-3 pt-1">
            <button onClick={saveProduct} className="accent-bg flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95">
              <Check className="w-4 h-4" /> <span>{form.id ? 'Save changes' : 'Add product'}</span>
            </button>
            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product cards */}
      {priced.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center shadow-sm">
          <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No upcoming products yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Add pieces in the pipeline to see expected prices before you launch them.</p>
          <button onClick={openAddForm} className="accent-bg inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md">
            <Plus className="w-4 h-4" /> <span>Add your first product</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {priced.map(p => {
            const future = p.pricing.future;
            const delta = future ? future.total - p.pricing.totalNow : 0;
            const deltaPct = p.pricing.totalNow > 0 ? (delta / p.pricing.totalNow) * 100 : 0;
            const goingUp = delta > 0;

            return (
              <div key={p.id} className="glass-card rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
                {/* Row header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{p.name}</h4>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      {p.category} • {p.purity} • {p.netWeightGrams}g net
                      {p.targetDate ? ` • launch ${formatDate(p.targetDate).split(',')[0]}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => openEditForm(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeProduct(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800" title="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Price now vs expected */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/70 p-3 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">At today's rate</p>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">{formatMoney(p.pricing.totalNow)}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                      {formatMoney(p.pricing.ratePerGramNow, { decimals: 0 })}/g metal {formatMoney(p.pricing.metalValueNow)} {preferences.includeGstInPrices ? `+ GST ${preferences.gstPercent}%` : ''}
                    </p>
                  </div>
                  <div className="rounded-xl accent-bg-soft p-3 border accent-border">
                    <p className="text-[10px] font-black uppercase tracking-wider accent-text mb-1 flex items-center space-x-1">
                      <CalendarClock className="w-3 h-3" />
                      <span>{future ? `Expected on ${formatDate(future.date).split(',')[0]}` : 'Add launch date'}</span>
                    </p>
                    <p className="text-base font-extrabold accent-text">{future ? formatMoney(future.total) : '—'}</p>
                    {future && (
                      <p className={`text-[10px] font-bold mt-0.5 ${goingUp ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {goingUp ? '▲' : '▼'} {formatMoney(Math.abs(delta))} ({deltaPct > 0 ? '+' : ''}{deltaPct.toFixed(1)}%) vs today
                        {future.bandLow ? ` • range ${formatMoney(future.bandLow, { decimals: 0 })}–${formatMoney(future.bandHigh, { decimals: 0 })}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Recommendation */}
                {future && (
                  <div className={`mt-3 flex items-start space-x-2 rounded-xl p-2.5 text-[11px] font-semibold ${goingUp
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'}`}>
                    {goingUp ? <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <TrendingDown className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                    <span>
                      {goingUp
                        ? `Rates for ${p.purity} are forecast to rise ~${deltaPct.toFixed(1)}% before launch — consider booking metal / quoting a price to the customer NOW to protect your margin.`
                        : `Rates are forecast to soften ~${Math.abs(deltaPct).toFixed(1)}% — you can wait to buy the metal, but consider quoting a price band (${formatMoney(future.bandLow, { decimals: 0 })}–${formatMoney(future.bandHigh, { decimals: 0 })}) to the customer today.`}
                    </span>
                  </div>
                )}

                {p.notes && <p className="mt-2 text-[11px] text-slate-400 italic">📝 {p.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
