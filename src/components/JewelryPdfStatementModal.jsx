import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Gem, 
  IndianRupee, 
  Calendar, 
  Phone, 
  MapPin, 
  Languages, 
  Loader2,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportElementToPdf, ensureFontsLoaded } from '../utils/jewelryPdfEngine';

// Multilingual labels for Jewelry Statements (English, Telugu, Hindi)
const STATEMENT_LABELS = {
  multi: {
    title: 'JEWELRY CUSTOMER STATEMENT',
    subTitle: 'ఖాతా స్టేట్‌మెంట్ • ग्राहक खाता विवरणी',
    statementDate: 'Statement Date / తేదీ / दिनांक',
    customerDetails: 'Customer Profile / కస్టమర్ వివరాలు / ग्राहक विवरण',
    phone: 'Phone / ఫోన్ / दूरभाष',
    address: 'Address / చిరునామా / पता',
    ledgerStatus: 'Ledger Status / ఖాతా స్థితి / खाता स्थिति',
    statusDue: 'BALANCE DUE / బాకీ ఉంది / शेष देय',
    statusSettled: 'FULLY SETTLED / క్లియర్ అయింది / पूर्ण चुकता',
    statusCredit: 'ADVANCE CREDIT / అడ్వాన్స్ / अग्रिम',
    // Summary Cards
    totalBilled: 'Total Bill / మొత్తం బిల్లు / कुल बिल',
    totalPaid: 'Total Paid / స్వీకరించినది / प्राप्त राशि',
    remainingDue: 'Net Balance Due / మిగిలిన బాకీ / शेष अंतर',
    // Table Headers
    slNo: 'S.No',
    date: 'Date & Time / తేదీ / दिनांक',
    itemDetails: 'Item & Purity / ఆభరణం & స్వచ్ఛత / आभूषण व शुद्धता',
    weights: 'Weights (Gross / Net) / బరువు / भार',
    rateMaking: 'Rate & Making / ధర & తరుగు / दर व मजूरी',
    itemTotal: 'Item Value / విలువ / कुल मूल्य',
    paidAmount: 'Received / స్వీకరించినది / प्राप्त',
    balanceDue: 'Balance / బాకీ / अंतर',
    // Weights & Metrics
    gross: 'Gross',
    net: 'Net',
    stone: 'Stone/Dust',
    rate: 'Rate/g',
    making: 'Mkg',
    wastage: 'Wastage',
    totals: 'LEDGER TOTALS / మొత్తం లెక్కలు / कुल योग',
    goldSummary: 'Total Net Wt',
    authSign: 'Authorized Store Seal / సంతకం / अधिकृत हस्ताक्षर',
    custSign: 'Customer Signature / కస్టమర్ సంతకం / ग्राहक हस्ताक्षर',
    noteText: 'Computer-generated certified jewelry statement. All gold ornaments are BIS Hallmarked unless specified.',
    telNote: 'కంప్యూటర్ రూపొందించిన ఆభరణాల స్టేట్‌మెంట్. అన్ని బంగారు ఆభరణాలు BIS హాల్‌మార్క్ చేయబడినవి.'
  },
  te: {
    title: 'ఆభరణాల వ్యాపార ఖాతా స్టేట్‌మెంట్',
    subTitle: 'JEWELRY CUSTOMER STATEMENT',
    statementDate: 'తేదీ',
    customerDetails: 'కస్టమర్ వివరాలు',
    phone: 'ఫోన్ నంబర్',
    address: 'చిరునామా',
    ledgerStatus: 'ఖాతా స్థితి',
    statusDue: 'బాకీ ఉంది (చెల్లించవలసినది)',
    statusSettled: 'పూర్తిగా క్లియర్ అయింది (₹ 0)',
    statusCredit: 'అడ్వాన్స్ క్రెడిట్',
    totalBilled: 'మొత్తం బిల్లు (బంగారం విలువ)',
    totalPaid: 'చెల్లించిన మొత్తం (స్వీకరించినది)',
    remainingDue: 'నికర మిగిలిన బాకీ (చెల్లించవలసినది)',
    slNo: 'క్ర.సం',
    date: 'తేదీ & సమయం',
    itemDetails: 'ఆభరణం పేరు & క్యారెట్/స్వచ్ఛత',
    weights: 'బరువు (గ్రాస్ / నెట్)',
    rateMaking: 'గ్రాము ధర & తరుగు/మజూరీ',
    itemTotal: 'మొత్తం విలువ (₹)',
    paidAmount: 'చెల్లించినది (₹)',
    balanceDue: 'మిగిలిన బాకీ (₹)',
    gross: 'గ్రాస్',
    net: 'నెట్',
    stone: 'రాళ్ళు',
    rate: 'ధర/గ్రా',
    making: 'మజూరీ',
    wastage: 'తరుగు',
    totals: 'మొత్తం లెక్కల సారాంశం',
    goldSummary: 'మొత్తం నెట్ బరువు',
    authSign: 'షాపు అధీకృత సంతకం & సీలు',
    custSign: 'కస్టమర్ సంతకం',
    noteText: 'అన్ని బంగారు ఆభరణాలు BIS 916 హాల్‌మార్క్ ప్రమాణాలతో అందించబడతాయి. ధన్యవాదాలు.',
    telNote: ''
  },
  hi: {
    title: 'आभूषण ग्राहक खाता विवरणी',
    subTitle: 'JEWELRY CUSTOMER STATEMENT',
    statementDate: 'विवरणी दिनांक',
    customerDetails: 'ग्राहक का विवरण',
    phone: 'दूरभाष (मोबाइल)',
    address: 'पता / स्थान',
    ledgerStatus: 'खाता स्थिति',
    statusDue: 'बकाया देय राशि',
    statusSettled: 'पूर्ण चुकता (खाता साफ)',
    statusCredit: 'अग्रिम जमा (क्रेडिट)',
    totalBilled: 'कुल बिल राशि (आभूषण मूल्य)',
    totalPaid: 'कुल प्राप्त राशि (जमा)',
    remainingDue: 'अंतिम शेष बकाया (देय अंतर)',
    slNo: 'क्र.',
    date: 'दिनांक व समय',
    itemDetails: 'आभूषण एवं शुद्धता विवरण',
    weights: 'भार (सकल / शुद्ध)',
    rateMaking: 'दर प्रति ग्राम व मजूरी/घट',
    itemTotal: 'आभूषण मूल्य (₹)',
    paidAmount: 'प्राप्त राशि (₹)',
    balanceDue: 'शेष बकाया (₹)',
    gross: 'सकल',
    net: 'शुद्ध',
    stone: 'नग/कटौती',
    rate: 'दर/ग्रा',
    making: 'मजूरी',
    wastage: 'घट/तवा',
    totals: 'कुल खाता सारांश योग',
    goldSummary: 'कुल शुद्ध भार',
    authSign: 'दुकानदार अधिकृत हस्ताक्षर व मुहर',
    custSign: 'ग्राहक के हस्ताक्षर',
    noteText: 'सभी सोने के आभूषण BIS 916 हॉलमार्क प्रमाणित हैं। हमारे साथ व्यापार के लिए धन्यवाद।',
    telNote: ''
  },
  en: {
    title: 'JEWELRY CUSTOMER LEDGER STATEMENT',
    subTitle: 'Official Transaction Summary & Gold/Silver Ledger',
    statementDate: 'Statement Date',
    customerDetails: 'Customer Details',
    phone: 'Phone Number',
    address: 'Address / Location',
    ledgerStatus: 'Ledger Status',
    statusDue: 'PAYMENT DUE',
    statusSettled: 'ACCOUNT SETTLED (₹ 0)',
    statusCredit: 'ADVANCE CREDIT',
    totalBilled: 'Total Bill Amount',
    totalPaid: 'Total Payments Received',
    remainingDue: 'Outstanding Balance Due',
    slNo: '#',
    date: 'Date & Time',
    itemDetails: 'Item & Metal Purity',
    weights: 'Weight (Gross / Net)',
    rateMaking: 'Rate / g & Charges',
    itemTotal: 'Total Value (₹)',
    paidAmount: 'Amount Paid (₹)',
    balanceDue: 'Balance Due (₹)',
    gross: 'Gross',
    net: 'Net',
    stone: 'Stone',
    rate: 'Rate/g',
    making: 'Mkg',
    wastage: 'Wastage',
    totals: 'STATEMENT TOTALS',
    goldSummary: 'Total Net Weight',
    authSign: 'Authorized Store Sign & Seal',
    custSign: 'Customer Signature',
    noteText: 'Certified computer-generated jewelry ledger. All gold items are BIS 916/750 Hallmarked.',
    telNote: ''
  }
};

/**
 * Modern, Executive Jewelry Ledger Statement Component
 */
export function JewelryPdfStatementModal({
  isOpen,
  onClose,
  customer,
  transactions = [],
  businessName = 'JewelLedger & Bullion Store'
}) {
  const [lang, setLang] = useState('multi'); // 'multi' | 'te' | 'hi' | 'en'
  const [isExporting, setIsExporting] = useState(false);
  const [exportStep, setExportStep] = useState('');
  
  const printContainerRef = useRef(null);
  const viewportRef = useRef(null);

  const [containerWidth, setContainerWidth] = useState(800);
  const [zoomMode, setZoomMode] = useState('fit'); // 'fit' | 'custom'
  const [customScale, setCustomScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(1123);

  // Filter transactions belonging to this customer
  const custTransactions = useMemo(() => {
    if (!customer?.id) return [];
    return transactions.filter(t => t.customerId === customer.id);
  }, [transactions, customer?.id]);

  // Compute detailed financial and weight summaries
  const ledgerMetrics = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let totalGrossWeight = 0;
    let totalNetWeight = 0;

    custTransactions.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'GAVE') {
        totalBilled += amt;
      } else {
        totalPaid += amt;
      }

      if (tx.grossWeightGrams) totalGrossWeight += Number(tx.grossWeightGrams);
      else if (tx.netWeightGrams) totalGrossWeight += Number(tx.netWeightGrams);

      if (tx.netWeightGrams) totalNetWeight += Number(tx.netWeightGrams);
    });

    const balanceDue = totalBilled - totalPaid;

    return {
      totalBilled,
      totalPaid,
      balanceDue,
      totalGrossWeight: Math.round(totalGrossWeight * 1000) / 1000,
      totalNetWeight: Math.round(totalNetWeight * 1000) / 1000
    };
  }, [custTransactions]);

  const labels = STATEMENT_LABELS[lang] || STATEMENT_LABELS.multi;

  // Measure available preview width to calculate auto-fit scale
  useEffect(() => {
    if (!isOpen) return;

    const updateDimensions = () => {
      if (viewportRef.current) {
        const width = viewportRef.current.clientWidth;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
      if (printContainerRef.current) {
        const height = printContainerRef.current.scrollHeight;
        if (height > 0) {
          setContentHeight(height);
        }
      }
    };

    updateDimensions();
    const timer = setTimeout(updateDimensions, 100);

    let resizeObserver;
    if (window.ResizeObserver && viewportRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(viewportRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [isOpen, lang, custTransactions.length]);

  // Calculate proportional fit-to-screen scale (800px standard A4 sheet)
  const fitScale = useMemo(() => {
    const padding = containerWidth < 640 ? 16 : 48;
    const availableWidth = Math.max(240, containerWidth - padding);
    const computed = availableWidth / 800;
    return Math.min(1.0, Math.max(0.32, Math.round(computed * 100) / 100));
  }, [containerWidth]);

  const activeScale = zoomMode === 'fit' ? fitScale : customScale;

  const handleZoomIn = () => {
    setZoomMode('custom');
    setCustomScale(prev => Math.min(1.5, Math.round((activeScale + 0.15) * 100) / 100));
  };

  const handleZoomOut = () => {
    setZoomMode('custom');
    setCustomScale(prev => Math.max(0.32, Math.round((activeScale - 0.15) * 100) / 100));
  };

  const handleToggleFit = () => {
    if (zoomMode === 'fit') {
      setZoomMode('custom');
      setCustomScale(1.0);
    } else {
      setZoomMode('fit');
    }
  };

  // Trigger High-Resolution PDF Download
  const handleDownloadPdf = async () => {
    if (!printContainerRef.current) return;
    setIsExporting(true);
    setExportStep('PREPARING_FONTS');

    try {
      const cleanCustName = (customer?.name || 'Customer').replace(/[^a-zA-Z0-9_\u0C00-\u0C7F\u0900-\u097F]/g, '_');
      const filename = `${cleanCustName}_Jewelry_Statement.pdf`;

      await exportElementToPdf(printContainerRef.current, filename, (step) => {
        setExportStep(step);
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Could not export PDF statement: ' + (err.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
      setExportStep('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="pdf-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="pdf-modal-card bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl max-w-5xl w-full h-full sm:h-auto sm:max-h-[96vh] flex flex-col shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Top Control Bar (Non-printed modal controls) */}
        <div className="no-print p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex-shrink-0 space-y-2.5">
          {/* Header Row: Title & Close Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-lg font-black tracking-tight text-white truncate">
                    Jewelry Statement Export
                  </h3>
                  <span className="text-[9px] sm:text-[10px] uppercase font-extrabold px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-500/50 flex-shrink-0">
                    A4 Indic HD
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block truncate">
                  A4 Vector-Canvas capture for Telugu (తెలుగు), Hindi (हिन्दी) & Rupee (₹) symbols
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isExporting}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Row: Languages & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            {/* Language Switcher */}
            <div className="flex items-center rounded-xl bg-slate-800/90 p-0.5 sm:p-1 border border-slate-700/80 text-[11px] sm:text-xs overflow-x-auto max-w-full">
              <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1.5 mr-1 text-slate-400 flex-shrink-0" />
              <button
                onClick={() => setLang('multi')}
                className={`px-2 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                  lang === 'multi' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Multi (తె/हि/En)
              </button>
              <button
                onClick={() => setLang('te')}
                className={`px-2 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                  lang === 'te' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                  lang === 'hi' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                  lang === 'en' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Zoom Controls & Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
              {/* Zoom Controls */}
              <div className="flex items-center rounded-xl bg-slate-800/90 p-0.5 sm:p-1 border border-slate-700/80 text-xs">
                <button
                  onClick={handleZoomOut}
                  disabled={isExporting || activeScale <= 0.35}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleToggleFit}
                  className="px-2 py-0.5 text-[11px] font-bold text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors whitespace-nowrap"
                  title={zoomMode === 'fit' ? 'Switch to 100% Size' : 'Switch to Fit to Screen'}
                >
                  {zoomMode === 'fit' ? `Fit (${Math.round(fitScale * 100)}%)` : `${Math.round(activeScale * 100)}%`}
                </button>
                <button
                  onClick={handleZoomIn}
                  disabled={isExporting || activeScale >= 1.5}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Native Print Button */}
              <button
                onClick={handlePrint}
                disabled={isExporting}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                title="Native Print"
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>

              {/* Download PDF Button */}
              <button
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="text-[11px] sm:text-xs">
                      {exportStep === 'PREPARING_FONTS' && 'Fonts...'}
                      {exportStep === 'RENDERING_CANVAS' && 'Rendering...'}
                      {exportStep === 'COMPILING_PDF' && 'Compiling...'}
                      {exportStep === 'SAVING' && 'Saving...'}
                      {!exportStep && 'Exporting...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div 
          ref={viewportRef}
          className="flex-1 overflow-auto p-2 sm:p-6 bg-slate-100 dark:bg-slate-950 flex flex-col items-center"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Scaled stage reserving exact layout space */}
          <div 
            className="pdf-preview-stage transition-transform duration-100"
            style={{
              width: `${Math.round(800 * activeScale)}px`,
              minHeight: `${Math.round(contentHeight * activeScale)}px`,
              margin: '0 auto',
              flexShrink: 0
            }}
          >
            <div
              style={{
                width: '800px',
                transform: `scale(${activeScale})`,
                transformOrigin: 'top left',
              }}
            >
              {/* Printable Document Container (A4 Layout Proportion: 800px fixed width) */}
              <div 
                ref={printContainerRef}
                data-pdf-content="true"
                className="w-[800px] min-h-[1123px] bg-white text-slate-900 p-8 shadow-xl border border-slate-200 flex flex-col justify-between"
                style={{
                  fontFamily: "'Inter', 'Noto Sans Telugu', 'Noto Sans Devanagari', system-ui, -apple-system, sans-serif",
                  WebkitFontSmoothing: 'antialiased',
                  colorScheme: 'light',
                  color: '#0f172a'
                }}
              >
            <div>
              {/* HEADER: Jewelry Store Brand & Statement Title */}
              <div className="border-b-2 border-amber-600 pb-5 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-sm">
                        💍
                      </div>
                      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
                        {businessName}
                      </h1>
                    </div>
                    <p className="text-xs font-semibold text-amber-800 mt-1">
                      Hallmark Gold, Certified Diamond & Silver Ornaments
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Phone: +91 98765 43210 • Regd. Hallmark Center #916-IND
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="inline-block px-3 py-1 rounded bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs tracking-wide uppercase">
                      {labels.title}
                    </div>
                    {labels.subTitle && (
                      <p className="text-[11px] font-bold text-slate-600 mt-1">
                        {labels.subTitle}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      <span className="font-semibold">{labels.statementDate}:</span> {formatDate(new Date())}
                    </p>
                  </div>
                </div>
              </div>

              {/* CUSTOMER PROFILE & LEDGER STATUS INFOBOX */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                {/* Column 1: Customer Details */}
                <div className="col-span-2 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {labels.customerDetails}
                  </span>
                  <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                    <span>{customer.name}</span>
                    {customer.tag && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {customer.tag}
                      </span>
                    )}
                  </h2>
                  <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                    {customer.phone && (
                      <p className="flex items-center space-x-1.5">
                        <span className="font-semibold text-slate-500">{labels.phone}:</span>
                        <span className="font-bold text-slate-800">+91 {customer.phone}</span>
                      </p>
                    )}
                    {customer.address && (
                      <p className="flex items-center space-x-1.5">
                        <span className="font-semibold text-slate-500">{labels.address}:</span>
                        <span>{customer.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Column 2: Ledger Status Badge */}
                <div className="text-right flex flex-col justify-center items-end border-l border-slate-200 pl-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {labels.ledgerStatus}
                  </span>
                  <div className="mt-1">
                    {ledgerMetrics.balanceDue > 0 ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                        {labels.statusDue}
                      </span>
                    ) : ledgerMetrics.balanceDue < 0 ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-300">
                        {labels.statusCredit}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {labels.statusSettled}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Entries: <span className="font-bold text-slate-800">{custTransactions.length}</span> records
                  </p>
                </div>
              </div>

              {/* THREE CORE SUMMARY CARDS: TOTAL BILL | TOTAL PAID | REMAINING DUE */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* 1. Total Bill */}
                <div className="p-4 rounded-xl bg-amber-50/70 border-2 border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase text-amber-900">
                      {labels.totalBilled}
                    </span>
                    <Gem className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xl font-black text-amber-950 mt-1.5">
                    {formatCurrency(ledgerMetrics.totalBilled)}
                  </div>
                  <div className="text-[10px] font-bold text-amber-800 mt-1">
                    Net Weight: {ledgerMetrics.totalNetWeight}g
                  </div>
                </div>

                {/* 2. Total Paid */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border-2 border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase text-emerald-900">
                      {labels.totalPaid}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-black text-emerald-950 mt-1.5">
                    {formatCurrency(ledgerMetrics.totalPaid)}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-800 mt-1">
                    Cash / UPI / Bank / Metal
                  </div>
                </div>

                {/* 3. Remaining Due / Balance Difference */}
                <div className={`p-4 rounded-xl border-2 ${
                  ledgerMetrics.balanceDue > 0
                    ? 'bg-rose-50 border-rose-300'
                    : ledgerMetrics.balanceDue < 0
                    ? 'bg-indigo-50 border-indigo-300'
                    : 'bg-slate-50 border-slate-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-extrabold uppercase ${
                      ledgerMetrics.balanceDue > 0 ? 'text-rose-900' : 'text-slate-800'
                    }`}>
                      {labels.remainingDue}
                    </span>
                    <IndianRupee className={`w-4 h-4 ${
                      ledgerMetrics.balanceDue > 0 ? 'text-rose-600' : 'text-slate-600'
                    }`} />
                  </div>
                  <div className={`text-xl font-black mt-1.5 ${
                    ledgerMetrics.balanceDue > 0 
                      ? 'text-rose-700' 
                      : ledgerMetrics.balanceDue < 0 
                      ? 'text-indigo-700' 
                      : 'text-slate-700'
                  }`}>
                    {formatCurrency(Math.abs(ledgerMetrics.balanceDue))}
                    {ledgerMetrics.balanceDue < 0 && ' (Cr)'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 mt-1">
                    {ledgerMetrics.balanceDue > 0 ? 'Pending to Collect' : ledgerMetrics.balanceDue === 0 ? 'Settled Clean' : 'Advance Credit'}
                  </div>
                </div>
              </div>

              {/* DETAILED LINE-ITEM & PRICE DIFFERENCE TABLE */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-extrabold w-10 text-center">{labels.slNo}</th>
                      <th className="py-2.5 px-3 font-extrabold w-28">{labels.date}</th>
                      <th className="py-2.5 px-3 font-extrabold">{labels.itemDetails}</th>
                      <th className="py-2.5 px-3 font-extrabold text-right w-28">{labels.weights}</th>
                      <th className="py-2.5 px-3 font-extrabold text-right w-24">{labels.rateMaking}</th>
                      <th className="py-2.5 px-3 font-extrabold text-right w-24">{labels.itemTotal}</th>
                      <th className="py-2.5 px-3 font-extrabold text-right w-24">{labels.paidAmount}</th>
                      <th className="py-2.5 px-3 font-extrabold text-right w-24">{labels.balanceDue}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {custTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                          No transaction records found for this customer.
                        </td>
                      </tr>
                    ) : (
                      custTransactions.map((tx, idx) => {
                        const isSale = tx.type === 'GAVE';
                        const grossWt = tx.grossWeightGrams || (tx.netWeightGrams ? tx.netWeightGrams : null);
                        const netWt = tx.netWeightGrams || null;
                        const stoneWt = (grossWt && netWt && grossWt > netWt) 
                          ? Math.round((grossWt - netWt) * 1000) / 1000 
                          : null;
                        
                        // Item value vs paid vs balance difference for this entry
                        const itemVal = isSale ? tx.amount : 0;
                        const paidVal = !isSale ? tx.amount : (tx.paidAmount || 0);
                        const diffVal = isSale ? (tx.dueAmount !== undefined ? tx.dueAmount : Math.max(0, itemVal - paidVal)) : 0;

                        return (
                          <tr 
                            key={tx.id || idx}
                            className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}
                          >
                            {/* Sl No */}
                            <td className="py-2.5 px-3 text-center text-slate-400 font-bold">
                              {idx + 1}
                            </td>

                            {/* Date */}
                            <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                              <span className="font-semibold block">{formatDate(tx.date).split(',')[0]}</span>
                              <span className="text-[10px] text-slate-400">{formatDate(tx.date).split(',')[1] || ''}</span>
                            </td>

                            {/* Item & Purity */}
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                                <span>{tx.jewelryCategory || tx.note || tx.category || (isSale ? 'Jewelry Sale' : 'Payment Received')}</span>
                                {tx.purity && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-extrabold border border-amber-200">
                                    {tx.purity}
                                  </span>
                                )}
                              </div>
                              {tx.note && tx.note !== tx.jewelryCategory && (
                                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                  {tx.note}
                                </p>
                              )}
                            </td>

                            {/* Weights: Gross vs Net vs Stone */}
                            <td className="py-2.5 px-3 text-right">
                              {netWt ? (
                                <div>
                                  <span className="font-bold text-slate-900 block">
                                    {netWt}g <span className="text-[10px] font-normal text-slate-500">({labels.net})</span>
                                  </span>
                                  {grossWt && (
                                    <span className="text-[10px] text-slate-500 block">
                                      {grossWt}g ({labels.gross})
                                      {stoneWt ? ` - ${stoneWt}g` : ''}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>

                            {/* Rate / Making Charges */}
                            <td className="py-2.5 px-3 text-right">
                              {tx.appliedRate || tx.makingCharges ? (
                                <div>
                                  {tx.appliedRate && (
                                    <span className="font-semibold text-slate-800 block text-[11px]">
                                      ₹{tx.appliedRate}/g
                                    </span>
                                  )}
                                  {tx.makingCharges ? (
                                    <span className="text-[10px] text-slate-500 block">
                                      +{formatCurrency(tx.makingCharges)}
                                    </span>
                                  ) : null}
                                </div>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>

                            {/* Total Item Value */}
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              {isSale ? (
                                <span className="text-amber-950 font-black">
                                  {formatCurrency(tx.amount)}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>

                            {/* Amount Paid / Received */}
                            <td className="py-2.5 px-3 text-right font-bold">
                              {!isSale ? (
                                <span className="text-emerald-700 font-black">
                                  {formatCurrency(tx.amount)}
                                </span>
                              ) : paidVal > 0 ? (
                                <span className="text-emerald-600 font-bold">
                                  {formatCurrency(paidVal)}
                                </span>
                              ) : (
                                <span className="text-slate-300">₹0</span>
                              )}
                            </td>

                            {/* Balance Difference */}
                            <td className="py-2.5 px-3 text-right">
                              {isSale && diffVal > 0 ? (
                                <span className="text-rose-600 font-black">
                                  {formatCurrency(diffVal)}
                                </span>
                              ) : isSale && diffVal === 0 ? (
                                <span className="text-emerald-600 font-bold text-[11px]">
                                  Settled
                                </span>
                              ) : !isSale ? (
                                <span className="text-emerald-600 font-bold text-[11px]">
                                  Credit
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                  {/* Summary Totals Footer Row */}
                  <tfoot>
                    <tr className="bg-amber-50/80 border-t-2 border-amber-300 font-extrabold text-slate-900">
                      <td colSpan={3} className="py-3 px-3 uppercase tracking-wide text-amber-900">
                        {labels.totals} ({custTransactions.length} Items)
                      </td>
                      <td className="py-3 px-3 text-right text-amber-950">
                        <div>{ledgerMetrics.totalNetWeight}g</div>
                        <div className="text-[10px] text-amber-800 font-medium">Net Weight</div>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400">-</td>
                      <td className="py-3 px-3 text-right text-amber-950 text-sm font-black">
                        {formatCurrency(ledgerMetrics.totalBilled)}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-700 text-sm font-black">
                        {formatCurrency(ledgerMetrics.totalPaid)}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-700 text-sm font-black">
                        {formatCurrency(ledgerMetrics.balanceDue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* FOOTER: TERMS, CERTIFICATION, & SIGNATURE SEALS */}
            <div className="border-t border-slate-200 pt-6 mt-6">
              <div className="flex items-end justify-between">
                {/* Terms and Hallmarking statement */}
                <div className="max-w-md space-y-1">
                  <p className="text-[10px] font-semibold text-slate-500">
                    {labels.noteText}
                  </p>
                  {labels.telNote && (
                    <p className="text-[10px] font-medium text-amber-900">
                      {labels.telNote}
                    </p>
                  )}
                  <p className="text-[9px] text-slate-400 pt-1">
                    Generated via JewelLedger • Official Certified Client Copy
                  </p>
                </div>

                {/* Signatures */}
                <div className="flex items-center space-x-10 text-center">
                  <div className="space-y-1">
                    <div className="w-36 border-b border-slate-400 h-10 mb-1"></div>
                    <span className="text-[10px] font-bold text-slate-600 block">
                      {labels.custSign}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-36 border-b border-amber-600 h-10 mb-1 flex items-end justify-center">
                      <span className="text-[9px] font-extrabold text-amber-800 tracking-wider">
                        [STORE SEAL]
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 block">
                      {labels.authSign}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
