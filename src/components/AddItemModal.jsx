import React, { useState, useEffect } from 'react';
import { useLedger } from '../context/LedgerContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Gem, Scale, IndianRupee, Tag, Check, Package } from 'lucide-react';

export function AddItemModal({ isOpen, onClose, itemToEdit = null }) {
  const { addInventoryItem, updateInventoryItem } = useLedger();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Gold Jewelry');
  const [metalType, setMetalType] = useState('Gold');
  const [purity, setPurity] = useState('22K');
  const [netWeightGrams, setNetWeightGrams] = useState('');
  const [fixedUnitPrice, setFixedUnitPrice] = useState('');
  const [stockQty, setStockQty] = useState('1');
  const [error, setError] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || '');
      setCode(itemToEdit.code || '');
      setCategory(itemToEdit.category || 'Gold Jewelry');
      setMetalType(itemToEdit.metalType || 'Gold');
      setPurity(itemToEdit.purity || '22K');
      setNetWeightGrams(itemToEdit.netWeightGrams ? itemToEdit.netWeightGrams.toString() : '');
      const priceVal = itemToEdit.fixedUnitPrice || itemToEdit.price || 0;
      setFixedUnitPrice(priceVal ? priceVal.toString() : '');
      setStockQty(itemToEdit.stockQty ? itemToEdit.stockQty.toString() : '1');
    } else {
      setName('');
      setCode('');
      setCategory('Gold Jewelry');
      setMetalType('Gold');
      setPurity('22K');
      setNetWeightGrams('');
      setFixedUnitPrice('');
      setStockQty('1');
    }
    setError('');
  }, [itemToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Item Name is required.');
      return;
    }

    const priceNum = parseFloat(fixedUnitPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid sale price (> 0).');
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      category,
      metalType,
      purity,
      netWeightGrams: parseFloat(netWeightGrams) || 0,
      fixedUnitPrice: priceNum,
      price: priceNum,
      stockQty: parseInt(stockQty, 10) || 1
    };

    if (itemToEdit) {
      updateInventoryItem({ ...itemToEdit, ...payload });
    } else {
      addInventoryItem(payload);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-amber-500/10 dark:bg-amber-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {itemToEdit ? t('addItemModal.editTitle') : t('addItemModal.addTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('itemsCatalog.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              {t('addItemModal.itemNameLabel')}
            </label>
            <input
              type="text"
              required
              placeholder={t('addItemModal.itemNamePlaceholder')}
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>

          {/* SKU Code & Stock Qty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {t('addItemModal.itemCodeLabel')}
              </label>
              <input
                type="text"
                placeholder={t('addItemModal.itemCodePlaceholder')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {t('addItemModal.stockQuantityLabel')}
              </label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold"
              />
            </div>
          </div>

          {/* Metal Category & Purity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {t('jewelry.metalCategory')}
              </label>
              <select
                value={metalType}
                onChange={(e) => {
                  setMetalType(e.target.value);
                  if (e.target.value === 'Silver') setPurity('925 Silver');
                  else setPurity('22K');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              >
                <option value="Gold">{t('jewelry.gold')}</option>
                <option value="Silver">{t('jewelry.silver')}</option>
                <option value="Diamond">Diamond / Gemstone</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {t('jewelry.purity')}
              </label>
              <select
                value={purity}
                onChange={(e) => setPurity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              >
                <option value="24K">{t('jewelry.purity24k')}</option>
                <option value="22K">{t('jewelry.purity22k')}</option>
                <option value="18K">{t('jewelry.purity18k')}</option>
                <option value="925 Silver">{t('jewelry.purity925Silver')}</option>
                <option value="999 Silver">{t('jewelry.purity999Silver')}</option>
              </select>
            </div>
          </div>

          {/* Net Weight & Fixed Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {t('jewelry.netWeightGrams')}
              </label>
              <input
                type="number"
                step="0.001"
                placeholder="e.g. 10.500"
                value={netWeightGrams}
                onChange={(e) => setNetWeightGrams(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {t('addItemModal.fixedUnitPriceLabel')}
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder={t('addItemModal.fixedPricePlaceholder')}
                value={fixedUnitPrice}
                onChange={(e) => { setFixedUnitPrice(e.target.value); setError(''); }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm text-white bg-amber-500 hover:bg-amber-600 active:scale-98 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>{itemToEdit ? t('addItemModal.updateItemButton') : t('addItemModal.saveItemButton')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
