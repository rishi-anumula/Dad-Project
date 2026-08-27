import React, { useState, useEffect } from 'react';
import { useLedger } from '../context/LedgerContext';
import { calculateMetalValuation } from '../utils/bullionRatesApi';
import { 
  X, 
  MinusCircle, 
  PlusCircle, 
  Tag, 
  FileText, 
  Calendar, 
  Gem,
  Coins,
  Calculator,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export function AddTransactionModal({ customer, initialType = 'GAVE', isOpen, onClose }) {
  const { addTransaction, bullionRates, selectedCity } = useLedger();

  const [type, setType] = useState(initialType);
  const [itemType, setItemType] = useState('JEWELRY'); // 'GENERAL' | 'JEWELRY'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Gold Jewelry');
  const [jewelryCategory, setJewelryCategory] = useState('Gold Chain');
  const [purity, setPurity] = useState('22K');
  const [netWeightGrams, setNetWeightGrams] = useState('');
  const [makingCharges, setMakingCharges] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [error, setError] = useState('');

  // Get active per gram rate for selected purity
  const activeRatePerGram = React.useMemo(() => {
    if (!bullionRates) return 0;
    switch (purity) {
      case '24K': return bullionRates.gold24k?.perGram || 0;
      case '22K': return bullionRates.gold22k?.perGram || 0;
      case '18K': return bullionRates.gold18k?.perGram || 0;
      case '999 Silver': case 'Silver 999': return bullionRates.silver999?.perGram || 0;
      case '925 Silver': case 'Silver 925': return bullionRates.silver925?.perGram || 0;
      default: return bullionRates.gold22k?.perGram || 0;
    }
  }, [purity, bullionRates]);

  // Auto-calculate live whenever purity, weight, making charges or bullionRates update
  useEffect(() => {
    if (itemType === 'JEWELRY' && netWeightGrams && parseFloat(netWeightGrams) > 0 && bullionRates) {
      const computed = calculateMetalValuation(purity, parseFloat(netWeightGrams), parseFloat(makingCharges) || 0, bullionRates);
      setAmount(computed.toString());
    }
  }, [itemType, purity, netWeightGrams, makingCharges, bullionRates]);

  if (!isOpen || !customer) return null;

  const cityNameCaps = (selectedCity || 'hyderabad').toUpperCase();

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid total amount (> 0)');
      return;
    }

    addTransaction({
      customerId: customer.id,
      type,
      amount: numAmount,
      category: itemType === 'JEWELRY' ? category : 'General Ledger',
      itemType,
      jewelryCategory: itemType === 'JEWELRY' ? jewelryCategory : null,
      purity: itemType === 'JEWELRY' ? purity : null,
      netWeightGrams: itemType === 'JEWELRY' && netWeightGrams ? parseFloat(netWeightGrams) : null,
      makingCharges: itemType === 'JEWELRY' && makingCharges ? parseFloat(makingCharges) : null,
      city: selectedCity,
      appliedRate: activeRatePerGram,
      note: note.trim(),
      date: new Date(date).toISOString()
    });

    setAmount('');
    setNote('');
    setNetWeightGrams('');
    setMakingCharges('');
    setError('');
    onClose();
  };

  const isGave = type === 'GAVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header with Type Toggle */}
        <div className={`p-5 border-b flex items-center justify-between transition-colors ${
          isGave 
            ? 'bg-gave-50 dark:bg-gave-950/50 border-gave-200/60 dark:border-gave-900' 
            : 'bg-got-50 dark:bg-got-950/50 border-got-200/60 dark:border-got-900'
        }`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Entry for {customer.name}
            </span>
            <h3 className={`text-xl font-extrabold ${
              isGave ? 'text-gave-600 dark:text-gave-400' : 'text-got-600 dark:text-got-400'
            }`}>
              {isGave ? "YOU GAVE (Jewelry / Credit)" : "YOU GOT (Payment / Return)"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Type Selector Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('GAVE')}
              className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all ${
                isGave
                  ? 'bg-gave-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>YOU GAVE ₹</span>
            </button>

            <button
              type="button"
              onClick={() => setType('GOT')}
              className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all ${
                !isGave
                  ? 'bg-got-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>YOU GOT ₹</span>
            </button>
          </div>

          {/* Item Type Switcher: Standard vs Jewelry */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Entry Type Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setItemType('JEWELRY')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 ${
                  itemType === 'JEWELRY'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Gem className="w-4 h-4 text-amber-500" />
                <span>Jewelry / Metal Item</span>
              </button>

              <button
                type="button"
                onClick={() => setItemType('GENERAL')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 ${
                  itemType === 'GENERAL'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Tag className="w-4 h-4 text-indigo-500" />
                <span>General Financial Entry</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* JEWELRY SPECIFIC FIELDS */}
          {itemType === 'JEWELRY' && (
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>Jewelry & Metal Specification</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{cityNameCaps} Auto Rate</span>
                </span>
              </div>

              {/* Metal Category & Item Type */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Metal Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value === 'Silver Articles') setPurity('925 Silver');
                      else setPurity('22K');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                  >
                    <option value="Gold Jewelry">Gold Jewelry</option>
                    <option value="Silver Articles">Silver Articles</option>
                    <option value="General Metal">General Metal / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Item Article
                  </label>
                  <select
                    value={jewelryCategory}
                    onChange={(e) => setJewelryCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                  >
                    <option value="Gold Ring">Ring</option>
                    <option value="Gold Chain">Chain</option>
                    <option value="Gold Bangle">Bangle / Bracelet</option>
                    <option value="Gold Necklace">Necklace Set</option>
                    <option value="Coin/Bar">Bullion Coin / Bar</option>
                    <option value="Silver Anklet">Silver Anklet (Payal)</option>
                    <option value="Silver Utensil">Silver Utensil / Article</option>
                  </select>
                </div>
              </div>

              {/* Purity & Net Weight */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Purity
                  </label>
                  <select
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                  >
                    <option value="24K">24K (99.9%)</option>
                    <option value="22K">22K (91.6%)</option>
                    <option value="18K">18K (75.0%)</option>
                    <option value="999 Silver">999 Silver</option>
                    <option value="925 Silver">925 Silver</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Net Weight (g) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10.5"
                    value={netWeightGrams}
                    onChange={(e) => setNetWeightGrams(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Making (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1200"
                    value={makingCharges}
                    onChange={(e) => setMakingCharges(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Applied Domestic Rate Indicator */}
              {bullionRates && (
                <div className="pt-1 text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-center justify-between border-t border-amber-200/40 dark:border-amber-900/30">
                  <span>Applied Benchmark Rate ({cityNameCaps} - {purity}):</span>
                  <span className="font-bold">
                    ₹{activeRatePerGram} / gram
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Amount Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Amount (₹) *
              </label>

              {/* Quick Settle Full Balance Button */}
              {!isGave && customer.netBalance > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAmount(customer.netBalance.toString());
                    setNote(prev => prev || `Full account settlement of ₹${customer.netBalance}`);
                    setError('');
                  }}
                  className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-800 transition-all flex items-center space-x-1 shadow-sm"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Settle Full Balance (₹{customer.netBalance})</span>
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-slate-400 text-lg">
                ₹
              </span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {itemType === 'JEWELRY' && netWeightGrams && parseFloat(netWeightGrams) > 0 && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Calculated: ({netWeightGrams}g × {cityNameCaps} {purity} Rate) + ₹{makingCharges || 0} making charges
              </p>
            )}
          </div>

          {/* Note / Remark */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Remark / Description
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <textarea
                placeholder="e.g. 22K Hallmark Chain (10g), Invoice #204..."
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Date & Time
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white transition-all shadow-md active:scale-98 ${
                isGave
                  ? 'bg-gave-600 hover:bg-gave-700 shadow-gave-500/20'
                  : 'bg-got-600 hover:bg-got-700 shadow-got-500/20'
              }`}
            >
              {isGave ? 'Save YOU GAVE Entry' : 'Save YOU GOT Entry'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

