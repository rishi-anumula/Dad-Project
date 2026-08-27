import React from 'react';
import { useLedger } from '../context/LedgerContext';
import { formatCurrency, formatDate, buildWhatsAppReminderUrl } from '../utils/formatters';
import { generateCustomerPdfReport } from '../utils/pdfGenerator';
import { 
  X, 
  Phone, 
  MapPin, 
  MessageCircle, 
  FileText, 
  PlusCircle, 
  MinusCircle, 
  Trash2, 
  Calendar, 
  Tag, 
  Gem,
  Coins,
  CheckCircle2
} from 'lucide-react';

export function CustomerDetailModal({ customer, onClose, onAddTransaction }) {
  const { transactions, deleteTransaction, deleteCustomer, businessName, setCustomerListFilter } = useLedger();

  if (!customer) return null;

  const customerTransactions = transactions.filter(t => t.customerId === customer.id);
  const isGet = customer.netBalance > 0;
  const isGive = customer.netBalance < 0;
  const isSettled = customer.netBalance === 0;

  const handleDeleteCustomer = () => {
    deleteCustomer(customer.id);
    onClose();
  };

  const handleGoToSettledPage = () => {
    setCustomerListFilter('SETTLED');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {customer.name}
                </h2>
                {customer.tag && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                    {customer.tag}
                  </span>
                )}
                {isSettled && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-300 dark:border-emerald-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SETTLED</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                {customer.phone && (
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer.phone}</span>
                  </span>
                )}
                {customer.address && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer.address}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDeleteCustomer}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
              title="Delete Customer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Balance Status Banner */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <div className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
            isGet 
              ? 'bg-gave-50/60 dark:bg-gave-950/40 border-gave-200 dark:border-gave-900' 
              : isGive 
              ? 'bg-got-50/60 dark:bg-got-950/40 border-got-200 dark:border-got-900' 
              : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
          }`}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <span>Current Net Balance Status</span>
                {isSettled && <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">• ACCOUNT SETTLED</span>}
              </p>
              <h3 className={`text-2xl font-black mt-0.5 ${
                isGet ? 'text-gave-600 dark:text-gave-400' : isGive ? 'text-got-600 dark:text-got-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}>
                {isGet && `YOU WILL GET ${formatCurrency(customer.netBalance)}`}
                {isGive && `YOU WILL GIVE ${formatCurrency(Math.abs(customer.netBalance))}`}
                {isSettled && `FULL SETTLEMENT DONE (₹ 0)`}
              </h3>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {isGet && (
                <button
                  onClick={() => onAddTransaction(customer, 'GOT')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-got-600 hover:bg-got-700 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settle Account (Receive ₹{customer.netBalance})</span>
                </button>
              )}

              {isSettled && (
                <button
                  onClick={handleGoToSettledPage}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>View in Settled Page →</span>
                </button>
              )}

              {customer.phone && isGet && (
                <a
                  href={buildWhatsAppReminderUrl(customer.phone, customer.name, customer.netBalance, businessName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}

              <button
                onClick={() => generateCustomerPdfReport(customer, customerTransactions, businessName)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>PDF Statement</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Transaction History ({customerTransactions.length})
            </h4>
          </div>

          {customerTransactions.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                No entries recorded for {customer.name} yet.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Use the red and green buttons below to add an entry.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customerTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      tx.type === 'GAVE'
                        ? 'bg-gave-100 dark:bg-gave-950/60 text-gave-600 dark:text-gave-400'
                        : 'bg-got-100 dark:bg-got-950/60 text-got-600 dark:text-got-400'
                    }`}>
                      {tx.type === 'GAVE' ? <MinusCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {tx.jewelryCategory || tx.note || tx.category || (tx.type === 'GAVE' ? 'You Gave' : 'You Got')}
                        </span>
                        
                        {/* Jewelry Spec Badges */}
                        {tx.purity && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold flex items-center space-x-1">
                            <Gem className="w-2.5 h-2.5 text-amber-500" />
                            <span>{tx.purity}</span>
                          </span>
                        )}

                        {tx.netWeightGrams && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                            {tx.netWeightGrams}g
                          </span>
                        )}

                        {tx.makingCharges && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                            Making: ₹{tx.makingCharges}
                          </span>
                        )}

                        {tx.city && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-bold flex items-center space-x-1">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{tx.city.toUpperCase()}{tx.appliedRate ? ` @ ₹${tx.appliedRate}/g` : ''}</span>
                          </span>
                        )}
                      </div>

                      {tx.note && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {tx.note}
                        </p>
                      )}

                      <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(tx.date)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className={`text-base font-extrabold block ${
                        tx.type === 'GAVE' ? 'text-gave-600 dark:text-gave-400' : 'text-got-600 dark:text-got-400'
                      }`}>
                        {tx.type === 'GAVE' ? `- ${formatCurrency(tx.amount)}` : `+ ${formatCurrency(tx.amount)}`}
                      </span>
                      <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                        {tx.type === 'GAVE' ? "You Gave" : "You Got"}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Entry Buttons: GAVE vs GOT */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 flex items-center space-x-3">
          
          <button
            onClick={() => onAddTransaction(customer, 'GAVE')}
            className="flex-1 py-3 px-4 rounded-2xl font-extrabold text-sm text-white bg-gave-600 hover:bg-gave-700 active:scale-95 transition-all shadow-md shadow-gave-500/20 flex items-center justify-center space-x-2"
          >
            <MinusCircle className="w-5 h-5" />
            <span>YOU GAVE ₹</span>
          </button>

          <button
            onClick={() => onAddTransaction(customer, 'GOT')}
            className="flex-1 py-3 px-4 rounded-2xl font-extrabold text-sm text-white bg-got-600 hover:bg-got-700 active:scale-95 transition-all shadow-md shadow-got-500/20 flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>YOU GOT ₹</span>
          </button>

        </div>

      </div>
    </div>
  );
}
