import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchLiveBullionRates } from '../utils/bullionRatesApi';
import { recordRateSnapshot } from '../utils/rateHistory';

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

const SAMPLE_INVENTORY_ITEMS = [
  {
    id: 'item_1',
    code: 'JW-G101',
    name: '22K Gold Chain',
    category: 'Chains',
    metalType: 'Gold',
    purity: '22K',
    grossWeightGrams: 8.8,
    netWeightGrams: 8.45,
    makingChargeType: 'FIXED',
    makingChargeValue: 1500,
    pricingMode: 'FIXED',
    fixedUnitPrice: 65000,
    stockQty: 5,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'item_2',
    code: 'JW-G102',
    name: 'Gold Ring',
    category: 'Rings',
    metalType: 'Gold',
    purity: '22K',
    grossWeightGrams: 4.8,
    netWeightGrams: 4.5,
    makingChargeType: 'FIXED',
    makingChargeValue: 800,
    pricingMode: 'FIXED',
    fixedUnitPrice: 34500,
    stockQty: 8,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'item_3',
    code: 'JW-S104',
    name: 'Silver Anklet',
    category: 'Anklets',
    metalType: 'Silver',
    purity: '925 Silver',
    grossWeightGrams: 155.0,
    netWeightGrams: 150.0,
    makingChargeType: 'FIXED',
    makingChargeValue: 1200,
    pricingMode: 'FIXED',
    fixedUnitPrice: 14200,
    stockQty: 12,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'item_4',
    code: 'JW-D103',
    name: '18K Diamond Solitaire Ring',
    category: 'Rings',
    metalType: 'Gold',
    purity: '18K',
    grossWeightGrams: 3.8,
    netWeightGrams: 3.5,
    makingChargeType: 'FIXED',
    makingChargeValue: 4500,
    pricingMode: 'FIXED',
    fixedUnitPrice: 48500,
    stockQty: 2,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'item_5',
    code: 'JW-B105',
    name: '24K Gold Coin (10 Grams)',
    category: 'Coins/Bars',
    metalType: 'Gold',
    purity: '24K',
    grossWeightGrams: 10.0,
    netWeightGrams: 10.0,
    makingChargeType: 'FIXED',
    makingChargeValue: 300,
    pricingMode: 'FIXED',
    fixedUnitPrice: 76500,
    stockQty: 15,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
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
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return SAMPLE_CUSTOMERS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('khatabook_transactions');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
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

  // Bullion Live Rates State with instant offline cache hydration
  const [bullionRates, setBullionRates] = useState(() => {
    try {
      const saved = localStorage.getItem('khatabook_last_known_rates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.rates) return parsed.rates;
      }
    } catch (e) {
      console.warn('Failed to parse cached rates', e);
    }
    return {
      gold24k: { perGram: 16298, per8g: 130384, per10g: 162980, perTola: 190096.61, change: { diff: 0, percent: 0, isUp: true } },
      gold22k: { perGram: 14940, per8g: 119520, per10g: 149400, perTola: 174257.17, change: { diff: 0, percent: 0, isUp: true } },
      gold18k: { perGram: 12224, per8g: 97792, per10g: 122240, perTola: 142578.3, change: { diff: 0, percent: 0, isUp: true } },
      silver999: { perGram: 265, per8g: 2120, per100g: 26500, perKg: 265000, change: { diff: 0, percent: 0, isUp: true } },
      silver925: { perGram: 245.13, per8g: 1961, per100g: 24513, perKg: 245125, change: { diff: 0, percent: 0, isUp: true } }
    };
  });
  const [ratesLastUpdated, setRatesLastUpdated] = useState(() => {
    try {
      const saved = localStorage.getItem('khatabook_last_known_rates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.timestamp) return parsed.timestamp;
      }
    } catch (e) {}
    return new Date().toISOString();
  });
  const [isRatesLoading, setIsRatesLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine !== false : true));

  // Admin Manual Override State
  const [overrideConfig, setOverrideConfig] = useState(() => {
    const saved = localStorage.getItem('khatabook_rate_override');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return {
            isOverride: Boolean(parsed.isOverride),
            gold24kPerGram: Number(parsed.gold24kPerGram) || 16298,
            gold22kPerGram: Number(parsed.gold22kPerGram) || 14940,
            gold18kPerGram: Number(parsed.gold18kPerGram) || 12224,
            silver999PerGram: Number(parsed.silver999PerGram) || 265,
            silver925PerGram: Number(parsed.silver925PerGram) || 245
          };
        }
      } catch (e) {}
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
      if (data && data.rates) {
        setBullionRates(data.rates);
        setRatesLastUpdated(data.timestamp || new Date().toISOString());
        setIsLiveConnected(Boolean(data.isLiveConnected && !data.isOffline));
        // Feature "Live prices -> Current trends": store a daily snapshot so the
        // Trends chart & Expected Prices forecast grow more accurate every day.
        recordRateSnapshot(cityToFetch, data.rates, data.timestamp);
      }
    } catch (err) {
      console.warn("Could not fetch latest rates, keeping cached data intact", err);
      setIsLiveConnected(false);
    } finally {
      setIsRatesLoading(false);
    }
  }, [selectedCity]);

  // Handle Online / Offline network status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsLiveConnected(true);
      refreshRates(selectedCity);
    };
    const handleOffline = () => {
      setIsLiveConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshRates, selectedCity]);

  // Poll rates every 30 seconds if online
  useEffect(() => {
    refreshRates(selectedCity);
    const interval = setInterval(() => {
      if (navigator.onLine !== false) {
        refreshRates(selectedCity);
      }
    }, 30000);
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
  const safeCustomers = Array.isArray(customers) ? customers : SAMPLE_CUSTOMERS;
  const safeTransactions = Array.isArray(transactions) ? transactions : SAMPLE_TRANSACTIONS;

  const customersWithBalance = safeCustomers.map(c => {
    const custTxs = safeTransactions.filter(t => t.customerId === c.id);
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

  // Inventory Master State
  const [inventoryItems, setInventoryItems] = useState(() => {
    const saved = localStorage.getItem('khatabook_inventory_items');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return SAMPLE_INVENTORY_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem('khatabook_inventory_items', JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  // Inventory CRUD Actions
  const addInventoryItem = (itemData) => {
    const rawPrice = itemData.price !== undefined ? itemData.price : itemData.fixedUnitPrice;
    const newItem = {
      id: itemData.id || `item_${Date.now()}`,
      code: itemData.code?.trim() || `JW-${Math.floor(100 + Math.random() * 900)}`,
      name: itemData.name.trim(),
      category: itemData.category || 'General Jewelry',
      metalType: itemData.metalType || 'Gold',
      purity: itemData.purity || '22K',
      grossWeightGrams: itemData.grossWeightGrams ? Number(itemData.grossWeightGrams) : (Number(itemData.netWeightGrams) || 0),
      netWeightGrams: Number(itemData.netWeightGrams) || 0,
      makingChargeType: itemData.makingChargeType || 'FIXED',
      makingChargeValue: Number(itemData.makingChargeValue) || 0,
      pricingMode: itemData.pricingMode || (rawPrice ? 'FIXED' : 'DYNAMIC'),
      fixedUnitPrice: Number(rawPrice) || 0,
      stockQty: itemData.stockQty !== undefined ? Number(itemData.stockQty) : 1,
      createdAt: itemData.createdAt || new Date().toISOString()
    };
    setInventoryItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateInventoryItem = (id, updatedData) => {
    const dataToUpdate = { ...updatedData };
    if (dataToUpdate.price !== undefined) {
      dataToUpdate.fixedUnitPrice = Number(dataToUpdate.price);
    }
    if (dataToUpdate.netWeightGrams !== undefined) {
      dataToUpdate.netWeightGrams = Number(dataToUpdate.netWeightGrams);
    }
    setInventoryItems(prev => prev.map(item => item.id === id ? { ...item, ...dataToUpdate } : item));
  };

  const deleteInventoryItem = (id) => {
    if (window.confirm('Are you sure you want to delete this jewelry item from inventory catalog?')) {
      setInventoryItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const deductInventoryStock = (id, qty = 1) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, (item.stockQty || 0) - qty);
        return { ...item, stockQty: newStock };
      }
      return item;
    }));
  };

  // Add Jewelry Sale Transaction & Manage Payments / Ledger Balance / Inventory Stock
  const addJewelrySale = (saleData) => {
    const {
      customerId,
      inventoryItemId,
      itemName,
      purity,
      grossWeightGrams,
      netWeightGrams,
      makingCharges,
      discount = 0,
      ratePerGram,
      totalAmount,
      paidAmount,
      paymentStatus, // 'FULL' | 'PARTIAL' | 'DUE'
      paymentMethod = 'Cash', // 'Cash' | 'UPI' | 'Bank Transfer'
      note = ''
    } = saleData;

    const saleTxId = `tx_${Date.now()}`;
    const nowIso = new Date().toISOString();

    // 1. Create Sale Entry (GAVE - Item Sold)
    const saleTx = {
      id: saleTxId,
      customerId,
      type: 'GAVE',
      amount: Number(totalAmount),
      category: 'Jewelry Sale',
      itemType: 'JEWELRY',
      jewelryCategory: itemName,
      purity: purity || '22K',
      grossWeightGrams: grossWeightGrams ? Number(grossWeightGrams) : null,
      netWeightGrams: netWeightGrams ? Number(netWeightGrams) : null,
      makingCharges: makingCharges ? Number(makingCharges) : 0,
      discount: Number(discount) || 0,
      city: selectedCity,
      appliedRate: ratePerGram ? Number(ratePerGram) : null,
      inventoryItemId: inventoryItemId || null,
      paymentStatus, // FULL, PARTIAL, DUE
      paidAmount: Number(paidAmount) || 0,
      dueAmount: Math.max(0, Number(totalAmount) - (Number(paidAmount) || 0)),
      paymentMethod,
      note: note.trim() || `Jewelry Sale: ${itemName} (${netWeightGrams || 0}g ${purity || ''})`,
      date: nowIso
    };

    const newTransactions = [saleTx];

    // 2. If Payment Received (FULL or PARTIAL), create GOT entry
    if (paidAmount && Number(paidAmount) > 0) {
      const paymentTx = {
        id: `tx_${Date.now() + 1}`,
        customerId,
        type: 'GOT',
        amount: Number(paidAmount),
        category: `Payment (${paymentMethod})`,
        itemType: 'GENERAL',
        note: `Payment for ${itemName} (${paymentStatus === 'FULL' ? 'Full Settlement' : 'Partial Payment'}) via ${paymentMethod}`,
        relatedSaleId: saleTxId,
        date: new Date(Date.now() + 10).toISOString()
      };
      newTransactions.push(paymentTx);
    }

    setTransactions(prev => [...newTransactions, ...prev]);

    // 3. Deduct stock quantity in inventory catalog if linked
    if (inventoryItemId) {
      deductInventoryStock(inventoryItemId, 1);
    }

    return saleTx;
  };

  const seedSampleData = () => {
    if (window.confirm('Reset app data to sample demo records including bullion transactions and inventory?')) {
      setCustomers(SAMPLE_CUSTOMERS);
      setTransactions(SAMPLE_TRANSACTIONS);
      setInventoryItems(SAMPLE_INVENTORY_ITEMS);
    }
  };

  const exportBackup = () => {
    const backupData = {
      businessName,
      customers,
      transactions,
      inventoryItems,
      overrideConfig,
      defaultCity,
      exportedAt: new Date().toISOString(),
      app: 'Khatabook Web Ledger with Jewelry Inventory & Bullion'
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
        if (parsed.inventoryItems) setInventoryItems(parsed.inventoryItems);
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
      inventoryItems,
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
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      deductInventoryStock,
      addJewelrySale,
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
