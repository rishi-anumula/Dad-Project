import React, { useState, useEffect, useMemo } from 'react';
import { useLedger } from '../context/LedgerContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatters';
import { 
  X, 
  Search, 
  Gem, 
  Scale, 
  IndianRupee, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Percent,
  CreditCard,
  Wallet,
  ShoppingBag,
  Layers,
  ChevronDown
} from 'lucide-react';

function CatalogDropdownRow({ item, onSelect }) {
  const { t } = useLanguage();
  return (
    <div
      onClick={() => onSelect(item)}
      className="p-3 hover:bg-amber-50 dark:hover:bg-amber-950/60 cursor-pointer flex items-center justify-between transition-colors"
    >
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
            {item.name}
          </span>
          <span className="text-[10px] px-2 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold">
            {item.purity || '22K'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          {t('jewelry.netWeightGrams')}: {item.netWeightGrams}g • {t('itemsCatalog.stock')}: {item.stockQty || 0} {t('itemsCatalog.pcs')}
        </span>
      </div>
      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
        {formatCurrency(item.fixedUnitPrice || item.price || 0)}
      </span>
    </div>
  );
}

export function AddJewelryItemSaleModal({ customer, isOpen, onClose }) {
  const { inventoryItems = [], addJewelrySale, bullionRates } = useLedger();
  const { t } = useLanguage();

  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [netWeightGrams, setNetWeightGrams] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [purity, setPurity] = useState('22K');
  const [paymentType, setPaymentType] = useState('UNPAID');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [itemSearchText, setItemSearchText] = useState('');

  const filteredCatalogItems = useMemo(() => {
    const safeItems = Array.isArray(inventoryItems) ? inventoryItems : [];
    if (!itemSearchText.trim()) return safeItems;
    return safeItems.filter(item =>
      item.name.toLowerCase().includes(itemSearchText.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(itemSearchText.toLowerCase())) ||
      (item.purity && item.purity.toLowerCase().includes(itemSearchText.toLowerCase()))
    );
  }, [inventoryItems, itemSearchText]);

  const computedFinalAmount = useMemo(() => {
    const p = parseFloat(basePrice) || 0;
    const d = parseFloat(discount) || 0;
    return Math.max(0, p - d);
  }, [basePrice, discount]);

  useEffect(() => {
    if (paymentType === 'PAID') {
      setPaidAmount(computedFinalAmount.toString());
    } else {
      setPaidAmount('0');
    }
  }, [paymentType, computedFinalAmount]);

  const handleSelectItem = (item) => {
    setSelectedItemId(item.id);
    setItemName(item.name);
    setNetWeightGrams(item.netWeightGrams !== undefined ? item.netWeightGrams.toString() : '');
    const priceVal = item.fixedUnitPrice || item.price || 0;
    setBasePrice(priceVal.toString());
    setPurity(item.purity || '22K');
    setIsDropdownOpen(false);
    setItemSearchText('');
    setError('');
    setNote(`Jewelry Sale: ${item.name} (${item.netWeightGrams}g ${item.purity || ''})`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!itemName.trim()) {
      setError('Please select or enter an Item Name.');
      return;
    }

    const parsedWeight = parseFloat(netWeightGrams);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      setError('Please enter a valid net weight (e.g. 8.450g).');
      return;
    }

    if (computedFinalAmount <= 0) {
      setError('Please enter a valid final price (> 0).');
      return;
    }

    const finalPaid = paymentType === 'PAID' 
      ? (paidAmount ? parseFloat(paidAmount) : computedFinalAmount)
      : 0;

    const paymentStatusTag = paymentType === 'PAID' ? 'FULL' : 'DUE';

    addJewelrySale({
      customerId: customer.id,
      inventoryItemId: selectedItemId || null,
      itemName: itemName.trim(),
      purity,
      netWeightGrams: parsedWeight,
      grossWeightGrams: parsedWeight,
      makingCharges: 0,
      discount: parseFloat(discount) || 0,
      totalAmount: computedFinalAmount,
      paidAmount: finalPaid,
      paymentStatus: paymentStatusTag,
      paymentMethod: paymentType === 'PAID' ? paymentMethod : 'Credit',
      note: note.trim() || `${itemName} (Weight: ${parsedWeight}g) — ${paymentType === 'PAID' ? 'Paid' : 'Credit / Unpaid'}`
    });

    onClose();
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200">
                {t('jewelrySaleModal.subtitle')} • {customer.name}
              </span>
              <h3 className="text-lg font-black tracking-tight text-white">
                {t('jewelrySaleModal.title')}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center space-x-2 text-xs font-bold text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Item Selector Dropdown / Autocomplete */}
          <div className="relative">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              {t('jewelrySaleModal.selectCatalogItem')}
            </label>
            
            {/* Custom Dropdown Trigger */}
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/30 hover:border-amber-400 cursor-pointer flex items-center justify-between transition-all"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Gem className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {itemName || t('jewelrySaleModal.searchCatalogPrompt')}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </div>

            {/* Dropdown Menu Popover */}
            {isDropdownOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-60 flex flex-col animate-fade-in">
                {/* Search Bar in Dropdown */}
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('jewelrySaleModal.itemSearchPlaceholder')}
                      value={itemSearchText}
                      onChange={(e) => setItemSearchText(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredCatalogItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      {t('itemsCatalog.noItemsFound')}
                    </div>
                  ) : (
                    filteredCatalogItems.map((item) => (
                      <CatalogDropdownRow
                        key={item.id}
                        item={item}
                        onSelect={handleSelectItem}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AUTO-FILLED / EDITABLE FIELDS */}

          {/* Item Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              {t('jewelrySaleModal.itemNameAuto')}
            </label>
            <input
              type="text"
              required
              placeholder='e.g. "22K Gold Chain"'
              value={itemName}
              onChange={(e) => { setItemName(e.target.value); setError(''); }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Grid: Net Weight & Purity */}
          <div className="grid grid-cols-2 gap-3">
            {/* Net Weight (g) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {t('jewelry.netWeightGrams')} *
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="0.001"
                  required
                  placeholder="e.g. 8.450"
                  value={netWeightGrams}
                  onChange={(e) => { setNetWeightGrams(e.target.value); setError(''); }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Purity */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {t('jewelry.purity')}
              </label>
              <select
                value={purity}
                onChange={(e) => setPurity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold"
              >
                <option value="24K">{t('jewelry.purity24k')}</option>
                <option value="22K">{t('jewelry.purity22k')}</option>
                <option value="18K">{t('jewelry.purity18k')}</option>
                <option value="925 Silver">{t('jewelry.purity925Silver')}</option>
                <option value="999 Silver">{t('jewelry.purity999Silver')}</option>
              </select>
            </div>
          </div>

          {/* Pricing Adjustments */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>{t('jewelry.basePrice')}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Auto-Calculated</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Base Price */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  {t('jewelry.basePrice')} *
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 65000"
                    value={basePrice}
                    onChange={(e) => { setBasePrice(e.target.value); setError(''); }}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Discount (₹) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  {t('jewelry.discount')}
                </label>
                <div className="relative">
                  <Percent className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Total Payable Display */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 text-sm">
              <span className="font-extrabold text-slate-700 dark:text-slate-300">{t('jewelry.finalBillAmount')}</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(computedFinalAmount)}
              </span>
            </div>
          </div>

          {/* 3. Transaction Type Selector: Due / Credit vs Paid */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t('jewelrySaleModal.paymentStatusTitle')}
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType('UNPAID')}
                className={`p-3 rounded-2xl text-xs font-extrabold border transition-all flex flex-col items-center justify-center space-y-1 ${
                  paymentType === 'UNPAID'
                    ? 'border-gave-500 bg-gave-50 dark:bg-gave-950/60 text-gave-700 dark:text-gave-300 shadow-sm ring-2 ring-gave-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 text-gave-500" />
                  <span>{t('jewelrySaleModal.dueCredit')}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('PAID')}
                className={`p-3 rounded-2xl text-xs font-extrabold border transition-all flex flex-col items-center justify-center space-y-1 ${
                  paymentType === 'PAID'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-sm ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  <span>{t('jewelrySaleModal.paidCashUpi')}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Method selection if Paid */}
          {paymentType === 'PAID' && (
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">{t('jewelrySaleModal.paymentMode')}</span>
              <div className="flex items-center space-x-2">
                {[
                  { key: 'Cash', label: t('jewelrySaleModal.cash') },
                  { key: 'UPI', label: t('jewelrySaleModal.upi') },
                  { key: 'Bank Transfer', label: t('jewelrySaleModal.bankTransfer') }
                ].map(mode => (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => setPaymentMethod(mode.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      paymentMethod === mode.key
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date & Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                {t('transactionModal.dateTimeLabel')}
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                {t('transactionModal.remarkLabel')}
              </label>
              <input
                type="text"
                placeholder={t('transactionModal.remarkPlaceholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 transition-all shadow-lg shadow-amber-500/25 active:scale-98 flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t('jewelrySaleModal.confirmSaleButton')} ({formatCurrency(computedFinalAmount)})</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
