import React, { useState, useEffect } from 'react';
import { useLedger } from '../context/LedgerContext';
import { calculateMetalValuation } from '../utils/bullionRatesApi';
import { X, User, Phone, MapPin, Tag, Check, Gem, Weight, Coins, Calculator } from 'lucide-react';

export function AddCustomerModal({ isOpen, onClose, onCustomerCreated }) {
  const { addCustomer, addTransaction, bullionRates, selectedCity } = useLedger();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tag, setTag] = useState('Regular Customer');
  
  // Item Article & Weight fields
  const [itemName, setItemName] = useState('');
  const [itemWeightGrams, setItemWeightGrams] = useState('');
  const [purity, setPurity] = useState('22K');
  const [makingCharges, setMakingCharges] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [error, setError] = useState('');

  // Auto calculate initial item valuation
  useEffect(() => {
    if (itemWeightGrams && parseFloat(itemWeightGrams) > 0 && bullionRates) {
      const computed = calculateMetalValuation(purity, parseFloat(itemWeightGrams), parseFloat(makingCharges) || 0, bullionRates);
      setInitialAmount(computed.toString());
    } else {
      setInitialAmount('');
    }
  }, [purity, itemWeightGrams, makingCharges, bullionRates]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Customer name is required.');
      return;
    }

    const newCustomer = addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      tag,
      initialItem: itemName.trim() || null,
      initialWeightGrams: itemWeightGrams ? parseFloat(itemWeightGrams) : null,
      purity: purity || '22K'
    });

    // If an initial item or weight is specified, auto-log initial GAVE jewelry transaction
    const weightNum = parseFloat(itemWeightGrams);
    const amountNum = parseFloat(initialAmount);
    if ((itemName.trim() || weightNum > 0) && amountNum > 0) {
      addTransaction({
        customerId: newCustomer.id,
        type: 'GAVE',
        amount: amountNum,
        category: 'Gold Jewelry',
        itemType: 'JEWELRY',
        jewelryCategory: itemName.trim() || 'Gold Item',
        purity: purity,
        netWeightGrams: weightNum > 0 ? weightNum : null,
        makingCharges: makingCharges ? parseFloat(makingCharges) : null,
        city: selectedCity,
        note: `Initial Entry: ${itemName.trim() || 'Jewelry Item'} (${weightNum || 0}g)`,
        date: new Date().toISOString()
      });
    }

    // Reset form
    setName('');
    setPhone('');
    setAddress('');
    setTag('Regular Customer');
    setItemName('');
    setItemWeightGrams('');
    setPurity('22K');
    setMakingCharges('');
    setInitialAmount('');
    setError('');

    if (onCustomerCreated) {
      onCustomerCreated(newCustomer);
    }
    onClose();
  };

  const cityNameCaps = (selectedCity || 'hyderabad').toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Add New Customer & Initial Item
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Customer Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                autoFocus
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Mobile Number (WhatsApp)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* JEWELRY ITEM & WEIGHT SPECIFICATION (NEW COLUMNS) */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Initial Jewelry Item & Weight</span>
              </div>
              <span className="text-[10px] bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded font-bold">
                Optional
              </span>
            </div>

            {/* Item Name Column & Weight Column */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Item Article / Name
                </label>
                <div className="relative">
                  <Gem className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <input
                    type="text"
                    placeholder="e.g. Gold Chain, Ring"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Item Weight (Grams)
                </label>
                <div className="relative">
                  <Weight className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10.5"
                    value={itemWeightGrams}
                    onChange={(e) => setItemWeightGrams(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Purity & Making Charges */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Purity
                </label>
                <select
                  value={purity}
                  onChange={(e) => setPurity(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                >
                  <option value="24K">24K (99.9%)</option>
                  <option value="22K">22K (91.6%)</option>
                  <option value="18K">18K (75.0%)</option>
                  <option value="999 Silver">999 Silver</option>
                  <option value="925 Silver">925 Silver</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Making (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1200"
                  value={makingCharges}
                  onChange={(e) => setMakingCharges(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Initial Value (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold text-amber-600 dark:text-amber-400"
                />
              </div>
            </div>

            {itemWeightGrams && parseFloat(itemWeightGrams) > 0 && bullionRates && (
              <div className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold flex items-center justify-between pt-1 border-t border-amber-200/50">
                <span>Calculated via {cityNameCaps} {purity} Rate:</span>
                <span>₹{initialAmount || 0}</span>
              </div>
            )}
          </div>

          {/* Tag Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Customer Tag
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Regular Customer', 'VIP Client', 'Wholesale Buyer', 'Supplier'].map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTag(t)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                    tag === t
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span>{t}</span>
                  {tag === t && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Address / Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Address / Notes (Optional)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <textarea
                placeholder="Shop address, landmark, or specific instructions..."
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all shadow-md shadow-indigo-500/20"
            >
              Save Customer & Ledger Entry
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

