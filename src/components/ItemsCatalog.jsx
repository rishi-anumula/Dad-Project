import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { useLanguage } from '../context/LanguageContext';
import { AddItemModal } from './AddItemModal';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Search, 
  Gem, 
  Scale, 
  IndianRupee, 
  Package, 
  Edit2, 
  Trash2, 
  Layers, 
  Sparkles,
  Filter,
  ArrowUpDown,
  ShoppingBag
} from 'lucide-react';

export function ItemsCatalog({ onSelectForSale = null }) {
  const { inventoryItems, deleteInventoryItem } = useLedger();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [metalFilter, setMetalFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const handleOpenAddModal = () => {
    setItemToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setItemToEdit(item);
    setIsAddModalOpen(true);
  };

  const safeInventoryItems = Array.isArray(inventoryItems) ? inventoryItems : [];
  const filteredItems = safeInventoryItems.filter(item => {
    if (!item || !item.name) return false;
    const matchesSearch = 
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.purity && item.purity.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMetal = metalFilter === 'ALL' || item.metalType?.toLowerCase() === metalFilter.toLowerCase();

    return matchesSearch && matchesMetal;
  });

  const totalItemsCount = safeInventoryItems.length;
  const totalStockQty = safeInventoryItems.reduce((acc, item) => acc + (Number(item.stockQty) || 0), 0);
  const totalCatalogValue = safeInventoryItems.reduce((acc, item) => acc + ((Number(item.fixedUnitPrice) || Number(item.price) || 0) * (Number(item.stockQty) || 1)), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner / Stats Header */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-500/10 dark:from-amber-950/40 dark:to-indigo-950/40 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Gem className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {t('itemsCatalog.title')}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-300 dark:border-amber-800">
                  {totalItemsCount} Articles
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {t('itemsCatalog.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 transition-all shadow-md shadow-amber-500/25"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('itemsCatalog.addNewItem')}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t('itemsCatalog.totalItems')}</p>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{totalItemsCount}</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t('itemsCatalog.totalStock')}</p>
            <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{totalStockQty} {t('itemsCatalog.pcs')}</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t('jewelry.basePrice')}</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(totalCatalogValue)}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('itemsCatalog.searchItemsPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
        </div>

        {/* Metal Category Filter Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-x-1">
          {[
            { key: 'ALL', label: t('itemsCatalog.filterAllCategory') },
            { key: 'Gold', label: t('itemsCatalog.filterGold') },
            { key: 'Silver', label: t('itemsCatalog.filterSilver') }
          ].map((filterOpt) => (
            <button
              key={filterOpt.key}
              onClick={() => setMetalFilter(filterOpt.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                metalFilter === filterOpt.key
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {filterOpt.label}
            </button>
          ))}
        </div>

      </div>

      {/* Items List / Table */}
      {filteredItems.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-500 mx-auto flex items-center justify-center mb-3">
            <Gem className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t('itemsCatalog.noItemsFound')}
          </h3>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t('itemsCatalog.addNewItem')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const itemPrice = item.fixedUnitPrice || item.price || 0;
            const netWeight = item.netWeightGrams ? parseFloat(item.netWeightGrams).toFixed(3) : '0.000';
            
            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Top Badge Line */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border ${
                        item.metalType?.toLowerCase() === 'gold'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : item.metalType?.toLowerCase() === 'silver'
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                      }`}>
                        {item.purity || item.metalType || '22K'}
                      </span>
                      
                      {item.code && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.code}
                        </span>
                      )}
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      (item.stockQty || 0) > 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {t('itemsCatalog.stock')}: {item.stockQty || 0}
                    </span>
                  </div>

                  {/* Item Title */}
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {item.name}
                  </h3>

                  {/* Item Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
                        <Scale className="w-3 h-3 text-amber-500" />
                        <span>{t('jewelry.netWeightGrams')}</span>
                      </span>
                      <span className="font-black text-slate-800 dark:text-slate-200">
                        {netWeight} g
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
                        <IndianRupee className="w-3 h-3 text-emerald-500" />
                        <span>{t('jewelry.basePrice')}</span>
                      </span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(itemPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                      title={t('itemsCatalog.editItem')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteInventoryItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                      title={t('itemsCatalog.deleteItem')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[10px] font-semibold text-slate-400">
                    Category: {item.category || 'Jewelry'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setItemToEdit(null);
        }}
        itemToEdit={itemToEdit}
      />
    </div>
  );
}
