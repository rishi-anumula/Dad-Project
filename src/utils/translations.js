export const translations = {
  en: {
    // Navigation
    nav: {
      brand: "JewelLedger",
      subBrand: "Gold & Silver Ledger",
      dashboard: "Customers & Ledger",
      itemsCatalog: "Items Catalog",
      liveRates: "Live Bullion Rates",
      backupRestore: "Backup & Restore",
      language: "Language",
      selectLanguage: "Select Language"
    },

    // Language options
    languages: {
      en: "English",
      hi: "हिंदी (Hindi)",
      te: "తెలుగు (Telugu)"
    },

    // Financial / Khatabook Terms
    financial: {
      totalYouWillGet: "Total You'll Get",
      totalYouWillGive: "Total You'll Give",
      netBalance: "Net Ledger Balance",
      youWillGet: "You'll Get",
      youWillGive: "You'll Give",
      accountSettled: "Account Settled",
      settledZero: "Settled (₹0)",
      settledPageNotice: "Showing Settled Accounts",
      paymentReceived: "Payment Received",
      balanceDue: "Balance Due",
      saveEntry: "Save Entry",
      settleAccount: "Settle Account",
      fullSettlement: "Full Settlement Done",
      quickAddCustomer: "+ New Customer",
      addTransaction: "Add Entry"
    },

    // Customer & Ledger List
    customer: {
      customerLedgers: "Customer Ledgers",
      selectCustomerNotice: "Select a customer to view complete transaction history or add payments",
      addNewCustomer: "Add New Customer",
      searchPlaceholder: "Search by customer name, phone number...",
      filterAll: "All",
      filterGet: "You'll Get",
      filterGive: "You'll Give",
      filterSettled: "Settled (₹0)",
      sortRecent: "Sort: Most Recent",
      sortBalance: "Sort: Highest Balance",
      sortName: "Sort: Name (A-Z)",
      noCustomersFound: "No customers found matching your filter options.",
      addCustomerNow: "Add a new customer now",
      transactionsCount: "transactions",
      regularCustomer: "Regular Customer",
      vipClient: "VIP Client",
      wholesaleBuyer: "Wholesale Buyer",
      supplier: "Supplier"
    },

    // Add Customer Modal
    addCustomerModal: {
      title: "Add New Customer & Select Items",
      subtitle: "Create customer ledger profile & attach catalog jewelry items instantly",
      personalDetails: "Customer Personal Details",
      nameLabel: "Customer Name *",
      namePlaceholder: "e.g. Rajesh Sharma",
      phoneLabel: "Mobile Number (WhatsApp)",
      phonePlaceholder: "e.g. 9876543210",
      addressLabel: "Address / Landmark (Optional)",
      addressPlaceholder: "Address or customer landmark notes...",
      selectFromCatalog: "Select Items from Catalog",
      available: "Available",
      searchCatalogPlaceholder: "Search catalog items by name or weight...",
      totalOrderAmount: "Total Order Amount",
      amountPaidLabel: "Amount Paid / Received (₹)",
      openingBalanceDue: "Calculated Opening Balance Due (Customer Credit):",
      createButton: "Create Customer",
      attachItemsSuffix: "& Attach {{count}} Items",
      nameRequiredError: "Customer name is required."
    },

    // Customer Detail Modal
    customerDetailModal: {
      currentNetBalance: "Current Net Balance Status",
      customJewelryBilling: "+ Custom Jewelry Billing",
      whatsapp: "WhatsApp Reminder",
      pdfStatement: "PDF Statement",
      quickAddCatalog: "Quick Add Items from Catalog",
      hideCatalogPanel: "Hide Catalog Panel",
      showCatalogPanel: "Show Catalog Panel",
      filterCatalogPlaceholder: "Filter items by name, purity, or weight...",
      ledgerTimeline: "Customer Ledger Timeline",
      filterTimelinePlaceholder: "Filter entries by item or weight...",
      noEntriesYet: "No entries recorded for this customer yet.",
      youGaveButton: "YOU GAVE ₹",
      youGotButton: "YOU GOT ₹",
      deleteCustomer: "Delete Customer"
    },

    // Jewelry Terms & Specifications
    jewelry: {
      gold: "Gold",
      silver: "Silver",
      purity: "Purity",
      netWeightGrams: "Net Weight (g)",
      grossWeightGrams: "Gross Weight (g)",
      makingCharges: "Making Charges (₹)",
      discount: "Discount (₹)",
      basePrice: "Catalog Base Price (₹)",
      totalAmount: "Total Amount (₹)",
      finalBillAmount: "Final Bill Amount:",
      itemType: "Entry Type Category",
      jewelryMetalItem: "Jewelry / Metal Item",
      generalFinancialEntry: "General Financial Entry",
      metalCategory: "Metal Category",
      goldJewelry: "Gold Jewelry",
      silverArticles: "Silver Articles",
      generalMetal: "General Metal / Other",
      itemArticle: "Item Article",
      ring: "Ring",
      chain: "Chain",
      bangle: "Bangle / Bracelet",
      necklace: "Necklace Set",
      coinBar: "Bullion Coin / Bar",
      anklet: "Silver Anklet (Payal)",
      utensil: "Silver Utensil / Article",
      purity24k: "24K (99.9%)",
      purity22k: "22K (91.6%)",
      purity18k: "18K (75.0%)",
      purity999Silver: "999 Silver",
      purity925Silver: "925 Silver",
      appliedBenchmarkRate: "Applied Benchmark Rate",
      perGram: "/ gram"
    },

    // Transaction Modals (Add / Edit)
    transactionModal: {
      entryFor: "Entry for",
      youGaveTitle: "YOU GAVE (Jewelry / Credit)",
      youGotTitle: "YOU GOT (Payment / Return)",
      youGaveTab: "YOU GAVE ₹",
      youGotTab: "YOU GOT ₹",
      settleFullBalance: "Settle Full Balance",
      remarkLabel: "Remark / Description",
      remarkPlaceholder: "e.g. 22K Hallmark Chain (10g), Invoice #204...",
      dateTimeLabel: "Date & Time",
      saveGaveButton: "Save YOU GAVE Entry",
      saveGotButton: "Save YOU GOT Entry",
      validAmountError: "Please enter a valid total amount (> 0)"
    },

    // Jewelry Sale Billing Modal
    jewelrySaleModal: {
      title: "+ Add Jewelry Item / Sale",
      subtitle: "Customer Direct Billing",
      selectCatalogItem: "Select Item from Catalog *",
      searchCatalogPrompt: "Search and select pre-saved item from catalog...",
      itemSearchPlaceholder: "Type item name (e.g. 22K Gold Chain)...",
      itemNameAuto: "Item Name (Auto-filled) *",
      paymentStatusTitle: "Payment & Transaction Status *",
      dueCredit: "Due / Credit (Unpaid)",
      paidCashUpi: "Paid (Cash / UPI)",
      paymentMode: "Payment Mode:",
      cash: "Cash",
      upi: "UPI",
      bankTransfer: "Bank Transfer",
      confirmSaleButton: "Confirm & Log Jewelry Sale"
    },

    // Items Catalog Page
    itemsCatalog: {
      title: "Jewelry Items Inventory & Catalog",
      subtitle: "Manage pre-set jewelry designs, stock quantities & fixed unit prices",
      addNewItem: "+ Add New Item",
      searchItemsPlaceholder: "Search catalog by item name, code, metal, purity...",
      totalItems: "Total Items",
      totalStock: "Total Stock Qty",
      filterAllCategory: "All Categories",
      filterGold: "Gold Items",
      filterSilver: "Silver Items",
      code: "Code:",
      stock: "Stock:",
      pcs: "pcs",
      editItem: "Edit",
      deleteItem: "Delete",
      noItemsFound: "No catalog items found matching your criteria."
    },

    // Add Item Modal
    addItemModal: {
      addTitle: "Add New Jewelry Catalog Item",
      editTitle: "Edit Jewelry Catalog Item",
      itemNameLabel: "Item Name *",
      itemNamePlaceholder: "e.g. 22K Designer Gold Chain",
      itemCodeLabel: "Item SKU / Code (Optional)",
      itemCodePlaceholder: "e.g. GC-204",
      fixedUnitPriceLabel: "Fixed Unit Sale Price (₹) *",
      fixedPricePlaceholder: "e.g. 45000",
      stockQuantityLabel: "Stock Quantity (Pcs)",
      saveItemButton: "Save Catalog Item",
      updateItemButton: "Update Catalog Item"
    },

    // Live Bullion Rates Page
    liveRatesPage: {
      title: "Live Domestic Indian Bullion Rates",
      subtitle: "Real-time IBJA benchmark retail gold & silver rates per Indian city",
      selectCityLabel: "Select Indian Benchmark City:",
      gold24kTitle: "24K Fine Gold (99.9%)",
      gold22kTitle: "22K Standard Gold (91.6%)",
      gold18kTitle: "18K Jewelry Gold (75.0%)",
      silver999Title: "999 Fine Silver",
      silver925Title: "925 Sterling Silver",
      perGram: "1 Gram",
      per8Grams: "8 Grams (Sovereign)",
      per10Grams: "10 Grams",
      perTola: "1 Tola (11.66g)",
      per100Grams: "100 Grams",
      perKg: "1 Kilogram (1000g)",
      liveBadge: "LIVE FEED",
      cityBenchmark: "City Benchmark Rate"
    },

    // Common Actions & Notifications
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      close: "Close",
      confirm: "Confirm",
      search: "Search",
      filter: "Filter",
      success: "Success",
      error: "Error",
      yes: "Yes",
      no: "No",
      qty: "Qty",
      add: "Add",
      added: "Added",
      gotIt: "Got it"
    }
  },

  hi: {
    // Navigation
    nav: {
      brand: "ज्वेललेजर्",
      subBrand: "सोना एवं चाँदी खाता पुस्तक",
      dashboard: "ग्राहक एवं बहीखाता",
      itemsCatalog: "आभूषण सूची (कैटलॉग)",
      liveRates: "लाइव सोने-चांदी के भाव",
      backupRestore: "बैकअप एवं रिस्टोर",
      language: "भाषा",
      selectLanguage: "भाषा चुनें"
    },

    // Language options
    languages: {
      en: "English",
      hi: "हिंदी (Hindi)",
      te: "తెలుగు (Telugu)"
    },

    // Financial / Khatabook Terms
    financial: {
      totalYouWillGet: "कुल आपको मिलेंगे",
      totalYouWillGive: "कुल आपको देने हैं",
      netBalance: "कुल बहीखाता शेष (नेट बैलेंस)",
      youWillGet: "आपको मिलेंगे",
      youWillGive: "आपको देने हैं",
      accountSettled: "खाता चुकता (बराबर)",
      settledZero: "चुकता (₹0)",
      settledPageNotice: "चुकता खाते दर्शाए जा रहे हैं",
      paymentReceived: "भुगतान प्राप्त हुआ",
      balanceDue: "बकाया राशि",
      saveEntry: "दर्ज करें",
      settleAccount: "खाता चुकता करें",
      fullSettlement: "पूर्ण भुगतान संपन्न (₹0)",
      quickAddCustomer: "+ नया ग्राहक जोड़ें",
      addTransaction: "नई एंट्री जोड़ें"
    },

    // Customer & Ledger List
    customer: {
      customerLedgers: "ग्राहक बहीखाता सूची",
      selectCustomerNotice: "पूरा लेन-देन विवरण देखने या भुगतान जोड़ने के लिए ग्राहक चुनें",
      addNewCustomer: "नया ग्राहक जोड़ें",
      searchPlaceholder: "ग्राहक का नाम, मोबाइल नंबर से खोजें...",
      filterAll: "सभी",
      filterGet: "आपको मिलेंगे",
      filterGive: "आपको देने हैं",
      filterSettled: "चुकता (₹0)",
      sortRecent: "क्रम: हालिया (नवीनतम)",
      sortBalance: "क्रम: उच्चतम बकाया",
      sortName: "क्रम: नाम (अ-ज़)",
      noCustomersFound: "इस फ़िल्टर से कोई ग्राहक नहीं मिला।",
      addCustomerNow: "अभी नया ग्राहक जोड़ें",
      transactionsCount: "लेन-देन",
      regularCustomer: "नियमित ग्राहक",
      vipClient: "वीआईपी ग्राहक",
      wholesaleBuyer: "थोक खरीदार",
      supplier: "सप्लायर / विक्रेता"
    },

    // Add Customer Modal
    addCustomerModal: {
      title: "नया ग्राहक जोड़ें एवं आभूषण चुनें",
      subtitle: "ग्राहक प्रोफ़ाइल बनाएं और कैटलॉग से तुरंत आभूषण जोड़ें",
      personalDetails: "ग्राहक का व्यक्तिगत विवरण",
      nameLabel: "ग्राहक का नाम *",
      namePlaceholder: "उदा. राजेश शर्मा",
      phoneLabel: "मोबाइल नंबर (व्हाट्सएप)",
      phonePlaceholder: "उदा. 9876543210",
      addressLabel: "पता / लैंडमार्क (वैकल्पिक)",
      addressPlaceholder: "ग्राहक का पता या विवरण...",
      selectFromCatalog: "कैटलॉग से आभूषण चुनें",
      available: "उपलब्ध",
      searchCatalogPlaceholder: "नाम या वजन से आभूषण खोजें...",
      totalOrderAmount: "कुल आर्डर मूल्य",
      amountPaidLabel: "प्राप्त/जमा राशि (₹)",
      openingBalanceDue: "प्रारंभिक बकाया राशि (उधार बही):",
      createButton: "ग्राहक खाता बनाएं",
      attachItemsSuffix: "एवं {{count}} आभूषण जोड़ें",
      nameRequiredError: "ग्राहक का नाम अनिवार्य है।"
    },

    // Customer Detail Modal
    customerDetailModal: {
      currentNetBalance: "वर्तमान खाता स्थिति (बैलेंस स्टेटस)",
      customJewelryBilling: "+ आभूषण बिक्री बिल बनाएं",
      whatsapp: "व्हाट्सएप मैसेज",
      pdfStatement: "PDF स्टेटमेन्ट डाउनलोड",
      quickAddCatalog: "कैटलॉग से त्वरित आभूषण जोड़ें",
      hideCatalogPanel: "कैटलॉग पैनल छिपाएं",
      showCatalogPanel: "कैटलॉग पैनल दिखाएं",
      filterCatalogPlaceholder: "नाम, शुद्धता या वजन से खोजें...",
      ledgerTimeline: "ग्राहक लेन-देन टाइमलाइन",
      filterTimelinePlaceholder: "आभूषण या वजन से एंट्री फ़िल्टर करें...",
      noEntriesYet: "इस ग्राहक के लिए अभी कोई लेन-देन दर्ज नहीं है।",
      youGaveButton: "आपने दिया ₹",
      youGotButton: "आपको मिला ₹",
      deleteCustomer: "ग्राहक हटाएं"
    },

    // Jewelry Terms & Specifications
    jewelry: {
      gold: "सोना",
      silver: "चाँदी",
      purity: "शुद्धता",
      netWeightGrams: "शुद्ध वजन (ग्राम)",
      grossWeightGrams: "कुल वजन (ग्राम)",
      makingCharges: "बनावट शुल्क / मजूरी (₹)",
      discount: "छूट / डिस्काउंट (₹)",
      basePrice: "कैटलॉग बेस मूल्य (₹)",
      totalAmount: "कुल राशि (₹)",
      finalBillAmount: "अंतिम बिल राशि:",
      itemType: "लेन-देन प्रकार",
      jewelryMetalItem: "आभूषण / धातु आइटम",
      generalFinancialEntry: "सामान्य वित्तीय लेन-देन",
      metalCategory: "धातु श्रेणी",
      goldJewelry: "सोने के आभूषण",
      silverArticles: "चाँदी की वस्तुएं",
      generalMetal: "सामान्य धातु / अन्य",
      itemArticle: "आभूषण का प्रकार",
      ring: "अंगूठी (रिंग)",
      chain: "चैन (Chain)",
      bangle: "कंगन / चूड़ी",
      necklace: "हार (नेकलेस सेट)",
      coinBar: "सोने/चांदी का सिक्का या बार",
      anklet: "चाँदी की पायल",
      utensil: "चाँदी के बर्तन / वस्तु",
      purity24k: "24K (99.9% शुद्ध)",
      purity22k: "22K (91.6% शुद्ध)",
      purity18k: "18K (75.0% शुद्ध)",
      purity999Silver: "999 चाँदी",
      purity925Silver: "925 चाँदी",
      appliedBenchmarkRate: "लागू बाजार भाव (दर)",
      perGram: "/ ग्राम"
    },

    // Transaction Modals (Add / Edit)
    transactionModal: {
      entryFor: "ग्राहक खाता:",
      youGaveTitle: "आपने दिया (आभूषण / उधार)",
      youGotTitle: "आपको मिला (भुगतान / जमा)",
      youGaveTab: "आपने दिया ₹",
      youGotTab: "आपको मिला ₹",
      settleFullBalance: "पूरा बकाया चुकता करें",
      remarkLabel: "विवरण / रिमार्क",
      remarkPlaceholder: "उदा. 22K हॉलमार्क चैन (10 ग्राम), बिल #204...",
      dateTimeLabel: "दिनांक एवं समय",
      saveGaveButton: "दिया गया एंट्री दर्ज करें",
      saveGotButton: "प्राप्त भुगतान दर्ज करें",
      validAmountError: "कृपया सही कुल राशि दर्ज करें (> 0)"
    },

    // Jewelry Sale Billing Modal
    jewelrySaleModal: {
      title: "+ नया आभूषण बिक्री बिल दर्ज करें",
      subtitle: "ग्राहक सीधी बिलिंग प्रणाली",
      selectCatalogItem: "कैटलॉग से आभूषण चुनें *",
      searchCatalogPrompt: "कैटलॉग से पूर्व-सहेजा गया आभूषण खोजें...",
      itemSearchPlaceholder: "आभूषण का नाम टाइप करें (उदा. 22K सोने की चैन)...",
      itemNameAuto: "आभूषण का नाम (स्वचालित) *",
      paymentStatusTitle: "भुगतान एवं लेन-देन स्थिति *",
      dueCredit: "उधार / बकाया (अदत्त)",
      paidCashUpi: "नकद / ऑनलाइन भुगतान (दत्त)",
      paymentMode: "भुगतान का माध्यम:",
      cash: "नकद (Cash)",
      upi: "यूपीआई (UPI)",
      bankTransfer: "बैंक ट्रांसफर",
      confirmSaleButton: "आभूषण बिक्री दर्ज करें"
    },

    // Items Catalog Page
    itemsCatalog: {
      title: "आभूषण स्टॉक एवं कैटलॉग सूची",
      subtitle: "आभूषण डिज़ाइनों का स्टॉक, प्रति इकाई मूल्य एवं विवरण प्रबंधित करें",
      addNewItem: "+ नया आभूषण जोड़ें",
      searchItemsPlaceholder: "आभूषण का नाम, कोड, धातु या शुद्धता से खोजें...",
      totalItems: "कुल आभूषण प्रकार",
      totalStock: "कुल स्टॉक मात्रा",
      filterAllCategory: "सभी श्रेणियां",
      filterGold: "सोने के आभूषण",
      filterSilver: "चाँदी के आभूषण",
      code: "कोड:",
      stock: "स्टॉक:",
      pcs: "नग",
      editItem: "संशोधित करें",
      deleteItem: "हटाएं",
      noItemsFound: "कोई आभूषण नहीं मिला।"
    },

    // Add Item Modal
    addItemModal: {
      addTitle: "कैटलॉग में नया आभूषण जोड़ें",
      editTitle: "कैटलॉग आभूषण बदलें",
      itemNameLabel: "आभूषण का नाम *",
      itemNamePlaceholder: "उदा. 22K डिज़ाइनर गोल्ड चैन",
      itemCodeLabel: "आइटम कोड / SKU (वैकल्पिक)",
      itemCodePlaceholder: "उदा. GC-204",
      fixedUnitPriceLabel: "निश्चित प्रति नग विक्रय मूल्य (₹) *",
      fixedPricePlaceholder: "उदा. 45000",
      stockQuantityLabel: "स्टॉक मात्रा (नग)",
      saveItemButton: "कैटलॉग में सहेजें",
      updateItemButton: "अद्यतन (अपडेट) करें"
    },

    // Live Bullion Rates Page
    liveRatesPage: {
      title: "भारत के प्रमुख शहरों में सोने-चांदी के लाइव भाव",
      subtitle: "IBJA द्वारा जारी भारतीय शहरों के खुदरा सोने एवं चांदी के प्रामाणिक दरें",
      selectCityLabel: "भारतीय शहर चुनें:",
      gold24kTitle: "24K शुद्ध सोना (99.9%)",
      gold22kTitle: "22K मानक सोना (91.6%)",
      gold18kTitle: "18K आभूषण सोना (75.0%)",
      silver999Title: "999 शुद्ध चाँदी",
      silver925Title: "925 स्टर्लिंग चाँदी",
      perGram: "1 ग्राम",
      per8Grams: "8 ग्राम (सॉवरेन / गिन्नी)",
      per10Grams: "10 ग्राम",
      perTola: "1 तोोला (11.66 ग्राम)",
      per100Grams: "100 ग्राम",
      perKg: "1 किलोग्राम (1000 ग्राम)",
      liveBadge: "लाइव अपडेट",
      cityBenchmark: "शहर बाजार दर"
    },

    // Common Actions & Notifications
    common: {
      save: "सहेजें",
      cancel: "रद्द करें",
      delete: "हटाएं",
      close: "बंद करें",
      confirm: "पुष्टि करें",
      search: "खोजें",
      filter: "फ़िल्टर",
      success: "सफल",
      error: "त्रुटि",
      yes: "हाँ",
      no: "नहीं",
      qty: "मात्रा",
      add: "जोड़ें",
      added: "जोड़ा गया",
      gotIt: "समझ गया"
    }
  },

  te: {
    // Navigation
    nav: {
      brand: "జ్యువెల్ లెడ్జర్",
      subBrand: "బంగారం & వెండి ఖాతా పుస్తకం",
      dashboard: "ఖాతాదారులు (కస్టమర్లు)",
      itemsCatalog: "నగల జాబితా (కాటలాగ్)",
      liveRates: "లైవ్ బంగారం/వెండి ధరలు",
      backupRestore: "బ్యాకప్ & రీస్టోర్",
      language: "భాష",
      selectLanguage: "భాషను ఎంచుకోండి"
    },

    // Language options
    languages: {
      en: "English",
      hi: "हिंदी (Hindi)",
      te: "తెలుగు (Telugu)"
    },

    // Financial / Khatabook Terms
    financial: {
      totalYouWillGet: "మొత్తం మీకు రావాల్సినవి",
      totalYouWillGive: "మొత్తం మీరు ఇవ్వాల్సినవి",
      netBalance: "నికర ఖాతా నిల్వ (నెట్ బ్యాలెన్స్)",
      youWillGet: "మీకు రావాల్సినవి",
      youWillGive: "మీరు ఇవ్వాల్సినవి",
      accountSettled: "ఖాతా పూర్తయింది (సెటిల్డ్)",
      settledZero: "సెటిల్డ్ (₹0)",
      settledPageNotice: "పూర్తయిన (సెటిల్డ్) ఖాతాలు చూపిస్తోంది",
      paymentReceived: "చెల్లింపు అందింది",
      balanceDue: "బాకీ మొత్తం",
      saveEntry: "నమోదు చేయండి",
      settleAccount: "ఖాతా పూర్తి (సెటిల్) చేయండి",
      fullSettlement: "పూర్తి బాకీ చెల్లించడమైనది (₹0)",
      quickAddCustomer: "+ కొత్త కస్టమర్ జోడించండి",
      addTransaction: "కొత్త ఎంట్రీ నమోదు చేయండి"
    },

    // Customer & Ledger List
    customer: {
      customerLedgers: "కస్టమర్ల ఖాతా పుస్తకం",
      selectCustomerNotice: "పూర్తి లావాదేవీల వివరాలు చూడటానికి లేదా చెల్లింపులు నమోదు చేయడానికి కస్టమర్‌ను ఎంచుకోండి",
      addNewCustomer: "కొత్త కస్టమర్ జోడించండి",
      searchPlaceholder: "కస్టమర్ పేరు, ఫోన్ నంబర్‌తో వెతకండి...",
      filterAll: "అన్నీ",
      filterGet: "మీకు రావాల్సినవి",
      filterGive: "మీరు ఇవ్వాల్సినవి",
      filterSettled: "సెటిల్డ్ (₹0)",
      sortRecent: "క్రమం: ఇటీవలివి",
      sortBalance: "క్రమం: అత్యధిక బాకీ",
      sortName: "క్రమం: పేరు (A-Z)",
      noCustomersFound: "ఎంచుకున్న ఫిల్టర్‌కు ఏ కస్టమర్లు లభించలేదు.",
      addCustomerNow: "ఇప్పుడే కొత్త కస్టమర్‌ను జోడించండి",
      transactionsCount: "లావాదేవీలు",
      regularCustomer: "సాధారణ కస్టమర్",
      vipClient: "విఐపి కస్టమర్",
      wholesaleBuyer: "హోల్‌సేల్ కొనుగోలుదారు",
      supplier: "సప్లయర్ / వ్యాపారి"
    },

    // Add Customer Modal
    addCustomerModal: {
      title: "కొత్త కస్టమర్ వివరాలు & నగల ఎంపిక",
      subtitle: "కస్టమర్ ఖాతాను సృష్టించి, కాటలాగ్ నుండి నగలను వెంటనే జత చేయండి",
      personalDetails: "కస్టమర్ వ్యక్తిగత వివరాలు",
      nameLabel: "కస్టమర్ పేరు *",
      namePlaceholder: "ఉదా: రాజేష్ శర్మ",
      phoneLabel: "మొబైల్ నంబర్ (వాట్సాప్)",
      phonePlaceholder: "ఉదా: 9876543210",
      addressLabel: "చిరునామా / ప్రాంతం (ఐచ్ఛికం)",
      addressPlaceholder: "కస్టమర్ చిరునామా వివరాలు...",
      selectFromCatalog: "కాటలాగ్ నుండి నగల ఎంపిక",
      available: "లభ్యతలో ఉన్నవి",
      searchCatalogPlaceholder: "పేరు లేదా బరువు ద్వారా నగలను వెతకండి...",
      totalOrderAmount: "మొత్తం ఆర్డర్ ధర",
      amountPaidLabel: "చెల్లించిన/అందిన మొత్తం (₹)",
      openingBalanceDue: "ప్రారంభ బాకీ మొత్తం (కస్టమర్ అప్పు):",
      createButton: "కస్టమర్ ఖాతా సృష్టించండి",
      attachItemsSuffix: "& {{count}} నగలను జత చేయండి",
      nameRequiredError: "కస్టమర్ పేరు తప్పనిసరి."
    },

    // Customer Detail Modal
    customerDetailModal: {
      currentNetBalance: "ప్రస్తుత ఖాతా స్థితి (బ్యాలెన్స్ స్టేటస్)",
      customJewelryBilling: "+ నగల సేల్స్ బిల్లు తయారీ",
      whatsapp: "వాట్సాప్ రిమైండర్",
      pdfStatement: "PDF స్టేట్‌మెంట్ డౌన్‌లోడ్",
      quickAddCatalog: "కాటలాగ్ నుండి వేగంగా నగలు జోడించండి",
      hideCatalogPanel: "కాటలాగ్ ప్యానెల్ దాచు",
      showCatalogPanel: "కాటలాగ్ ప్యానెల్ చూపు",
      filterCatalogPlaceholder: "పేరు, ప్యూరిటీ లేదా బరువుతో వెతకండి...",
      ledgerTimeline: "కస్టమర్ లావాదేవీల చరిత్ర (టైమ్‌లైన్)",
      filterTimelinePlaceholder: "నగలు లేదా బరువు ద్వారా ఎంట్రీలను ఫిల్టర్ చేయండి...",
      noEntriesYet: "ఈ కస్టమర్‌కు ఇంకా ఎలాంటి లావాదేవీలు నమోదు కాలేదు.",
      youGaveButton: "మీరు ఇచ్చినవి ₹",
      youGotButton: "మీకు అందినవి ₹",
      deleteCustomer: "కస్టమర్‌ను తొలగించు"
    },

    // Jewelry Terms & Specifications
    jewelry: {
      gold: "బంగారం",
      silver: "వెండి",
      purity: "స్వచ్ఛత (ప్యూరిటీ)",
      netWeightGrams: "నికర బరువు (గ్రాములు)",
      grossWeightGrams: "మొత్తం బరువు (గ్రాములు)",
      makingCharges: "తరుగు / మజూరీ చార్జీలు (₹)",
      discount: "డిస్కౌంట్ / మినహాయింపు (₹)",
      basePrice: "కాటలాగ్ ప్రాథమిక ధర (₹)",
      totalAmount: "మొత్తం ధర (₹)",
      finalBillAmount: "అంతిమ బిల్లు మొత్తం:",
      itemType: "లావాదేవీ రకం",
      jewelryMetalItem: "నగలు / బంగారం ఆభరణం",
      generalFinancialEntry: "సాధారణ ఆర్థిక లావాదేవీ",
      metalCategory: "లోహ వర్గం",
      goldJewelry: "బంగారు ఆభరణాలు",
      silverArticles: "వెండి వస్తువులు",
      generalMetal: "సాధారణ లోహం / ఇతరత్రా",
      itemArticle: "ఆభరణం రకం",
      ring: "ఉంగరం (రింగ్)",
      chain: "గొలుసు (చైన్)",
      bangle: "గాజులు / బ్రాస్‌లెట్",
      necklace: "హారం (నెక్లెస్ సెట్)",
      coinBar: "బంగారు/వెండి నాణెం లేదా బార్",
      anklet: "వెండి పట్టీలు (పాయల్)",
      utensil: "వెండి పాత్రలు / వస్తువు",
      purity24k: "24K (99.9% మేలిమి)",
      purity22k: "22K (91.6% ప్యూరిటీ)",
      purity18k: "18K (75.0% ప్యూరిటీ)",
      purity999Silver: "999 మేలిమి వెండి",
      purity925Silver: "925 వెండి",
      appliedBenchmarkRate: "వర్తించిన మార్కెట్ ధర (రేటు)",
      perGram: "/ గ్రాము"
    },

    // Transaction Modals (Add / Edit)
    transactionModal: {
      entryFor: "కస్టమర్ ఖాతా:",
      youGaveTitle: "మీరు ఇచ్చినవి (నగలు / అప్పు)",
      youGotTitle: "మీకు అందినవి (చెల్లింపు / జమ)",
      youGaveTab: "మీరు ఇచ్చినవి ₹",
      youGotTab: "మీకు అందినవి ₹",
      settleFullBalance: "మొత్తం బాకీ పూర్తి చెల్లించండి",
      remarkLabel: "వివరాలు / రిమార్క్",
      remarkPlaceholder: "ఉదా: 22K హాల్‌మార్క్ చైన్ (10 గ్రాములు), ఇన్వాయిస్ #204...",
      dateTimeLabel: "తేదీ & సమయం",
      saveGaveButton: "ఇచ్చిన ఎంట్రీ సేవ్ చేయండి",
      saveGotButton: "అందిన చెల్లింపు సేవ్ చేయండి",
      validAmountError: "దయచేసి సరైన మొత్తం నమోదు చేయండి (> 0)"
    },

    // Jewelry Sale Billing Modal
    jewelrySaleModal: {
      title: "+ నగల విక్రయం (సేల్) బిల్లు నమోదు చేయండి",
      subtitle: "కస్టమర్ ప్రత్యక్ష బిల్లింగ్ వ్యవస్థ",
      selectCatalogItem: "కాటలాగ్ నుండి నలను ఎంచుకోండి *",
      searchCatalogPrompt: "కాటలాగ్ నుండి ఆభరణాన్ని వెతకి ఎంచుకోండి...",
      itemSearchPlaceholder: "నగల పేరు టైప్ చేయండి (ఉదా: 22K బంగారు గొలుసు)...",
      itemNameAuto: "నగల పేరు (ఆటో-ఫిల్ అయ్యేది) *",
      paymentStatusTitle: "చెల్లింపు & లావాదేవీ స్థితి *",
      dueCredit: "బాకీ / అప్పు (అన్‌పెయిడ్)",
      paidCashUpi: "నగదు / ఆన్‌లైన్ చెల్లింపు (పెయిడ్)",
      paymentMode: "చెల్లింపు విధానం:",
      cash: "నగదు (Cash)",
      upi: "యుపిఐ (UPI)",
      bankTransfer: "బ్యాంక్ ట్రాన్స్‌ఫర్",
      confirmSaleButton: "నగల విక్రయం ఖాయం (కన్ఫర్మ్) చేయండి"
    },

    // Items Catalog Page
    itemsCatalog: {
      title: "నగల కాటలాగ్ & ఇన్వెంటరీ జాబితా",
      subtitle: "నగల నమూనాలు, స్టాక్ పరిమాణం & ఒకే ధరకు విక్రయించే ప్రాథమిక ధరలు నిర్వహించండి",
      addNewItem: "+ కొత్త నగ జోడించండి",
      searchItemsPlaceholder: "ఆభరణం పేరు, కోడ్, లోహం లేదా ప్యూరిటీ ద్వారా వెతకండి...",
      totalItems: "మొత్తం నగల రకాలు",
      totalStock: "మొత్తం స్టాక్ పరిమాణం",
      filterAllCategory: "అన్ని వర్గాలు",
      filterGold: "బంగారు ఆభరణాలు",
      filterSilver: "వెండి వస్తువులు",
      code: "కోడ్:",
      stock: "స్టాక్:",
      pcs: "నగాలు",
      editItem: "సవరించు",
      deleteItem: "తొలగించు",
      noItemsFound: "ఏవీ నగల కాటలాగ్ లో లభించలేదు."
    },

    // Add Item Modal
    addItemModal: {
      addTitle: "కాటలాగ్‌లో కొత్త నగను జోడించండి",
      editTitle: "కాటలాగ్ నగను సవరించండి",
      itemNameLabel: "నగ పేరు *",
      itemNamePlaceholder: "ఉదా: 22K డిజైనర్ బంగారు గొలుసు",
      itemCodeLabel: "ఐటమ్ కోడ్ / SKU (ఐచ్ఛికం)",
      itemCodePlaceholder: "ఉదా: GC-204",
      fixedUnitPriceLabel: "యూనిట్ నిర్ణీత విక్రయ ధర (₹) *",
      fixedPricePlaceholder: "ఉదా: 45000",
      stockQuantityLabel: "స్టాక్ పరిమాణం (నగాలు)",
      saveItemButton: "కాటలాగ్‌లో సేవ్ చేయండి",
      updateItemButton: "అప్‌డేట్ చేయండి"
    },

    // Live Bullion Rates Page
    liveRatesPage: {
      title: "భారతీయ నగరాల లైవ్ బంగారం/వెండి ధరలు",
      subtitle: "IBJA అధికారిక బెంచ్‌మార్క్ ప్రకారం నగరాల వారీగా లైవ్ రిటైల్ బంగారం మరియు వెండి ధరలు",
      selectCityLabel: "భారతీయ నగరాన్ని ఎంచుకోండి:",
      gold24kTitle: "24K మేలిమి బంగారం (99.9%)",
      gold22kTitle: "22K ప్రామాణిక బంగారం (91.6%)",
      gold18kTitle: "18K ఆభరణాల బంగారం (75.0%)",
      silver999Title: "999 మేలిమి వెండి",
      silver925Title: "925 స్టెర్లింగ్ వెండి",
      perGram: "1 గ్రాము",
      per8Grams: "8 గ్రాములు (సవరిన్)",
      per10Grams: "10 గ్రాములు",
      perTola: "1 తులం (11.66గ్రా)",
      per100Grams: "100 గ్రాములు",
      perKg: "1 కిలోగ్రామ్ (1000గ్రా)",
      liveBadge: "లైవ్ అప్‌డేట్",
      cityBenchmark: "నగర బెంచ్‌మార్క్ ధర"
    },

    // Common Actions & Notifications
    common: {
      save: "సేవ్",
      cancel: "రద్దు",
      delete: "తొలగించు",
      close: "మూసివేయి",
      confirm: "ఖాయం చేయండి",
      search: "వెతుకు",
      filter: "ఫిల్టర్",
      success: "సఫలం",
      error: "పొరపాటు",
      yes: "అవును",
      no: "కాదు",
      qty: "పరిమాణం",
      add: "జోడించు",
      added: "జోడించబడింది",
      gotIt: "అర్థమైంది"
    }
  }
};
