import React from 'react';
import { useLedger } from '../context/LedgerContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Wallet, UserPlus, Users } from 'lucide-react';

export function SummaryCards({ onAddCustomer }) {
  const { totalYouWillGet, totalYouWillGive, netBusinessBalance, customers } = useLedger();
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      {/* Card 1: Total You'll Get (Receivables) */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-gave-500/50 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('financial.totalYouWillGet')}
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gave-600 dark:text-gave-500 mt-1">
              {formatCurrency(totalYouWillGet)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gave-50 dark:bg-gave-950/60 border border-gave-200/50 dark:border-gave-800/50 flex items-center justify-center text-gave-600 dark:text-gave-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{t('financial.youWillGet')}</span>
          <span className="font-semibold text-gave-600 dark:text-gave-400">Pending</span>
        </div>
      </div>

      {/* Card 2: Total You'll Give (Payables) */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-got-500/50 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('financial.totalYouWillGive')}
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-got-600 dark:text-got-500 mt-1">
              {formatCurrency(totalYouWillGive)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-got-50 dark:bg-got-950/60 border border-got-200/50 dark:border-got-800/50 flex items-center justify-center text-got-600 dark:text-got-400">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{t('financial.youWillGive')}</span>
          <span className="font-semibold text-got-600 dark:text-got-400">Advance</span>
        </div>
      </div>

      {/* Card 3: Net Business Balance */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('financial.netBalance')}
            </p>
            <h3 className={`text-2xl sm:text-3xl font-extrabold mt-1 ${
              netBusinessBalance >= 0 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatCurrency(netBusinessBalance)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center space-x-1">
            <Users className="w-3.5 h-3.5" />
            <span>{customers.length} {t('nav.dashboard')}</span>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onAddCustomer}
              className="px-2.5 py-1 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors flex items-center space-x-1"
            >
              <UserPlus className="w-3 h-3" />
              <span>{t('financial.quickAddCustomer')}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

