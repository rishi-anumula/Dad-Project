import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchLiveBullionRates } from '../utils/bullionRatesApi';

const LedgerContext = createContext();

const SAMPLE_CUSTOMERS = [
  {
    id: 'cust_1',
    name: 'Rajesh Sharma',
    phone: '9876543210',
    address: 'Shop #12, Main Market',
    tag: 'Regular Customer',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'cust_2',
    name: 'Priya Verma',
    phone: '9123456789',
    address: 'Flat 402, Green Enclave',
    tag: 'Wholesale Buyer',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'cust_3',
    name: 'Amit Patel',
    phone: '9988776655',
    address: 'Plot 45, Sector 9',
    tag: 'VIP Client',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'cust_4',
    name: 'Sneha Gupta',
    phone: '9811223344',
    address: 'Near City Hospital',
    tag: 'Regular Customer',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

const SAMPLE_TRANSACTIONS = [
  {
    id: 'tx_1',
    customerId: 'cust_1',
    type: 'GAVE',
    amount: 69800,
    category: 'Gold Jewelry',
    itemType: 'JEWELRY',
    jewelryCategory: 'Gold Chain',
    purity: '22K',
    netWeightGrams: 10.0,
    makingCharges: 1200,
    note: '22K Gold Hallmark Chain (10g)',
    date: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'tx_2',
    customerId: 'cust_1',
    type: 'GOT',
    amount: 20000,
    category: 'UPI Payment',
    itemType: 'GENERAL',
    note: 'Partial payment via PhonePe',
    date: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'tx_3',
    customerId: 'cust_2',
    type: 'GAVE',
    amount: 14200,
    category: 'Silver Articles',
    itemType: 'JEWELRY',
    jewelryCategory: 'Silver Anklet',
    purity: '925 Silver',
    netWeightGrams: 150.0,
    makingCharges: 1900,
    note: 'Pair of Heavy 925 Silver Anklets',
    date: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'tx_4',
    customerId: 'cust_3',
    type: 'GOT',
    amount: 15000,
    category: 'Cash',
    itemType: 'GENERAL',
    note: 'Advance deposit for gold ring order',
    date: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export function LedgerProvider({ children }) {
  const [businessName, setBusinessName] = useState(() => {
    return localStorage.getItem('khatabook_business_name') || 'JewelLedger & Bullion Store';
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('khatabook_theme') === 'dark';
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('khatabook_customers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return SAMPLE_CUSTOMERS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('khatabook_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return SAMPLE_TRANSACTIONS;
  });

  // City Selection & Default Shop City State
  const [defaultCity, setDefaultCityState] = useState(() => {
    return localStorage.getItem('khatabook_default_city') || 'hyderabad';
  });

  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('khatabook_default_city') || 'hyderabad';
  });

  // Bullion Live Rates State
  const [bullionRates, setBullionRates] = useState(null);
  const [ratesLastUpdated, setRatesLastUpdated] = useState(null);
  const [isRatesLoading, setIsRatesLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  // Admin Manual Override State
  const [overrideConfig, setOverrideConfig] = useState(() => {
    const saved = localStorage.getItem('khatabook_rate_override');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      isOverride: false,
      gold24kPerGram: 16298,
      gold22kPerGram: 14940,
      gold18kPerGram: 12224,
      silver999PerGram: 265,
      silver925PerGram: 245
    };
  });

  const refreshRates = useCallback(async (targetCity) => {
    const cityToFetch = targetCity || selectedCity;
    setIsRatesLoading(true);
    try {
      const data = await fetchLiveBullionRates(cityToFetch);
      setBullionRates(data.rates);
      setRatesLastUpdated(data.timestamp);
      setIsLiveConnected(data.isLiveConnected !== false);
    } catch (err) {
      console.error("Error fetching live rates", err);
      setIsLiveConnected(false);
    } finally {
      setIsRatesLoading(false);
    }
  }, [selectedCity]);

  // Poll rates every 30 seconds
  useEffect(() => {
    refreshRates(selectedCity);
    const interval = setInterval(() => refreshRates(selectedCity), 30000);
    return () => clearInterval(interval);
  }, [refreshRates, selectedCity]);

  const changeSelectedCity = (newCity) => {
    setSelectedCity(newCity);
    refreshRates(newCity);
  };

  const setDefaultShopCity = (newCity) => {
    setDefaultCityState(newCity);
    localStorage.setItem('khatabook_default_city', newCity);
    setSelectedCity(newCity);
    refreshRates(newCity);
  };

  useEffect(() => {
    localStorage.setItem('khatabook_rate_override', JSON.stringify(overrideConfig));
  }, [overrideConfig]);

  // Derived effective rates: Manual Override vs Auto-Sync Live
  const effectiveBullionRates = React.useMemo(() => {
    if (overrideConfig.isOverride) {
      const g24 = Number(overrideConfig.gold24kPerGram) || 16298;
      const g22 = Number(overrideConfig.gold22kPerGram) || +(g24 * 0.916).toFixed(2);
      const g18 = Number(overrideConfig.gold18kPerGram) || +(g24 * 0.750).toFixed(2);
      const s999 = Number(overrideConfig.silver999PerGram) || 265;
      const s925 = Number(overrideConfig.silver925PerGram) || +(s999 * 0.925).toFixed(2);

      return {
        gold24k: {
          perGram: g24,
          per8g: +(g24 * 8).toFixed(2),
          per10g: +(g24 * 10).toFixed(2),
          perTola: +(g24 * 11.6638).toFixed(2),
          change: { diff: 0, percent: 0, isUp: true }
        },
        gold22k: {
          perGram: g22,
          per8g: +(g22 * 8).toFixed(2),
          per10g: +(g22 * 10).toFixed(2),
          perTola: +(g22 * 11.6638).toFixed(2),
          change: { diff: 0, percent: 0, isUp: true }
        },
        gold18k: {
          perGram: g18,
          per8g: +(g18 * 8).toFixed(2),
          per10g: +(g18 * 10).toFixed(2),
          perTola: +(g18 * 11.6638).toFixed(2),
          change: { diff: 0, percent: 0, isUp: true }
        },
        silver999: {
          perGram: s999,
          per8g: +(s999 * 8).toFixed(2),
          per100g: +(s999 * 100).toFixed(2),
          perKg: +(s999 * 1000).toFixed(2),
          change: { diff: 0, percent: 0, isUp: true }
        },
        silver925: {
          perGram: s925,
          per8g: +(s925 * 8).toFixed(2),
          per100g: +(s925 * 100).toFixed(2),
          perKg: +(s925 * 1000).toFixed(2),
          change: { diff: 0, percent: 0, isUp: true }
        }
      };
    }
    return bullionRates;
  }, [overrideConfig, bullionRates]);

  // Active Customer List Filter State ('ALL' | 'GET' | 'GIVE' | 'SETTLED')
  const [customerListFilter, setCustomerListFilter] = useState('ALL');
  const [settledToast, setSettledToast] = useState(null);

  const updateOverrideConfig = (newConfig) => {
    setOverrideConfig(prev => ({ ...prev, ...newConfig }));
  };

  const toggleAutoSync = () => {
    setOverrideConfig(prev => ({ ...prev, isOverride: !prev.isOverride }));
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('khatabook_business_name', businessName);
  }, [businessName]);

  useEffect(() => {
    localStorage.setItem('khatabook_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('khatabook_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('khatabook_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Derived Customers with balance calculation
  const customersWithBalance = customers.map(c => {
    const custTxs = transactions.filter(t => t.customerId === c.id);
    let net = 0;
    custTxs.forEach(t => {
      if (t.type === 'GAVE') {
        net += Number(t.amount);
      } else {
        net -= Number(t.amount);
      }
    });
    return { ...c, netBalance: net, transactionCount: custTxs.length };
  });

  // Totals
  const totalYouWillGet = customersWithBalance.reduce((acc, c) => acc + (c.netBalance > 0 ? c.netBalance : 0), 0);
  const totalYouWillGive = customersWithBalance.reduce((acc, c) => acc + (c.netBalance < 0 ? Math.abs(c.netBalance) : 0), 0);
  const netBusinessBalance = totalYouWillGet - totalYouWillGive;

  // Actions
  const addCustomer = (customerData) => {
    const newCustomer = {
      id: `cust_${Date.now()}`,
      name: customerData.name.trim(),
      phone: customerData.phone?.trim() || '',
      address: customerData.address?.trim() || '',
      tag: customerData.tag || 'Customer',
      initialItem: customerData.initialItem || null,
      initialWeightGrams: customerData.initialWeightGrams || null,
      purity: customerData.purity || '22K',
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id, updatedData) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const deleteCustomer = (id) => {
    if (window.confirm('Are you sure you want to delete this customer and all their transaction history?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      setTransactions(prev => prev.filter(t => t.customerId !== id));
    }
  };

  const addTransaction = (txData) => {
    const newTx = {
      id: `tx_${Date.now()}`,
      customerId: txData.customerId,
      type: txData.type,
      amount: Number(txData.amount),
      category: txData.category || 'General',
      itemType: txData.itemType || 'GENERAL',
      jewelryCategory: txData.jewelryCategory || null,
      purity: txData.purity || null,
      netWeightGrams: txData.netWeightGrams ? Number(txData.netWeightGrams) : null,
      makingCharges: txData.makingCharges ? Number(txData.makingCharges) : null,
      city: txData.city || selectedCity || 'hyderabad',
      appliedRate: txData.appliedRate ? Number(txData.appliedRate) : null,
      note: txData.note || '',
      date: txData.date || new Date().toISOString()
    };
    
    // Check if this payment settles customer balance -> redirect to Settled page
    const targetCust = customersWithBalance.find(c => c.id === txData.customerId);
    if (targetCust) {
      const prevBal = targetCust.netBalance;
      const amountNum = Number(txData.amount);
      const newBal = txData.type === 'GAVE' ? prevBal + amountNum : prevBal - amountNum;
      
      // If customer balance was positive and now reached 0 or less via GOT entry
      if (txData.type === 'GOT' && prevBal > 0 && newBal <= 0) {
        setCustomerListFilter('SETTLED');
        setSettledToast({
          show: true,
          title: 'Account Settled!',
          message: `🎉 ${targetCust.name} has paid the full amount and is now moved to the Settled Ledgers page.`
        });
        setTimeout(() => setSettledToast(null), 6000);
      }
    }

    setTransactions(prev => [newTx, ...prev]);
    return newTx;
  };

  const deleteTransaction = (txId) => {
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      setTransactions(prev => prev.filter(t => t.id !== txId));
    }
  };

  const seedSampleData = () => {
    if (window.confirm('Reset app data to sample demo records including bullion transactions?')) {
      setCustomers(SAMPLE_CUSTOMERS);
      setTransactions(SAMPLE_TRANSACTIONS);
    }
  };

  const exportBackup = () => {
    const backupData = {
      businessName,
      customers,
      transactions,
      overrideConfig,
      defaultCity,
      exportedAt: new Date().toISOString(),
      app: 'Khatabook Web Ledger with Live Bullion'
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Khatabook_Jewelry_Backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackup = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.customers && parsed.transactions) {
        if (parsed.businessName) setBusinessName(parsed.businessName);
        setCustomers(parsed.customers);
        setTransactions(parsed.transactions);
        if (parsed.overrideConfig) setOverrideConfig(parsed.overrideConfig);
        if (parsed.defaultCity) {
          setDefaultCityState(parsed.defaultCity);
          setSelectedCity(parsed.defaultCity);
        }
        alert('Data backup successfully restored!');
        return true;
      }
      alert('Invalid backup file format.');
      return false;
    } catch (err) {
      alert('Error reading JSON backup file.');
      return false;
    }
  };

  return (
    <LedgerContext.Provider value={{
      businessName,
      setBusinessName,
      darkMode,
      setDarkMode,
      customers: customersWithBalance,
      transactions,
      totalYouWillGet,
      totalYouWillGive,
      netBusinessBalance,
      selectedCity,
      defaultCity,
      changeSelectedCity,
      setDefaultShopCity,
      bullionRates: effectiveBullionRates,
      rawBullionRates: bullionRates,
      ratesLastUpdated,
      isRatesLoading,
      isLiveConnected,
      refreshRates,
      overrideConfig,
      updateOverrideConfig,
      toggleAutoSync,
      customerListFilter,
      setCustomerListFilter,
      settledToast,
      setSettledToast,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addTransaction,
      deleteTransaction,
      seedSampleData,
      exportBackup,
      importBackup
    }}>
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  const context = useContext(LedgerContext);
  if (!context) throw new Error('useLedger must be used within a LedgerProvider');
  return context;
}
