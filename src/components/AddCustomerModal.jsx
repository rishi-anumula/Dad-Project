import React, { useState, useMemo } from 'react';
import { useLedger } from '../context/LedgerContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatters';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Tag, 
  Check, 
  Gem, 
  Scale, 
  IndianRupee, 
  Search, 
  ShoppingBag, 
  CheckSquare, 
  Square,
  CreditCard,
  Wallet,
  Calculator,
  Plus
} from 'lucide-react';

function CatalogChecklistItemRow({ item, isChecked, entry, onToggle, onQuantityChange }) {
  const { t } = useLanguage();
  const itemPrice = item.fixedUnitPrice || item.price || 0;
  return (
    <div
      className={`p-3 flex items-center justify-between gap-3 transition-colors ${
        isChecked 
          ? 'bg-amber-50/80 dark:bg-amber-950/60' 
          : 'hover:bg-slate-50 dark:hover:bg-slate-950'
      }`}
    >
      <div 
        onClick={() => onToggle(item)}
        className="flex items-center space-x-3 cursor-pointer min-w-0 flex-1"
      >
        <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border transition-all ${
          isChecked
            ? 'bg-amber-500 border-amber-500 text-white'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
        }`}>
          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>

        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {item.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold flex-shrink-0">
              {item.purity || '22K'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {t('jewelry.netWeightGrams')}: {item.netWeightGrams || 0}g
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3 flex-shrink-0">
        {/* Qty Adjustment Field */}
        {isChecked && (
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold text-slate-400">{t('common.qty')}:</span>
            <input
              type="number"
              min="1"
              value={entry?.qty || 1}
              onChange={(e) => onQuantityChange(item.id, e.target.value)}
              className="w-12 px-2 py-1 text-xs font-bold rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-center"
            />
          </div>
        )}

        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(itemPrice)}
        </span>
      </div>
    </div>
  );
}

export function AddCustomerModal({ isOpen, onClose, onCustomerCreated }) {
  const { addCustomer, addJewelrySale, addTransaction, inventoryItems = [] } = useLedger();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tag, setTag] = useState('Regular Customer');
  const [selectedItemsMap, setSelectedItemsMap] = useState({});
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [amountPaid, setAmountPaid] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [error, setError] = useState('');

  const filteredItems = useMemo(() => {
    const safeInventoryItems = Array.isArray(inventoryItems) ? inventoryItems : [];
    return safeInventoryItems.filter(item => {
      if (!item || typeof item !== 'object') return false;
      const itemNameStr = item.name || '';
      if (!itemSearchQuery.trim()) return true;
      const query = itemSearchQuery.toLowerCase();
      return (
        itemNameStr.toLowerCase().includes(query) ||
        (item.code && item.code.toLowerCase().includes(query)) ||
        (item.purity && item.purity.toLowerCase().includes(query)) ||
        (item.netWeightGrams !== undefined && item.netWeightGrams !== null && item.netWeightGrams.toString().includes(query))
      );
    });
  }, [inventoryItems, itemSearchQuery]);

  const totalBillAmount = useMemo(() => {
    return Object.values(selectedItemsMap).reduce((acc, entry) => {
      if (entry && entry.selected) {
        return acc + ((entry.price || 0) * (entry.qty || 1));
      }
      return acc;
    }, 0);
  }, [selectedItemsMap]);

  const handleToggleItem = (item) => {
    if (!item || !item.id) return;
    setSelectedItemsMap(prev => {
      const existing = prev[item.id];
      if (existing?.selected) {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      } else {
        const itemPrice = item.fixedUnitPrice || item.price || 0;
        return {
          ...prev,
          [item.id]: {
            selected: true,
            qty: 1,
            price: itemPrice,
            weight: item.netWeightGrams || 0,
            item
          }
        };
      }
    });
  };

  const handleQuantityChange = (itemId, newQty) => {
    const qtyNum = Math.max(1, parseInt(newQty, 10) || 1);
    setSelectedItemsMap(prev => {
      if (!prev[itemId]) return prev;
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          qty: qtyNum
        }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('addCustomerModal.nameRequiredError'));
      return;
    }

    const selectedEntries = Object.values(selectedItemsMap).filter(e => e && e.selected);

    const newCustomer = addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      tag
    });

    selectedEntries.forEach(entry => {
      const item = entry.item;
      if (!item) return;
      const totalItemCost = (entry.price || 0) * (entry.qty || 1);
      
      addJewelrySale({
        customerId: newCustomer.id,
        inventoryItemId: item.id,
        itemName: `${item.name}${entry.qty > 1 ? ` (Qty: ${entry.qty})` : ''}`,
        purity: item.purity || '22K',
        netWeightGrams: (item.netWeightGrams || 0) * entry.qty,
        grossWeightGrams: (item.grossWeightGrams || item.netWeightGrams || 0) * entry.qty,
        makingCharges: 0,
        discount: 0,
        totalAmount: totalItemCost,
        paidAmount: 0,
        paymentStatus: 'DUE',
        paymentMethod: 'Credit',
        note: `Initial Order: ${item.name} (${item.netWeightGrams}g ${item.purity || ''})`
      });
    });

    const paidNum = parseFloat(amountPaid) || 0;
    if (paidNum > 0) {
      addTransaction({
        customerId: newCustomer.id,
        type: 'GOT',
        amount: paidNum,
        category: `Payment (${paymentMethod})`,
        itemType: 'GENERAL',
        note: `Initial Payment via ${paymentMethod} on customer creation`,
        date: new Date().toISOString()
      });
    }

    setName('');
    setPhone('');
    setAddress('');
    setTag('Regular Customer');
    setSelectedItemsMap({});
    setItemSearchQuery('');
    setAmountPaid('0');
    setError('');

    if (onCustomerCreated) {
      onCustomerCreated(newCustomer);
    }
    onClose();
  };

  if (!isOpen) return null;

  const paidNum = parseFloat(amountPaid) || 0;
  const balanceDue = Math.max(0, totalBillAmount - paidNum);
  const selectedCount = Object.values(selectedItemsMap).filter(e => e && e.selected).length;

  const tagOptions = [
    { key: 'Regular Customer', label: t('customer.regularCustomer') },
    { key: 'VIP Client', label: t('customer.vipClient') },
    { key: 'Wholesale Buyer', label: t('customer.wholesaleBuyer') },
    { key: 'Supplier', label: t('customer.supplier') }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-indigo-500/10 via-amber-500/10 to-indigo-500/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {t('addCustomerModal.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('addCustomerModal.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Customer Standard Info Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              <span>{t('addCustomerModal.personalDetails')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Customer Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t('addCustomerModal.nameLabel')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={t('addCustomerModal.namePlaceholder')}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t('addCustomerModal.phoneLabel')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder={t('addCustomerModal.phonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Tag Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {tagOptions.map(tOpt => (
                <button
                  type="button"
                  key={tOpt.key}
                  onClick={() => setTag(tOpt.key)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-between ${
                    tag === tOpt.key
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{tOpt.label}</span>
                  {tag === tOpt.key && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 ml-1" />}
                </button>
              ))}
            </div>

            {/* Address */}
            <div>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <textarea
                  placeholder={t('addCustomerModal.addressPlaceholder')}
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* INTERACTIVE CATALOG ITEM SELECTION TABLE */}
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  {t('addCustomerModal.selectFromCatalog')} ({selectedCount} Selected)
                </h4>
              </div>

              {/* Search Bar inside items list */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('addCustomerModal.searchCatalogPlaceholder')}
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Checklist Table */}
            <div className="border border-amber-200/60 dark:border-amber-900/40 rounded-xl bg-white dark:bg-slate-900 overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {itemSearchQuery ? `No catalog items found matching "${itemSearchQuery}".` : t('itemsCatalog.noItemsFound')}
                </div>
              ) : (
                filteredItems.map(item => {
                  const entry = selectedItemsMap[item.id];
                  const isChecked = Boolean(entry?.selected);
                  return (
                    <CatalogChecklistItemRow
                      key={item.id}
                      item={item}
                      isChecked={isChecked}
                      entry={entry}
                      onToggle={handleToggleItem}
                      onQuantityChange={handleQuantityChange}
                    />
                  );
                })
              )}
            </div>

            {/* BILL SUMMARY & PAYMENT BREAKDOWN */}
            {selectedCount > 0 && (
              <div className="pt-3 space-y-3 border-t border-amber-200/60 dark:border-amber-900/40">
                <div className="grid grid-cols-2 gap-3">
                  {/* Total Bill Amount */}
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                      {t('addCustomerModal.totalOrderAmount')}
                    </span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">
                      {formatCurrency(totalBillAmount)}
                    </span>
                  </div>

                  {/* Amount Paid Field */}
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                      {t('addCustomerModal.amountPaidLabel')}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Balance Due Display */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gave-50/80 dark:bg-gave-950/60 border border-gave-200 dark:border-gave-900 text-xs font-bold">
                  <span className="text-gave-800 dark:text-gave-300">
                    {t('addCustomerModal.openingBalanceDue')}
                  </span>
                  <span className="text-base font-black text-gave-600 dark:text-gave-400">
                    {formatCurrency(balanceDue)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>{t('addCustomerModal.createButton')} {selectedCount > 0 ? t('addCustomerModal.attachItemsSuffix', { count: selectedCount }) : ''}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
