import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LedgerProvider } from './context/LedgerContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { GoogleLoginScreen } from './components/GoogleLoginScreen';
import { BiometricPinOverlay } from './components/BiometricPinOverlay';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { CustomerList } from './components/CustomerList';
import { LiveBullionRates } from './components/LiveBullionRates';
import { ItemsCatalog } from './components/ItemsCatalog';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { AddCustomerModal } from './components/AddCustomerModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';

function MainAppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Sync active view with route URL
  const getTabFromPath = (path) => {
    if (path === '/catalog' || path === '/items') return 'ITEMS';
    if (path === '/rates') return 'RATES';
    return 'DASHBOARD';
  };

  const activeTab = getTabFromPath(location.pathname);

  const handleSetActiveTab = (tab) => {
    if (tab === 'ITEMS') navigate('/catalog');
    else if (tab === 'RATES') navigate('/rates');
    else navigate('/dashboard');
  };

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txInitialType, setTxInitialType] = useState('GAVE');
  const [txTargetCustomer, setTxTargetCustomer] = useState(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  const handleOpenAddTransaction = (customer, type = 'GAVE') => {
    setTxTargetCustomer(customer);
    setTxInitialType(type);
    setIsAddTxOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Top Navbar with Navigation Tabs */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        onOpenBackupModal={() => setIsBackupOpen(true)} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {activeTab === 'DASHBOARD' ? (
          <>
            {/* Top Financial Metric Summary Cards */}
            <SummaryCards 
              onAddCustomer={() => setIsAddCustomerOpen(true)}
            />

            {/* Analytics Charts (Credit Ratio & Top Balances) */}
            <AnalyticsCharts />

            {/* Searchable Customer Ledgers List */}
            <CustomerList
              onSelectCustomer={(customer) => setSelectedCustomer(customer)}
              onAddCustomer={() => setIsAddCustomerOpen(true)}
            />
          </>
        ) : activeTab === 'ITEMS' ? (
          /* Dedicated Jewelry Items Catalog View (/catalog) */
          <ItemsCatalog />
        ) : (
          /* Dedicated Live Bullion Rates View (/rates) */
          <LiveBullionRates />
        )}

      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-slate-200 dark:border-slate-800 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} JewelLedger & Live Bullion Tracker • Local Storage & PDF Statement Generator</p>
        </div>
      </footer>

      {/* Modals */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onAddTransaction={handleOpenAddTransaction}
        />
      )}

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onCustomerCreated={(newCust) => setSelectedCustomer(newCust)}
      />

      {txTargetCustomer && (
        <AddTransactionModal
          customer={txTargetCustomer}
          initialType={txInitialType}
          isOpen={isAddTxOpen}
          onClose={() => {
            setIsAddTxOpen(false);
            setTxTargetCustomer(null);
          }}
        />
      )}

      <BackupRestoreModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />

      {/* Persistent Biometric / Fingerprint & PIN Lock Overlay */}
      <BiometricPinOverlay />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <LedgerProvider>
        <AuthProvider>
          <HashRouter>
            <Routes>
              {/* Public Google Sign-In Screen */}
              <Route path="/login" element={<GoogleLoginScreen />} />
              <Route path="/landing" element={<LandingPage />} />

              {/* Protected Dashboard & Ledger Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <AuthGuard>
                    <MainAppContent />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/customers" 
                element={
                  <AuthGuard>
                    <MainAppContent />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/catalog" 
                element={
                  <AuthGuard>
                    <MainAppContent />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/items" 
                element={
                  <AuthGuard>
                    <MainAppContent />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/rates" 
                element={
                  <AuthGuard>
                    <MainAppContent />
                  </AuthGuard>
                } 
              />

              {/* Default & Wildcard Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </LedgerProvider>
    </LanguageProvider>
  );
}
