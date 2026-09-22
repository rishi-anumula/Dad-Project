import React, { useState, useMemo } from 'react';
import { useLedger } from '../context/LedgerContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDate, buildWhatsAppReminderUrl, formatPhoneForCalling, buildWhatsAppBillUrl } from '../utils/formatters';
import { generateCustomerPdfReport } from '../utils/pdfGenerator';
import { AddJewelryItemSaleModal } from './AddJewelryItemSaleModal';
import { JewelryPdfStatementModal } from './JewelryPdfStatementModal';
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
  CheckCircle2,
  ShoppingBag,
  CreditCard,
  Wallet,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

function CatalogQuickAddItem({ item, onQuickAdd }) {
  const { t } = useLanguage();
  const itemPrice = item.fixedUnitPrice || item.price || 0;
  return (
    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-2 hover:border-amber-400 transition-all shadow-2xs">
      <div className="min-w-0">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {item.name}
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold flex-shrink-0">
            {item.purity || '22K'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
          <span>{item.netWeightGrams}g</span>
          <span>•</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(itemPrice)}
          </span>
        </div>
      </div>

      <button
        onClick={() => onQuickAdd(item)}
        className="px-2.5 py-1.5 rounded-lg text-[10px] font-black text-white bg-amber-500 hover:bg-amber-600 active:scale-95 transition-all flex items-center space-x-1 flex-shrink-0"
        title="Click to instantly add to customer's ledger"
      >
        <Plus className="w-3 h-3 stroke-[3]" />
        <span>{t('common.add')}</span>
      </button>
    </div>
  );
}

function TransactionHistoryRow({ tx, onDelete, customer, businessName }) {
  const { t } = useLanguage();
  return (
    <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-4 group hover:border-amber-200 dark:hover:border-amber-900/50 transition-all">
      <div className="flex items-start space-x-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
          tx.type === 'GAVE'
            ? 'bg-gave-100 dark:bg-gave-950/60 text-gave-600 dark:text-gave-400'
            : 'bg-got-100 dark:bg-got-950/60 text-got-600 dark:text-got-400'
        }`}>
          {tx.type === 'GAVE' ? <MinusCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
        </div>
        
        <div>
          {/* Title & Badges */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {tx.jewelryCategory || tx.note || tx.category || (tx.type === 'GAVE' ? t('customerDetailModal.youGaveButton') : t('customerDetailModal.youGotButton'))}
            </span>
            
            {/* Net Weight Badge */}
            {tx.netWeightGrams && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-200 dark:border-amber-900/50 flex items-center space-x-1">
                <Gem className="w-2.5 h-2.5 text-amber-500" />
                <span>{t('jewelry.netWeightGrams')}: {tx.netWeightGrams}g</span>
              </span>
            )}

            {/* Purity Badge */}
            {tx.purity && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold">
                {tx.purity}
              </span>
            )}

            {/* Balance Tag: You'll Get / Due (Red) vs You Got / Paid (Green) */}
            <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold border ${
              tx.type === 'GAVE'
                ? 'bg-gave-100 dark:bg-gave-950/60 text-gave-700 dark:text-gave-300 border-gave-300 dark:border-gave-800'
                : 'bg-got-100 dark:bg-got-950/60 text-got-700 dark:text-got-300 border-got-300 dark:border-got-800'
            }`}>
              {tx.type === 'GAVE' ? `[${t('financial.youWillGet')}]` : `[${t('financial.paymentReceived')}]`}
            </span>
          </div>

          {/* Description / Note */}
          {tx.note && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
              {tx.note}
            </p>
          )}

          <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(tx.date)}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="text-right">
          <span className={`text-base font-black block ${
            tx.type === 'GAVE' ? 'text-gave-600 dark:text-gave-400' : 'text-got-600 dark:text-got-400'
          }`}>
            {tx.type === 'GAVE' ? `- ${formatCurrency(tx.amount)}` : `+ ${formatCurrency(tx.amount)}`}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {tx.type === 'GAVE' ? t('financial.youWillGive') : t('financial.youWillGet')}
          </span>
        </div>

        {/* WhatsApp Bill / Receipt Share Button */}
        {customer?.phone && (
          <a
            href={buildWhatsAppBillUrl(customer.phone, customer.name, tx, businessName)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
            title="Share transaction receipt on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        )}

        <button
          onClick={() => onDelete(tx.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 opacity-0 group-hover:opacity-100 transition-all"
          title="Delete entry"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function CustomerDetailModal({ customer, onClose, onAddTransaction }) {
  const { transactions = [], deleteTransaction, deleteCustomer, businessName, setCustomerListFilter, inventoryItems = [], addJewelrySale } = useLedger();
  const { t } = useLanguage();
  
  const [isItemSaleOpen, setIsItemSaleOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isQuickPickerOpen, setIsQuickPickerOpen] = useState(true);
  const [catalogSearchText, setCatalogSearchText] = useState('');
  const [txSearchText, setTxSearchText] = useState('');
  const [addedItemToast, setAddedItemToast] = useState(null);

  const filteredCatalogItems = useMemo(() => {
    const safeInventory = Array.isArray(inventoryItems) ? inventoryItems : [];
    if (!catalogSearchText.trim()) return safeInventory;
    const query = catalogSearchText.toLowerCase();
    return safeInventory.filter(item =>
      item?.name?.toLowerCase().includes(query) ||
      (item?.code && item.code.toLowerCase().includes(query)) ||
      (item?.purity && item.purity.toLowerCase().includes(query)) ||
      (item?.netWeightGrams !== undefined && item?.netWeightGrams !== null && item.netWeightGrams.toString().includes(query))
    );
  }, [inventoryItems, catalogSearchText]);

  const customerTransactions = useMemo(() => {
    if (!customer?.id) return [];
    const safeTxs = Array.isArray(transactions) ? transactions : [];
    return safeTxs.filter(t => t?.customerId === customer.id);
  }, [transactions, customer?.id]);

  const filteredCustomerTxs = useMemo(() => {
    if (!txSearchText.trim()) return customerTransactions;
    const query = txSearchText.toLowerCase();
    return customerTransactions.filter(tx =>
      (tx?.jewelryCategory && tx.jewelryCategory.toLowerCase().includes(query)) ||
      (tx?.note && tx.note.toLowerCase().includes(query)) ||
      (tx?.category && tx.category.toLowerCase().includes(query)) ||
      (tx?.netWeightGrams !== undefined && tx?.netWeightGrams !== null && tx.netWeightGrams.toString().includes(query)) ||
      (tx?.purity && tx.purity.toLowerCase().includes(query))
    );
  }, [customerTransactions, txSearchText]);

  const handleDeleteCustomer = () => {
    if (!customer?.id) return;
    deleteCustomer(customer.id);
    onClose();
  };

  const handleGoToSettledPage = () => {
    setCustomerListFilter('SETTLED');
    onClose();
  };

  const handleQuickAddItemToLedger = (item) => {
    if (!customer?.id) return;
    const itemPrice = item.fixedUnitPrice || item.price || 0;
    
    addJewelrySale({
      customerId: customer.id,
      inventoryItemId: item.id,
      itemName: item.name,
      purity: item.purity || '22K',
      netWeightGrams: item.netWeightGrams || 0,
      grossWeightGrams: item.grossWeightGrams || item.netWeightGrams || 0,
      makingCharges: 0,
      discount: 0,
      totalAmount: itemPrice,
      paidAmount: 0,
      paymentStatus: 'DUE',
      paymentMethod: 'Credit',
      note: `Quick Item Add: ${item.name} (${item.netWeightGrams}g ${item.purity || ''})`
    });

    setAddedItemToast(`Added "${item.name}" (${item.netWeightGrams}g) to ${customer.name}'s Ledger!`);
    setTimeout(() => setAddedItemToast(null), 3500);
  };

  if (!customer) return null;

  const isGet = (customer.netBalance || 0) > 0;
  const isGive = (customer.netBalance || 0) < 0;
  const isSettled = (customer.netBalance || 0) === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between bg-slate-50/50 dark:bg-slate-950/50">
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
                    <span>{t('financial.accountSettled')}</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                {customer.phone && (
                  <a
                    href={formatPhoneForCalling(customer.phone)}
                    className="flex items-center space-x-1 hover:text-indigo-600 transition-colors"
                    title={`Call ${customer.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                    <span>{customer.phone}</span>
                  </a>
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
              title={t('customerDetailModal.deleteCustomer')}
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
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <div className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
            isGet 
              ? 'bg-gave-50/60 dark:bg-gave-950/40 border-gave-200 dark:border-gave-900' 
              : isGive 
              ? 'bg-got-50/60 dark:bg-got-950/40 border-got-200 dark:border-got-900' 
              : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
          }`}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <span>{t('customerDetailModal.currentNetBalance')}</span>
                {isSettled && <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">• {t('financial.fullSettlement')}</span>}
              </p>
              <h3 className={`text-2xl font-black mt-0.5 ${
                isGet ? 'text-gave-600 dark:text-gave-400' : isGive ? 'text-got-600 dark:text-got-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}>
                {isGet && `${t('financial.youWillGet')} ${formatCurrency(customer.netBalance)}`}
                {isGive && `${t('financial.youWillGive')} ${formatCurrency(Math.abs(customer.netBalance))}`}
                {isSettled && `${t('financial.fullSettlement')}`}
              </h3>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              
              <button
                onClick={() => setIsItemSaleOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('customerDetailModal.customJewelryBilling')}</span>
              </button>

              {isGet && (
                <button
                  onClick={() => onAddTransaction(customer, 'GOT')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-got-600 hover:bg-got-700 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('financial.settleAccount')} (₹{customer.netBalance})</span>
                </button>
              )}

              {isSettled && (
                <button
                  onClick={handleGoToSettledPage}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('financial.settledPageNotice')} →</span>
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
                  <span>{t('customerDetailModal.whatsapp')}</span>
                </a>
              )}

              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Generate High-Resolution Multi-Language PDF Statement"
              >
                <FileText className="w-4 h-4 text-amber-500" />
                <span>{t('customerDetailModal.pdfStatement')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toast Alert Feedback when item added */}
        {addedItemToast && (
          <div className="mx-6 mt-3 p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center justify-between animate-fade-in shadow-sm">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{addedItemToast}</span>
            </div>
            <button onClick={() => setAddedItemToast(null)} className="p-0.5 hover:bg-emerald-200 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* DIRECT ITEM PICKER PANEL (INLINE CATALOG TABLE) */}
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                {t('customerDetailModal.quickAddCatalog')}
              </h4>
              <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded font-extrabold">
                {inventoryItems.length} {t('addCustomerModal.available')}
              </span>
            </div>

            <button
              onClick={() => setIsQuickPickerOpen(!isQuickPickerOpen)}
              className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center space-x-1"
            >
              <span>{isQuickPickerOpen ? t('customerDetailModal.hideCatalogPanel') : t('customerDetailModal.showCatalogPanel')}</span>
              {isQuickPickerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isQuickPickerOpen && (
            <div className="space-y-3 pt-1">
              {/* Search Bar for Quick Add Panel */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('customerDetailModal.filterCatalogPlaceholder')}
                  value={catalogSearchText}
                  onChange={(e) => setCatalogSearchText(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {/* Items Grid/List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {filteredCatalogItems.length === 0 ? (
                  <div className="col-span-full py-4 text-center text-xs text-slate-400">
                    {t('itemsCatalog.noItemsFound')}
                  </div>
                ) : (
                  filteredCatalogItems.map((item) => (
                    <CatalogQuickAddItem
                      key={item.id}
                      item={item}
                      onQuickAdd={handleQuickAddItemToLedger}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Transaction History Timeline Section */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {t('customerDetailModal.ledgerTimeline')} ({filteredCustomerTxs.length})
            </h4>

            {/* Filter Timeline Entries */}
            <div className="relative max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('customerDetailModal.filterTimelinePlaceholder')}
                value={txSearchText}
                onChange={(e) => setTxSearchText(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {filteredCustomerTxs.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {txSearchText ? `No transactions match "${txSearchText}".` : t('customerDetailModal.noEntriesYet')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCustomerTxs.map((tx) => (
                <TransactionHistoryRow
                  key={tx.id}
                  tx={tx}
                  onDelete={deleteTransaction}
                  customer={customer}
                  businessName={businessName}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Entry Buttons: GAVE vs GOT */}
        <div className="p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom,0px))] border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 flex items-center space-x-3">
          
          <button
            onClick={() => onAddTransaction(customer, 'GAVE')}
            className="flex-1 py-3 px-4 rounded-2xl font-extrabold text-sm text-white bg-gave-600 hover:bg-gave-700 active:scale-95 transition-all shadow-md shadow-gave-500/20 flex items-center justify-center space-x-2"
          >
            <MinusCircle className="w-5 h-5" />
            <span>{t('customerDetailModal.youGaveButton')}</span>
          </button>

          <button
            onClick={() => onAddTransaction(customer, 'GOT')}
            className="flex-1 py-3 px-4 rounded-2xl font-extrabold text-sm text-white bg-got-600 hover:bg-got-700 active:scale-95 transition-all shadow-md shadow-got-500/20 flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t('customerDetailModal.youGotButton')}</span>
          </button>

        </div>

      </div>

      {/* Custom Jewelry Sale Billing Modal */}
      <AddJewelryItemSaleModal
        customer={customer}
        isOpen={isItemSaleOpen}
        onClose={() => setIsItemSaleOpen(false)}
      />

      {/* High-Resolution Indic PDF Statement Modal */}
      <JewelryPdfStatementModal
        customer={customer}
        transactions={customerTransactions}
        businessName={businessName}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
}
