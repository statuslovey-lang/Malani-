import { useState } from 'react';
import { 
  Coins, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  History, 
  TrendingDown,
  Award,
  BookOpen,
  ArrowRightCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { LedgerItem, SansthaProfile } from '../types';

interface DuesDashboardProps {
  ledger: LedgerItem[];
  profile: SansthaProfile;
}

export default function DuesDashboard({ ledger, profile }: DuesDashboardProps) {
  const [downloading, setDownloading] = useState(false);
  const [filterYear, setFilterYear] = useState<string>('all');

  // Math Calculations for Ledger
  const totalItems = ledger.length;
  const paidItems = ledger.filter(item => item.isPaid);
  const unpaidItems = ledger.filter(item => !item.isPaid);

  const totalDuesAmount = ledger.reduce((sum, item) => sum + item.duesAmount, 0);
  const totalPaidAmount = paidItems.reduce((sum, item) => sum + item.duesAmount, 0);
  const totalUnpaidAmount = unpaidItems.reduce((sum, item) => sum + item.duesAmount, 0);

  // Contribution Ratio
  const clearanceRate = totalItems > 0 ? Math.round((paidItems.length / totalItems) * 10) * 10 : 100;
  const clearancePercent = totalItems > 0 ? Math.round((paidItems.length / totalItems) * 100) : 100;

  // Breakdown by event types
  const eventBreakdown = ledger.reduce((acc, item) => {
    if (!acc[item.eventType]) {
      acc[item.eventType] = { count: 0, total: 0, paid: 0, paidCount: 0 };
    }
    acc[item.eventType].count += 1;
    acc[item.eventType].total += item.duesAmount;
    if (item.isPaid) {
      acc[item.eventType].paid += item.duesAmount;
      acc[item.eventType].paidCount += 1;
    }
    return acc;
  }, {} as Record<string, { count: number; total: number; paid: number; paidCount: number; }>);

  // Event category labels in Hindi
  const eventLabels: Record<string, { label: string; color: string; bg: string }> = {
    'Vivah': { label: 'विवाह पूल (Vivah Dues)', color: 'text-amber-800 dark:text-amber-400', bg: 'bg-amber-500' },
    'Momera': { label: 'मोमेरा पूल (Momera Dues)', color: 'text-purple-800 dark:text-purple-400', bg: 'bg-purple-500' },
    'Death': { label: 'निधन पूल (Death Dues)', color: 'text-rose-800 dark:text-rose-450', bg: 'bg-rose-500' },
    'Ad-hoc': { label: 'तदर्थ/अन्य (Ad-hoc Dues)', color: 'text-blue-800 dark:text-blue-400', bg: 'bg-blue-500' }
  };

  // Safe checks for ledger list
  const itemTypes = ['Vivah', 'Momera', 'Death', 'Ad-hoc'];

  // Handle immediate browser-level print optimization
  const handlePrint = () => {
    setDownloading(true);
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 300);
  };

  // Convert Ledger Book to Raw CSV
  const handleExportCSV = () => {
    try {
      const headers = ['Ledger ID', 'Event Type', 'Description', 'Due Date', 'Dues Amount (INR)', 'Status', 'Payment Date'];
      const rows = ledger.map(item => [
        item.id,
        item.eventType,
        item.description.replace(/,/g, ' '),
        item.dueDate,
        item.duesAmount,
        item.isPaid ? 'PAID' : 'UNPAID',
        item.paymentDate || 'N/A'
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `MSS_LedgerBook_${profile.membershipId || 'Member'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Dynamic Printing Style Injector - Hides UI rails, renders clean sheet layout only when printing */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 11pt !important;
          }
          /* Hide non-printable app navigation wrappers completely */
          header, footer, nav, .tab-buttons, button, select, .no-print {
            display: none !important;
          }
          .print-container {
            border: 2px solid #854d0e !important;
            padding: 2.5cm !important;
            margin: 0 !important;
            width: 100% !important;
            background: white !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .print-header {
            text-align: center !important;
            border-bottom: 2px double #854d0e !important;
            margin-bottom: 20px !important;
            padding-bottom: 12px !important;
          }
          .print-section {
            page-break-inside: avoid !important;
            margin-bottom: 30px !important;
          }
          .custom-shadow-print {
            box-shadow: none !important;
            border: 1px solid #e5e5e5 !important;
            background: transparent !important;
          }
        }
      `}</style>

      {/* Main Header Card */}
      <div className="bg-stone-50/55 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-850 p-6 rounded-3xl relative overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 pb-1.5 pt-1.5 rounded-full bg-amber-500/10 text-amber-900 dark:text-amber-400 font-sans font-black text-[10px] tracking-widest uppercase">
            <Coins className="w-3.5 h-3.5" /> वार्षिक वित्तीय विश्लेषण • STACK ANALYSIS
          </div>
          <h2 className="text-3xl font-serif font-black text-stone-900 dark:text-stone-50">
            व्यक्तिगत अंशदान रिपोर्ट व वित्तीय विवरणी
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
            मालणी सेवा संस्थान के अंतर्गत बही देयता, ऐतिहासिक अंशदान प्रतिशत एवं सहायता पात्रता ऑडिट रिपोर्ट
          </p>
        </div>

        {/* Quick Action Export Buttons */}
        <div className="flex flex-flow gap-2 shrink-0 relative z-10">
          <button
            type="button"
            id="print-pdf-report-btn"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-2xl text-xs font-black tracking-wide cursor-pointer transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            PDF / रिपोर्ट प्रिंट करें
          </button>
          <button
            type="button"
            id="export-ledger-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-stone-800 dark:hover:bg-stone-750 dark:text-stone-200 rounded-2xl text-xs font-black cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            बही एक्सेल (CSV)
          </button>
        </div>
      </div>

      {/* Grid Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 no-print">
        {/* Left Side: Summary Metrics Cards */}
        <div className="lg:col-span-8 space-y-4">
          {/* Bento metrics counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 p-4 rounded-2xl relative">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">कुल देय अंशदान</span>
              <span className="text-2xl font-serif font-black text-stone-900 dark:text-stone-50 block mt-1">₹{totalDuesAmount}</span>
              <span className="text-[10px] font-sans font-semibold text-stone-500 mt-1 block border-t border-stone-100 dark:border-stone-850/60 pt-1">
                कुल प्रविष्टियां: {totalItems}
              </span>
            </div>

            <div className="bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/15 p-4 rounded-2xl relative">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                चुकता राशि (Paid)
              </span>
              <span className="text-2xl font-serif font-black text-emerald-700 dark:text-emerald-400 block mt-1">₹{totalPaidAmount}</span>
              <span className="text-[10px] font-sans font-semibold text-emerald-600 dark:text-emerald-500/80 mt-1 block border-t border-emerald-500/10 pt-1">
                सफल भुगतान: {paidItems.length}
              </span>
            </div>

            <div className="bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/15 p-4 rounded-2xl relative">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">बकाया योग (Pending)</span>
              <span className="text-2xl font-serif font-black text-rose-700 dark:text-rose-405 block mt-1">₹{totalUnpaidAmount}</span>
              <span className="text-[10px] font-sans font-semibold text-rose-650 dark:text-rose-400/85 mt-1 block border-t border-rose-500/10 pt-1">
                लंबित किस्तें: {unpaidItems.length}
              </span>
            </div>

            <div className="bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/15 p-4 rounded-2xl relative">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">भागीदारी दर</span>
              <span className="text-2xl font-serif font-black text-amber-700 dark:text-amber-400 block mt-1">{clearancePercent}%</span>
              <span className="text-[10px] font-sans font-semibold text-amber-600 dark:text-amber-400/80 mt-1 block border-t border-amber-500/10 pt-1">
                संस्थान साख ग्रेड: {clearancePercent >= 80 ? 'Class A' : clearancePercent >= 50 ? 'Class B' : 'Suspended'}
              </span>
            </div>
          </div>

          {/* Graphical Representation Bento Box */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5">
            <h3 className="font-serif font-black text-stone-800 dark:text-stone-200 text-base mb-4 flex items-center gap-1.5 pb-2 border-b border-stone-100 dark:border-stone-850">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              सामाजिक बही श्रेणी-वार वित्तीय योगदान विश्लेषण (Category Allocation Chart)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Category-wise Custom Bars */}
              <div className="md:col-span-8 space-y-4">
                {itemTypes.map((type) => {
                  const dataObj = eventBreakdown[type] || { count: 0, total: 0, paid: 0, paidCount: 0 };
                  const percentOfTotals = totalDuesAmount > 0 ? Math.round((dataObj.total / totalDuesAmount) * 100) : 0;
                  const labelMeta = eventLabels[type] || { label: type, color: 'text-stone-600', bg: 'bg-stone-500' };

                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className={`font-bold flex items-center gap-1.5 ${labelMeta.color}`}>
                          <span className={`w-2.5 h-2.5 rounded-sm ${labelMeta.bg}`} />
                          {labelMeta.label}
                        </span>
                        <span className="text-stone-500">
                          ₹{dataObj.paid} चुकता / ₹{dataObj.total} योग ({dataObj.count} इवेंट्स)
                        </span>
                      </div>

                      {/* Stacked Progress bar */}
                      <div className="w-full h-3 bg-stone-100 dark:bg-stone-850 rounded-full overflow-hidden relative flex">
                        {/* Paid Part */}
                        <div 
                          className={`h-full ${labelMeta.bg} opacity-100 rounded-l-full transition-all duration-500`}
                          style={{ width: `${dataObj.total > 0 ? (dataObj.paid / dataObj.total) * 100 : 0}%` }}
                        />
                        {/* Outstanding part */}
                        <div
                          className={`h-full ${labelMeta.bg} opacity-30 transition-all duration-500`}
                          style={{ width: `${dataObj.total > 0 ? ((dataObj.total - dataObj.paid) / dataObj.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend/Aura Stat block */}
              <div className="md:col-span-4 p-4 bg-stone-50 dark:bg-stone-955 rounded-2xl border border-stone-150 dark:border-stone-850 text-center space-y-3">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">वित्तीय सुदृढ़ता आकलन</span>
                <div className="inline-flex items-center justify-center p-3.5 rounded-full bg-amber-500/10">
                  <Award className="w-8 h-8 text-amber-700 dark:text-amber-500" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-serif font-extrabold text-sm text-stone-800 dark:text-stone-200">
                    {clearancePercent >= 80 ? 'स्वर्ण श्रेणी भागीदार' : 'सक्रिय समाज बन्धु'}
                  </h5>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    मालाणी समाज के विधान के अधीन आपके सहयोग एवं अंशदान का स्तर सराहनीय एवं विहित शर्तों के अनुरूप पूर्णतः सत्यापित है।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Circular Contribution Ring Widget */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-855 rounded-3xl p-5 text-center flex flex-col justify-between h-full min-h-[320px]">
            <div>
              <h4 className="font-serif font-black text-stone-800 dark:text-stone-200 text-sm mb-1">
                सत्र 2026 योगदान अनुपात (Contribution Rate)
              </h4>
              <span className="text-[10px] font-sans font-semibold text-stone-450 uppercase block">YEARLY STABILIZATION RATIO</span>
            </div>

            {/* Premium Circular SVG Gauge */}
            <div className="relative w-36 h-36 mx-auto my-5 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Track circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  className="text-stone-100 dark:text-stone-800"
                  strokeWidth="8"
                />
                {/* Stroke circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  className="text-amber-700 dark:text-amber-500 transition-all duration-1000 ease-in-out"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * clearancePercent) / 100}
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner details */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                <span className="text-2xl font-serif font-black text-stone-900 dark:text-stone-50">{clearancePercent}%</span>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none">चुकता दर</span>
              </div>
            </div>

            {/* Bottom mini facts */}
            <div className="bg-stone-50 dark:bg-stone-955 p-3 rounded-2xl border border-stone-150 dark:border-stone-850/60 text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between font-medium">
              <span>लंबित राशि: <strong className="text-rose-600">₹{totalUnpaidAmount}</strong></span>
              <span>कुल इवेंट्स: <strong>{totalItems}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Historic Timeline & Transaction summary bento box */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 no-print">
        <h3 className="font-serif font-black text-stone-800 dark:text-stone-200 text-base mb-4 flex items-center gap-1.5 pb-2 border-b border-stone-100 dark:border-stone-850">
          <History className="w-4 h-4 text-amber-600" />
          वार्षिक बही लेनदेन इतिहास एवं सहभागिता लॉग (Annual Track History)
        </h3>

        {ledger.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 dark:border-stone-850 text-stone-400 text-xs uppercase font-bold tracking-wider whitespace-nowrap">
                  <th className="pb-3 text-left pl-2">विवरण (Event Description)</th>
                  <th className="pb-3 text-left">श्रेणी</th>
                  <th className="pb-3 text-left">उद्घोषणा तिथि / नियत</th>
                  <th className="pb-3 text-right">मूल्य</th>
                  <th className="pb-3 text-center">स्थिति / भुगतान तिथि</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                {ledger.map((item) => {
                  const meta = eventLabels[item.eventType] || { label: item.eventType, color: 'text-stone-650', bg: 'bg-stone-500' };
                  return (
                    <tr key={`dashboard-row-${item.id}`} className="hover:bg-stone-50/50 dark:hover:bg-stone-955/40">
                      <td className="py-3.5 pl-2 font-bold text-stone-800 dark:text-stone-200 min-w-[200px] max-w-sm truncate">
                        {item.description}
                      </td>
                      <td className="py-3.5 text-xs">
                        <span className={`inline-block font-sans font-extrabold text-[10px] px-2 py-0.5 rounded-full ${
                          item.eventType === 'Vivah' 
                            ? 'bg-amber-100 text-amber-905 dark:bg-amber-950/40 dark:text-amber-400' 
                            : item.eventType === 'Momera'
                              ? 'bg-purple-100 text-purple-905 dark:bg-purple-950/40 dark:text-purple-400'
                              : 'bg-rose-100 text-rose-905 dark:bg-rose-950/40 dark:text-rose-450'
                        }`}>
                          {item.eventType === 'Vivah' ? 'विवाह बही' : item.eventType === 'Momera' ? 'मोमेरा' : item.eventType === 'Death' ? 'निधन पूल' : 'सामान्य'}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs font-mono font-bold text-stone-500 dark:text-stone-400">
                        {item.dueDate}
                      </td>
                      <td className="py-3.5 text-right font-mono font-black text-stone-800 dark:text-stone-200">
                        ₹{item.duesAmount}
                      </td>
                      <td className="py-3.5 text-center">
                        {item.isPaid ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450 px-2.5 py-0.5 rounded-lg text-xs font-bold font-sans">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            चुकता ({item.paymentDate})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/20 px-2.5 py-0.5 rounded-lg text-xs font-bold font-sans">
                            <Clock className="w-3 h-3 text-rose-500" />
                            अवैतनिक (Unpaid)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-stone-400">
            कोई बही रिकॉर्ड उपलब्ध नहीं है।
          </div>
        )}
      </div>

      {/* BRAND NEW: Traditional High-Fidelity Rajasthani Financial Clearance Certificate Panel (Print-Ready) */}
      <div className="bg-[#FAF8F2] dark:bg-stone-900 border-2 border-double border-amber-800/30 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden print-container shadow-sm">
        {/* Rajasthani Traditional Saffron Ribbon background texture decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-red-800 no-print" />

        {/* Vintage Pattern Border Frame */}
        <div className="absolute inset-4 border border-amber-800/10 rounded-[2rem] pointer-events-none no-print" />

        {/* Certificate Header block */}
        <div className="text-center space-y-2.5 print-header relative z-10">
          <div className="flex justify-center items-center gap-2">
            <span className="h-0.5 w-10 bg-amber-700/60" />
            <span className="font-serif tracking-widest text-[#825E12] dark:text-amber-500 font-extrabold text-xs uppercase">
              • मालाणी समाज सेवा संस्थान •
            </span>
            <span className="h-0.5 w-10 bg-amber-700/60" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-amber-900 dark:text-amber-50 leading-tight">
            वित्तीय भुगतान निष्पादन एवं पात्रता प्रमाण-पत्र
          </h2>
          <span className="text-[11px] font-sans text-stone-500 dark:text-stone-400 font-bold block">
            FINANCIAL DETAILED STATEMENT & STATEMENT OF ACCOUNTS • REGISTRATION NO: 412/BALOTRA
          </span>
        </div>

        {/* Certificate Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 pt-4 items-center">
          {/* Member Credentials Details Profile area */}
          <div className="md:col-span-3 space-y-4 text-xs font-medium text-stone-600 dark:text-stone-400 border-r border-stone-200/50 dark:border-stone-800/50 pr-4">
            <div className="space-y-2">
              <p className="leading-relaxed text-sm text-stone-850 dark:text-stone-200">
                प्रमाणित किया जाता है कि संस्थान के पंजीकृत सदस्य <strong>श्री {profile.displayName}</strong>, 
                सदस्यता संख्या <strong>{profile.membershipId || 'MSS'}</strong>, सुपुत्र <strong>श्री {profile.fatherName || 'मालणी सदस्य'}</strong> ने 
                सत्र 2026 की समस्त उद्घोषित बही प्रविष्टियों के सापेक्ष निम्नानुसार योगदान सुनिश्चित किया है:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] text-stone-450 block font-bold uppercase">कुल उद्घोषित बही</span>
                <span className="text-base text-stone-900 dark:text-stone-100 font-black">{totalItems} प्रविष्टियां (Installments)</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-stone-450 block font-bold uppercase">चुकता बही मूल्य</span>
                <span className="text-base text-emerald-700 dark:text-emerald-400 font-mono font-black">₹{totalPaidAmount} चुकता (Cleared)</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-stone-450 block font-bold uppercase">लंबित बही (Dues Out)</span>
                <span className="text-base text-stone-900 dark:text-stone-100 font-black">
                  {unpaidItems.length} बकाया किस्तें (₹{totalUnpaidAmount})
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-stone-450 block font-bold uppercase">सहायता पात्रता स्थिति</span>
                <span className={`text-[12px] font-black rounded-lg ${
                  unpaidItems.length >= 3 
                    ? 'text-rose-700 bg-rose-500/10 px-2' 
                    : 'text-emerald-700 bg-emerald-500/10 px-2'
                } inline-block pb-0.5`}>
                  {unpaidItems.length >= 3 ? '🔴 सीमित/संशोधित (Rule 4 Restricted)' : '🟢 पूर्णतः पात्र (Active & Eligible)'}
                </span>
              </div>
            </div>
          </div>

          {/* Golden Seal of approval from digital registry */}
          <div className="md:col-span-1 flex flex-col items-center justify-center space-y-3.5 bg-white/70 dark:bg-stone-955 p-5 rounded-2xl border border-amber-800/15 text-center shadow-inner custom-shadow-print">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-800 dark:text-amber-500 rounded-full flex items-center justify-center border-2 border-dashed border-amber-800/40 p-2 relative animate-spin-slow">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1 text-center">
              <span className="text-[9px] font-black text-amber-850 dark:text-amber-400 tracking-wider block">OFFICIAL DIGITAL SECURITY SEAL</span>
              <p className="text-[8px] text-stone-450 leading-relaxed max-w-[120px] mx-auto">
                मालाणी समाज सेवा संस्थान डिजिटल बही रिकॉर्ड बोर्ड द्वारा स्वतः प्रतिहस्ताक्षरित।
              </p>
            </div>
          </div>
        </div>

        {/* Signature & Legal Notice Area of Print Certificate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-amber-800/15 dark:border-stone-800 text-stone-500 text-[10px] font-medium font-sans">
          <div className="text-left space-y-1">
            <span className="font-bold text-stone-600 dark:text-stone-400 block pb-0.5">⚠️ वैधानिक मार्गदर्शिका विवरण (Guidance Notice):</span>
            <p className="leading-relaxed">
              यह दस्तावेज़ संस्थान की केंद्रीय वित्तीय प्रणाली द्वारा डिजिटल रूप से तैयार किया गया है। 
              सहायता आवेदन के समय किसी पृथक हार्डकॉपी या रसीद की आवश्यकता नहीं है, आपकी ऑनलाइन बही स्थिति ही अंतिम निर्णय कारक होगी।
            </p>
          </div>
          <div className="text-right flex flex-col justify-end items-end space-y-1 sm:pt-4">
            <div className="w-32 border-b border-stone-300 dark:border-stone-750 font-serif italic text-stone-700 dark:text-stone-300 font-bold text-center pb-1">
              Malani Digital Auth
            </div>
            <span className="font-bold text-stone-450 uppercase block tracking-wider text-[8px]">
              डिजिटल प्राधिकृत हस्ताक्षर • MALANI EXECUTIVE DIRECTORY
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
