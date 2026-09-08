import React, { useState, useMemo } from 'react';
import { useLedger } from '../context/LedgerContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, buildWhatsAppReminderUrl, formatPhoneForCalling } from '../utils/formatters';
import { 
  Search, 
  UserPlus, 
  MessageCircle, 
  ChevronRight, 
  CheckCircle2, 
  Phone,
  SlidersHorizontal,
  Plus
} from 'lucide-react';

function CustomerRow({ customer, businessName, onSelectCustomer }) {
  const { t } = useLanguage();
  const isGet = customer.netBalance > 0;
  const isGive = customer.netBalance < 0;
  const isSettled = customer.netBalance === 0;

  const initials = customer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={() => onSelectCustomer(customer)}
      className="py-4 px-2 sm:px-3 hover:bg-indigo-50/50 dark:hover:bg-slate-900/60 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
    >
      
      {/* Left: Customer Info */}
      <div className="flex items-center space-x-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center shadow-sm flex-shrink-0">
          {initials}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {customer.name}
            </h3>
            {customer.tag && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {customer.tag}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-y-0.5">
            {customer.phone && (
              <a
                href={formatPhoneForCalling(customer.phone)}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-1 hover:text-indigo-600 transition-colors"
                title={`Call ${customer.phone}`}
              >
                <Phone className="w-3 h-3 text-slate-400 hover:text-indigo-600" />
                <span>{customer.phone}</span>
              </a>
            )}
            
            {(customer.initialItem || customer.initialWeightGrams) && (
              <>
                <span>•</span>
                <span className="flex items-center space-x-1 text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200/60 text-[11px]">
                  <span>{customer.initialItem || 'Item'}:</span>
                  <span className="font-extrabold">{customer.initialWeightGrams ? `${customer.initialWeightGrams}g` : ''}</span>
                </span>
              </>
            )}

            <span>•</span>
            <span>{customer.transactionCount} {t('customer.transactionsCount')}</span>
          </div>
        </div>
      </div>

      {/* Right: Balance Pill & Actions */}
      <div className="flex items-center justify-between sm:justify-end space-x-4 pl-14 sm:pl-0">
        
        {/* Balance Display */}
        <div className="text-right">
          {isGet && (
            <div>
              <span className="text-xs font-semibold text-gave-600 dark:text-gave-400 block">
                {t('financial.youWillGet')}
              </span>
              <span className="text-lg font-extrabold text-gave-600 dark:text-gave-500">
                {formatCurrency(customer.netBalance)}
              </span>
            </div>
          )}

          {isGive && (
            <div>
              <span className="text-xs font-semibold text-got-600 dark:text-got-400 block">
                {t('financial.youWillGive')}
              </span>
              <span className="text-lg font-extrabold text-got-600 dark:text-got-500">
                {formatCurrency(Math.abs(customer.netBalance))}
              </span>
            </div>
          )}

          {isSettled && (
            <div>
              <span className="text-xs font-semibold text-slate-400 block">
                {t('financial.accountSettled')}
              </span>
              <span className="text-base font-bold text-slate-500 dark:text-slate-400">
                ₹ 0
              </span>
            </div>
          )}
        </div>

        {/* WhatsApp Reminder Button */}
        {customer.phone && isGet && (
          <a
            href={buildWhatsAppReminderUrl(customer.phone, customer.name, customer.netBalance, businessName)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-xl text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 transition-colors"
            title={t('customerDetailModal.whatsapp')}
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        )}

        {/* Arrow Indicator */}
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />

      </div>

    </div>
  );
}

export function CustomerList({ onSelectCustomer, onAddCustomer }) {
  const { 
    customers = [], 
    businessName, 
    customerListFilter, 
    setCustomerListFilter, 
    settledToast, 
    setSettledToast 
  } = useLedger();

  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('RECENT'); // 'RECENT' | 'BALANCE' | 'NAME'

  const filteredCustomers = useMemo(() => {
    const safeCustomers = Array.isArray(customers) ? customers : [];
    const list = safeCustomers.filter(c => {
      if (!c || !c.name) return false;
      const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (c.phone || '').includes(searchTerm) ||
                            (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;

      if (customerListFilter === 'GET') return c.netBalance > 0;
      if (customerListFilter === 'GIVE') return c.netBalance < 0;
      if (customerListFilter === 'SETTLED') return c.netBalance === 0;
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'NAME') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'BALANCE') {
        return Math.abs(b.netBalance) - Math.abs(a.netBalance);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [customers, searchTerm, customerListFilter, sortBy]);

  const filterType = customerListFilter;
  const setFilterType = setCustomerListFilter;

  return (
    <div className="glass-card rounded-2xl p-5 shadow-sm">

      {/* Settled Redirection Toast Notification Banner */}
      {settledToast && settledToast.show && (
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-indigo-500/20 border border-emerald-400 dark:border-emerald-800 flex items-center justify-between shadow-lg animate-bounce-short">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-md">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {settledToast.title}
              </h4>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {settledToast.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettledToast(null)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            {t('common.gotIt')}
          </button>
        </div>
      )}
      
      {/* Header controls & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>{t('customer.customerLedgers')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
              {filteredCustomers.length}
            </span>
            {filterType === 'SETTLED' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-300 dark:border-emerald-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('financial.settledPageNotice')}</span>
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('customer.selectCustomerNotice')}
          </p>
        </div>

        <button
          onClick={onAddCustomer}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('customer.addNewCustomer')}</span>
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('customer.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 w-full sm:w-auto overflow-x-auto">
          {[
            { key: 'ALL', label: t('customer.filterAll') },
            { key: 'GET', label: t('customer.filterGet') },
            { key: 'GIVE', label: t('customer.filterGive') },
            { key: 'SETTLED', label: t('customer.filterSettled') }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all whitespace-nowrap ${
                filterType === f.key
                  ? f.key === 'SETTLED'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="RECENT">{t('customer.sortRecent')}</option>
            <option value="BALANCE">{t('customer.sortBalance')}</option>
            <option value="NAME">{t('customer.sortName')}</option>
          </select>
        </div>

      </div>

      {/* Customer List Grid/List */}
      {filteredCustomers.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {t('customer.noCustomersFound')}
          </p>
          <button
            onClick={onAddCustomer}
            className="mt-3 inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Plus className="w-4 h-4" />
            <span>{t('customer.addCustomerNow')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredCustomers.map(customer => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              businessName={businessName}
              onSelectCustomer={onSelectCustomer}
            />
          ))}
        </div>
      )}

    </div>
  );
}

