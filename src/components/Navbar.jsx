import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { 
  BookOpen, 
  Sun, 
  Moon, 
  FileSpreadsheet, 
  Database, 
  Edit2, 
  Check, 
  Sparkles,
  Coins,
  LayoutDashboard
} from 'lucide-react';
import { generateBusinessPdfReport } from '../utils/pdfGenerator';

export function Navbar({ activeTab, setActiveTab, onOpenBackupModal }) {
  const { 
    businessName, 
    setBusinessName, 
    darkMode, 
    setDarkMode, 
    customers, 
    seedSampleData,
    bullionRates
  } = useLedger();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(businessName);

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      setBusinessName(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const gold24kRate = bullionRates?.gold24k?.perGram;

  return (
    <header className="sticky top-0 z-30 glass-card border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Business Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Coins className="w-5 h-5" />
          </div>

          <div>
            {isEditingTitle ? (
              <div className="flex items-center space-x-1">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  className="px-2 py-1 text-sm rounded border border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => { setTempTitle(businessName); setIsEditingTitle(true); }}
                className="group flex items-center space-x-2 cursor-pointer"
                title="Click to rename business"
              >
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  {businessName}
                </h1>
                <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Jewelry Ledger & Bullion Manager
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'DASHBOARD'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Ledger Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('RATES')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'RATES'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Live Bullion Rates</span>
            {gold24kRate && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-600 text-white font-extrabold ml-1">
                ₹{gold24kRate}/g
              </span>
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* Seed Demo Data Button */}
          <button
            onClick={seedSampleData}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Load sample customer demo data"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Load Demo</span>
          </button>

          {/* Download Business PDF Report */}
          <button
            onClick={() => generateBusinessPdfReport(customers, businessName)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
            title="Download PDF Ledger Summary"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF Report</span>
          </button>

          {/* Backup / Restore Modal Trigger */}
          <button
            onClick={onOpenBackupModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Backup or restore database"
          >
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Tab switcher */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 px-4 py-2 bg-slate-50 dark:bg-slate-900">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
            activeTab === 'DASHBOARD' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('RATES')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
            activeTab === 'RATES' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Live Rates</span>
        </button>
      </div>
    </header>
  );
}
