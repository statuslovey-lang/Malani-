import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Coins, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  PlusCircle, 
  HeartHandshake,
  Heart,
  ChevronRight,
  AlertCircle,
  CreditCard,
  QrCode,
  Smartphone,
  Building,
  Check,
  Loader2,
  Lock,
  ArrowRight,
  X,
  RefreshCw,
  ChevronLeft,
  ShieldCheck,
  Calendar,
  Send,
  Download,
  Share2
} from 'lucide-react';
import { LedgerItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface LedgerBookProps {
  ledger: LedgerItem[];
  unpaidCount: number;
  totalDuesAmount: number;
  onPayDues: (itemId: string) => void;
  onDeclareEvent: (type: 'Vivah' | 'Momera' | 'Death', desc: string) => void;
}

export default function LedgerBook({ 
  ledger, 
  unpaidCount, 
  totalDuesAmount, 
  onPayDues,
  onDeclareEvent 
}: LedgerBookProps) {
  // Declaration Form state
  const [eventTypeName, setEventTypeName] = useState<'Vivah' | 'Momera' | 'Death'>('Vivah');
  const [declarationDesc, setDeclarationDesc] = useState('');
  const [showDeclareForm, setShowDeclareForm] = useState(false);

  // Tab & Transaction History filtering/receipt states
  const [ledgerTab, setLedgerTab] = useState<'pending' | 'history'>('pending');
  const [sortByPriority, setSortByPriority] = useState(true);
  const [historySearch, setHistorySearch] = useState('');

  // Helper to calculate days remaining from due date
  const getDueDaysRemaining = (dueDateStr: string): number => {
    if (!dueDateStr) return 999;
    try {
      // Base date June 4, 2026 matches system simulation context
      const today = new Date("2026-06-04T12:00:00Z");
      const due = new Date(dueDateStr + "T23:59:59Z");
      today.setHours(0,0,0,0);
      due.setHours(0,0,0,0);
      const diffTime = due.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return 999;
    }
  };

  const getDueStatus = (dueDateStr: string) => {
    const daysLeft = getDueDaysRemaining(dueDateStr);
    
    if (daysLeft < 0) {
      return {
        label: `${Math.abs(daysLeft)} दिन विलंबित (Overdue)`,
        style: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 px-2 py-0.5 rounded text-xs font-bold leading-normal inline-flex items-center gap-1.5',
        icon: AlertCircle,
        rowBg: 'bg-rose-50/25 dark:bg-rose-950/5 border-l-4 border-l-rose-500',
        badgeBg: 'bg-rose-500'
      };
    } else if (daysLeft === 0) {
      return {
        label: 'आज ही अंतिम तिथि (Due Today)',
        style: 'bg-amber-50 text-amber-950 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 px-2 py-0.5 rounded text-xs font-bold leading-normal inline-flex items-center gap-1.5 animate-pulse',
        icon: AlertTriangle,
        rowBg: 'bg-amber-50/40 dark:bg-amber-950/5 border-l-4 border-l-amber-500',
        badgeBg: 'bg-amber-500'
      };
    } else if (daysLeft <= 5) {
      return {
        label: `${daysLeft} दिन शेष (Due Soon)`,
        style: 'bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-405 dark:border-yellow-901/30 px-2 py-0.5 rounded text-xs font-bold leading-normal inline-flex items-center gap-1.5',
        icon: Clock,
        rowBg: 'bg-yellow-50/10 dark:bg-yellow-950/2 border-l-4 border-l-yellow-400',
        badgeBg: 'bg-yellow-550'
      };
    } else {
      return {
        label: `${daysLeft} दिन शेष (Upcoming)`,
        style: 'bg-stone-50 text-stone-600 border border-stone-150 dark:bg-stone-955 dark:text-stone-400 dark:border-stone-800 px-2 py-0.5 rounded text-xs font-semibold leading-normal inline-flex items-center gap-1.5',
        icon: Calendar,
        rowBg: 'hover:bg-stone-50/50 dark:hover:bg-stone-900/40 border-l-4 border-l-stone-300 dark:border-l-stone-700',
        badgeBg: 'bg-stone-400'
      };
    }
  };
  const [historyFilter, setHistoryFilter] = useState<'all' | 'Vivah' | 'Momera' | 'Death' | 'Ad-hoc'>('all');
  const [selectedReceiptItem, setSelectedReceiptItem] = useState<LedgerItem | null>(null);

  // Payment gateway states
  const [activePaymentItem, setActivePaymentItem] = useState<LedgerItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi_app' | 'upi_qr' | 'card' | 'netbanking'>('upi_app');
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'otp' | 'success'>('select');
  
  // Card mock state
  const [cardNo, setCardNo] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState('');
  const [cardOtp, setCardOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // UPI mock state
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [upiPin, setUpiPin] = useState('');
  const [isUpiPinScreen, setIsUpiPinScreen] = useState(false);
  const [upiError, setUpiError] = useState('');

  // Net banking mock state
  const [selectedBank, setSelectedBank] = useState<string>('SBI');
  const [bankUsername, setBankUsername] = useState('');
  const [bankPassword, setBankPassword] = useState('');
  const [bankOtp, setBankOtp] = useState('');
  const [bankStep, setBankStep] = useState<'login' | 'otp' | 'processing' | 'success'>('login');
  const [bankError, setBankError] = useState('');

  // Gateway notification status
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedTxnId, setGeneratedTxnId] = useState('');

  const playSuccessChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = 880; // Elegant coin / positive chime
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.log("Audio Web Synth chimes optional fallback: not allowed yet");
    }
  };

  const handleDeclareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationDesc.trim()) {
      alert("कृपया घोषणा का संक्षिप्त विवरण दर्ज करें।");
      return;
    }
    const standardDesc = `${eventTypeName === 'Vivah' ? 'विवाह घोषणा' : eventTypeName === 'Momera' ? 'मोमेरा घोषणा' : 'देवलोक गमन सूचना'} • ${declarationDesc.trim()}`;
    onDeclareEvent(eventTypeName, standardDesc);
    setDeclarationDesc('');
    setShowDeclareForm(false);
  };

  // Status message for Dues
  const getDuesStatusMessage = () => {
    if (unpaidCount === 0) {
      return {
        title: "सुरक्षित सक्रिय सदस्य (Active / Fully Safe)",
        hindi: "बधाई हो! आपकी सभी किस्तें पूर्णतः चुकता हैं। आप पूर्ण सुरक्षा घेरे में हैं।",
        color: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/15 dark:border-green-900/30 dark:text-green-400",
        icon: CheckCircle
      };
    } else if (unpaidCount === 1) {
      return {
        title: "सक्रिय सदस्य (Active - 1 Pending)",
        hindi: "आप सक्रिय हैं। केवल 1 संचित किस्त बकाया है। भुगतान कर पूर्ण सुरक्षित रहें।",
        color: "bg-stone-50 border-stone-250 text-stone-850 dark:bg-stone-900/20 dark:border-stone-800 dark:text-stone-305",
        icon: Clock
      };
    } else if (unpaidCount === 2) {
      return {
        title: "किस्त बकाया चेतावनी (Warning - 2 Pending)",
        hindi: "चेतावनी: आपके बही-खाते में 2 किस्तें बकाया हैं। १ और बकाया होने पर खाता सीमित/निलंबित कर दिया जाएगा।",
        color: "bg-amber-50 border-amber-250 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400",
        icon: AlertTriangle
      };
    } else {
      return {
        title: "सीमित सदस्य - खाता निलंबित (Restricted / Blocked)",
        hindi: "नियम 4 उलंघन! 3 या अधिक बकाया किस्तें होने के कारण आपके समस्त दावे एवं ग्रेस विशेषाधिकार निलंबित हैं।",
        color: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400",
        icon: AlertCircle
      };
    }
  };

  const duesStatus = getDuesStatusMessage();
  const StatusIcon = duesStatus.icon;

  // Initiate Payment Simulation
  const handleInitiatePayment = (item: LedgerItem) => {
    setActivePaymentItem(item);
    setPaymentMethod('upi_app');
    setPaymentStep('select');
    setCardNo('');
    setCardHolder('');
    setCardExp('');
    setCardCvv('');
    setCardError('');
    setCardOtp('');
    setOtpError('');
    setUpiId('');
    setUpiPin('');
    setIsUpiPinScreen(false);
    setUpiError('');
    setSelectedBank('SBI');
    setBankUsername('');
    setBankPassword('');
    setBankOtp('');
    setBankStep('login');
    setBankError('');
    setStatusMessage('');
    
    // Generate simulated tx receipt
    const randId = 'pay_' + Math.floor(Math.random() * 900000 + 100000) + 'MSS' + Math.floor(Math.random() * 9000 + 1000).toString(16).toUpperCase();
    setGeneratedTxnId(randId);
  };

  // Format Helper Card Input
  const handleCardNoChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    setCardNo(parts.join(' '));
  };

  const handleCardExpChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExp(raw.slice(0, 2) + '/' + raw.slice(2, 4));
    } else {
      setCardExp(raw);
    }
  };

  const handleCardCvvChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 3);
    setCardCvv(raw);
  };

  // Card Submit Verification
  const processCardPayment = () => {
    if (cardNo.replace(/\s+/g, '').length < 16) {
      setCardError('कृपया मान्य १६ अंकों का क्रेडिट/डेबिट कार्ड नंबर दर्ज करें।');
      return;
    }
    if (cardExp.length < 5) {
      setCardError('कृपया मान्य समाप्त तारीख (MM/YY) दर्ज करें।');
      return;
    }
    if (cardCvv.length < 3) {
      setCardError('कृपया ३ अंकों का सुरक्षा CVV कोड दर्ज करें।');
      return;
    }
    setCardError('');
    setPaymentStep('processing');
    setStatusMessage('बैंक सुरक्षा गेटवे से संपर्क स्थापित किया जा रहा है...');
    
    setTimeout(() => {
      setPaymentStep('otp');
      setStatusMessage('One-Time Password (OTP) आपके बैंक पंजीकृत मोबाइल नंबर पर प्रेषित किया गया है।');
    }, 1800);
  };

  const submitCardOtp = () => {
    if (!cardOtp.trim()) {
      setOtpError('कृपया बैंक से प्राप्त ६ अंकों का ओटीपी (उदा. 123456) दर्ज करें।');
      return;
    }
    setOtpError('');
    setPaymentStep('processing');
    setStatusMessage('कार्ड ट्रांजैक्शन की प्रमाणीकरण जांच की जा रही है...');
    
    setTimeout(() => {
      playSuccessChime();
      setPaymentStep('success');
    }, 2000);
  };

  // UPI App Submission
  const triggerUpiAppSubmit = () => {
    if (upiId && !upiId.includes('@')) {
      setUpiError('कृपया मान्य UPI आईडी दर्ज करें (उदा. username@ybl)');
      return;
    }
    setUpiError('');
    setPaymentStep('processing');
    setStatusMessage(`खुल रहा है ${selectedUpiApp.toUpperCase()}... सुरक्षित पासवर्ड अनुरोध शुरू किया जा रहा है।`);
    
    setTimeout(() => {
      setIsUpiPinScreen(true);
      setPaymentStep('select'); // Still in select modal layout, but displaying PIN panel
    }, 1200);
  };

  // UPI App Keyboard Entry Handler
  const handlePinKeyPress = (val: string) => {
    if (val === 'back') {
      setUpiPin(prev => prev.slice(0, -1));
    } else if (val === 'check') {
      if (upiPin.length < 4) {
        setUpiError('कृपया ४ या ६ अंकों का UPI पिन दर्ज करें।');
        return;
      }
      setUpiError('');
      setIsUpiPinScreen(false);
      setPaymentStep('processing');
      setStatusMessage('सुरक्षित UPI पिन का सत्यापन किया जा रहा है...');
      
      setTimeout(() => {
        playSuccessChime();
        setPaymentStep('success');
      }, 1800);
    } else {
      if (upiPin.length < 6) {
        setUpiPin(prev => prev + val);
      }
    }
  };

  // UPI QR Code trigger scanning simulator
  const simulateQrScanSuccess = () => {
    setPaymentStep('processing');
    setStatusMessage('मोबाइल ऐप द्वारा QR कोड को सफलतापूर्वक स्कैन किया गया! भुगतान स्वीकृति की प्रतीक्षा है...');
    setTimeout(() => {
      playSuccessChime();
      setPaymentStep('success');
    }, 2200);
  };

  // Netbanking Submission
  const processNetbankingLogin = () => {
    if (!bankUsername.trim()) {
      setBankError('कृपया यूजर आईडी या सदस्य कॉर्पोरेट प्रयोक्ता नाम दर्ज करें।');
      return;
    }
    if (!bankPassword.trim()) {
      setBankError('कृपया नेट बैंकिंग पासवर्ड दर्ज करें।');
      return;
    }
    setBankError('');
    setBankStep('processing');
    setStatusMessage(`${selectedBank} सुरक्षित सर्वर के साथ प्रमाणीकरण किया जा रहा है...`);
    
    setTimeout(() => {
      setBankStep('otp');
    }, 1600);
  };

  const processNetbankingOtp = () => {
    if (!bankOtp.trim()) {
      setBankError('कृपया बैंक हस्ताक्षरित ट्रांजैक्शन सुरक्षा पासवर्ड (OTP) दर्ज करें।');
      return;
    }
    setBankError('');
    setBankStep('processing');
    setStatusMessage('कोष अंतरण (Fund Transfer) की प्रक्रिया प्रारंभ है...');
    
    setTimeout(() => {
      playSuccessChime();
      setPaymentStep('success');
    }, 1800);
  };

  // Save successful update to application state
  const handleFinishPayDues = () => {
    if (activePaymentItem) {
      onPayDues(activePaymentItem.id);
      setActivePaymentItem(null);
    }
  };

  // Card Brand Detection
  const getCardBrand = (no: string) => {
    const cleaned = no.replace(/\s+/g, '');
    if (cleaned.startsWith('4')) return 'VISA';
    if (cleaned.startsWith('5')) return 'MASTERCARD';
    if (cleaned.startsWith('3')) return 'AMEX';
    if (cleaned.startsWith('6')) return 'RUPAY';
    return 'CARD';
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-200/50 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-amber-950 dark:text-amber-100 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-amber-700 dark:text-amber-500" />
            सामुदायिक बही-खाता (Dues Ledger)
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mt-1">व्यक्तिगत किस्त योगदान इतिहास एवं बकाया देय व्यवस्था</p>
        </div>

        <button
          onClick={() => setShowDeclareForm(!showDeclareForm)}
          className="px-5 py-2.5 rounded-full bg-amber-800 hover:bg-amber-900 text-white flex items-center gap-2 text-sm font-bold transition-all shadow-sm"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          घोषणा करें (Declare Event)
        </button>
      </div>

      {/* Dues Status Banner */}
      <div className={`p-5 border rounded-2xl flex gap-4 text-left items-start ${duesStatus.color}`}>
        <StatusIcon className="w-6 h-6 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-serif font-bold text-base sm:text-lg">
            {duesStatus.title} – बकाया संख्या- {unpaidCount}
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed">
            {duesStatus.hindi}
          </p>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-2xl text-left">
          <span className="text-xs font-semibold text-stone-400 block uppercase">कुल outstanding देय</span>
          <span className="text-3xl font-serif font-bold text-amber-900 dark:text-amber-200 mt-1 block">
            ₹{totalDuesAmount}
          </span>
          <span className="text-[10px] text-stone-400 block mt-1">कुल बकाया संचयित राशि</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-2xl text-left">
          <span className="text-xs font-semibold text-stone-400 block uppercase">लंबित किस्तों की संख्या</span>
          <span className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-200 mt-1 block">
            {unpaidCount} किस्तें
          </span>
          <span className="text-[10px] text-stone-400 block mt-1">सुरक्षित सीमा: 2 किस्तों तक</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-2xl text-left">
          <span className="text-xs font-semibold text-stone-400 block uppercase">खाता वैधानिक स्थिति</span>
          <span className={`text-xl font-bold mt-2.5 inline-block ${unpaidCount >= 3 ? 'text-red-650' : 'text-green-600'}`}>
            {unpaidCount >= 3 ? 'LOCK-IN SUSPENDED ⚠️' : 'सक्रिय (ACTIVE)'}
          </span>
          <span className="text-[10px] text-stone-400 block mt-1">नियम 4 और 5 के अधीन</span>
        </div>
      </div>

      {/* Floating Event Declaration Form */}
      {showDeclareForm && (
        <form onSubmit={handleDeclareSubmit} className="bg-amber-50/40 dark:bg-stone-900 border border-amber-200/40 p-6 rounded-3xl text-left space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-amber-200/20 pb-2">
            <h4 className="font-serif font-bold text-amber-955 dark:text-amber-200 text-lg">
              नूतन आयोजन घोषणा बही (Declare Community Match)
            </h4>
            <span className="text-xs text-amber-800 bg-amber-100 font-bold px-2 py-1 rounded">
              परस्पर पूलिंग अंशदान योग
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 block">घोषणा आयोजन का प्रकार (Event Type)</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Vivah', 'Momera', 'Death'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventTypeName(type)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      eventTypeName === type 
                        ? 'bg-amber-600 text-white border-amber-600' 
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50'
                    }`}
                  >
                    {type === 'Vivah' ? 'विवाह (₹300)' : type === 'Momera' ? 'मोमेरा (₹200)' : 'निधन (₹200)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 block">आयोजन ब्यौरा (e.g. किसके परिवार में आयोजन है)</label>
              <input 
                type="text"
                value={declarationDesc}
                onChange={(e) => setDeclarationDesc(e.target.value)}
                placeholder="उदा. मगराज जी देवसी सुपुत्र ब्याह"
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white dark:bg-stone-900 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setShowDeclareForm(false)}
              className="px-4 py-2 text-xs font-bold rounded-lg border border-stone-200 hover:bg-stone-50 dark:border-stone-800"
            >
              रद्द करें
            </button>
            <button 
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-800 text-white text-xs font-bold hover:bg-amber-900"
            >
              घोषणा प्रसारित करें (Apply Due)
            </button>
          </div>
        </form>
      )}

      {/* Ledger Log Data Table / Sub-Tabs */}
      <div className="bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 rounded-3xl p-6 shadow-sm text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-850 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-700" />
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              किस्त देय बही पंजीकरण (Dues Register)
            </h3>
          </div>

          {/* Sub-Tab toggles */}
          <div className="flex bg-stone-100 dark:bg-stone-955 p-1 rounded-xl shrink-0 self-start md:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => setLedgerTab('pending')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                ledgerTab === 'pending'
                  ? 'bg-white dark:bg-stone-850 text-amber-900 dark:text-amber-400 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-205'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              बकाया किस्तें ({ledger.filter(item => !item.isPaid).length})
            </button>
            <button
              type="button"
              onClick={() => setLedgerTab('history')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                ledgerTab === 'history'
                  ? 'bg-white dark:bg-stone-850 text-amber-900 dark:text-amber-400 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-205'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              भुगतान इतिहास ({ledger.filter(item => item.isPaid).length})
            </button>
          </div>
        </div>

        {ledgerTab === 'pending' ? (
          <div>
            {(() => {
              const pendingItems = ledger.filter(item => !item.isPaid);
              const overdueOrNearingItems = pendingItems.filter(item => getDueDaysRemaining(item.dueDate) <= 5);

              // Sort pending items based on urgency
              const sortedPendingItems = [...pendingItems].sort((a, b) => {
                if (sortByPriority) {
                  return getDueDaysRemaining(a.dueDate) - getDueDaysRemaining(b.dueDate);
                }
                return 0; // standard order
              });

              if (pendingItems.length === 0) {
                return (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-600">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-stone-800 dark:text-stone-205 text-lg">सब किस्तें चुकता हैं!</h4>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">आपके ऊपर कोई अतिरिक्त बकाया राशि नहीं है। आप मालाणी सेवा संस्थान के पूर्णतः सुरक्षित एवं सक्रिय सदस्य हैं।</p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {/* Priority/Overdue Warning Banner */}
                  {overdueOrNearingItems.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50/50 dark:bg-rose-950/10 border border-red-200 dark:border-rose-900/30 p-5 rounded-2xl space-y-3 text-left"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-rose-450 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-serif font-black text-sm text-red-900 dark:text-rose-400">
                            🚨 अति-आवश्यक सामाजिक अंशदान सूचना (Action Required: Priority Dues)
                          </h4>
                          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                            आपके खाते में <strong>{overdueOrNearingItems.length}</strong> सामाजिक किस्तें विलंबित या अंतिम तिथि के अत्यंत निकट हैं। नियम 4 के अनुसार खाते को विलम्ब निलंबन से बचाने के लिए प्राथमिकता से इनका निपटारा करें।
                          </p>
                        </div>
                      </div>

                      {/* Mini list of urgent items inside banner */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {overdueOrNearingItems.map((item) => {
                          const status = getDueStatus(item.dueDate);
                          const StatusIcon = status.icon;
                          return (
                            <div 
                              key={`urgent-banner-${item.id}`} 
                              className="flex items-center justify-between p-3 bg-white dark:bg-stone-950/40 border border-red-200/40 dark:border-rose-900/20 rounded-xl hover:border-red-500/25 transition-all text-xs"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="font-bold text-stone-800 dark:text-stone-200 block truncate">{item.description}</span>
                                <span className="text-[10px] text-stone-450 flex items-center gap-1 mt-0.5 font-semibold">
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {status.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono font-black text-rose-700 dark:text-rose-450">₹{item.duesAmount}</span>
                                <button
                                  type="button"
                                  onClick={() => handleInitiatePayment(item)}
                                  className="px-2.5 py-1 bg-red-650 hover:bg-red-700 text-white text-[10px] font-black rounded-lg transition-all cursor-pointer"
                                >
                                  चुकता करें
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Priority Sort Controller Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 dark:bg-stone-955 p-3 rounded-2xl border border-stone-200/50 dark:border-stone-850">
                    <span className="text-xs text-stone-500 dark:text-stone-450 font-sans flex items-center gap-1.5 font-semibold">
                      <Clock className="w-4 h-4 text-amber-600" />
                      भुगतान प्राथमिकता के आधार पर क्रमबद्ध
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-sans font-bold text-stone-450 uppercase mr-1">क्रमबद्धता:</span>
                      <button
                        type="button"
                        onClick={() => setSortByPriority(true)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          sortByPriority 
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm' 
                            : 'bg-white dark:bg-stone-900 hover:bg-stone-100 text-stone-600 dark:text-stone-400 border border-stone-150 dark:border-stone-800'
                        }`}
                      >
                        🔥 अति-आवश्यक पहले (Urgent First)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortByPriority(false)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          !sortByPriority 
                            ? 'bg-stone-700 text-white shadow-sm' 
                            : 'bg-white dark:bg-stone-900 hover:bg-stone-100 text-stone-600 dark:text-stone-400 border border-stone-150 dark:border-stone-800'
                        }`}
                      >
                        डिफ़ॉल्ट क्रम
                      </button>
                    </div>
                  </div>

                  {/* Pending Dues Table with highlighted rows */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-100 dark:border-stone-850 text-stone-400 font-medium whitespace-nowrap">
                          <th className="pb-3 text-left pl-3">विवरण (Event Description)</th>
                          <th className="pb-3 text-left">दर्ज तिथि / नियत</th>
                          <th className="pb-3 text-right">योगदान मूल्य</th>
                          <th className="pb-3 text-center">स्थिति</th>
                          <th className="pb-3 text-right pr-2">कार्य</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                        {sortedPendingItems.map((item) => {
                          const status = getDueStatus(item.dueDate);
                          const StatusIcon = status.icon;

                          return (
                            <tr key={item.id} className={`transition-all ${status.rowBg}`}>
                              <td className="py-4 pl-3 font-semibold text-stone-800 dark:text-stone-200">
                                <div>
                                  {item.description}
                                  <span className={`inline-block ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    item.eventType === 'Vivah' 
                                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-400' 
                                      : item.eventType === 'Momera'
                                        ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/40 dark:text-purple-400'
                                        : 'bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-400'
                                  }`}>
                                    {item.eventType === 'Vivah' ? 'विवाह बही' : item.eventType === 'Momera' ? 'मोमेरा' : 'निधन पूल'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 text-xs font-mono font-black text-stone-500">
                                {item.dueDate}
                              </td>
                              <td className="py-4 text-right font-mono font-bold text-stone-800 dark:text-stone-150">
                                ₹{item.duesAmount}
                              </td>
                              <td className="py-4 text-center">
                                <span className={status.style}>
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {status.label}
                                </span>
                              </td>
                              <td className="py-4 text-right pr-2">
                                <button 
                                  type="button"
                                  onClick={() => handleInitiatePayment(item)}
                                  className={`px-4 py-2 rounded-full text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto cursor-pointer ${
                                    getDueDaysRemaining(item.dueDate) <= 5
                                      ? 'bg-rose-650 hover:bg-rose-700'
                                      : 'bg-amber-600 hover:bg-amber-700'
                                  }`}
                                >
                                  भुगतान करें
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="space-y-6">
            {/* TRANSACTION HISTORY VIEW WITH SUMMARY BANNER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 dark:bg-stone-955 p-4 border border-stone-150 dark:border-stone-850 rounded-2xl">
              <div className="text-left space-y-1">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block font-sans">आपका ऐतिहासिक कुल अंशदान (Total Contributions Settled)</span>
                <span className="text-2xl font-serif font-extrabold text-green-600 dark:text-green-400">
                  ₹{ledger.filter(item => item.isPaid).reduce((sum, item) => sum + item.duesAmount, 0)}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">सफल रूप से स्वीकृत परोपकारी सहायता राशि</span>
              </div>
              <div className="text-left space-y-1 sm:border-l sm:border-stone-200 dark:sm:border-stone-800 sm:pl-4">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block font-sans">चुक्ता रसीदें (Total Paid Transactions)</span>
                <span className="text-2xl font-serif font-extrabold text-stone-800 dark:text-stone-150">
                  {ledger.filter(item => item.isPaid).length} सफल भुगतान
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">विश्वसनीय सहयोग चक्र के अंतर्गत संकलित प्रविष्टियां</span>
              </div>
            </div>

            {/* Premium Annual Report Redirection Banner */}
            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="space-y-0.5">
                <h4 className="font-serif font-black text-xs text-amber-900 dark:text-amber-400">📊 वार्षिक रिपोर्ट व डिजिटल प्रमाण-पत्र (Annual Financial Certificate)</h4>
                <p className="text-[10px] text-stone-500 max-w-lg">अपने संपूर्ण बही भुगतानों का श्रेणीवार ग्राफिकल चार्ट विश्लेषण देखने या आधिकारिक डिजिटल पात्रता प्रमाण-पत्र (PDF) डाउनलोड करने के लिए मुख्य "वार्षिक रिपोर्ट" टैब पर जाएं।</p>
              </div>
              <span className="text-[10px] bg-amber-600/10 text-amber-900 dark:text-amber-305 font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-wider whitespace-nowrap">
                रिपोर्ट टैब देखें
              </span>
            </div>

            {/* SEARCH AND FILTERS PANEL */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:flex-1 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="पुराने भुगतान या आयोजन विवरण खोजें..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-stone-200 bg-white dark:bg-stone-900 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:text-stone-100"
                />
                {historySearch && (
                  <button 
                    onClick={() => setHistorySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="w-full sm:w-auto flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-bold text-stone-500 whitespace-nowrap hidden sm:inline">श्रेणी:</span>
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value as any)}
                  className="w-full sm:w-auto px-3 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none dark:text-stone-105"
                >
                  <option value="all">सभी बही प्रकार (All)</option>
                  <option value="Vivah">विवाह बही (Vivah)</option>
                  <option value="Momera">मोमेरा (Momera)</option>
                  <option value="Death">निधन सहायता (Death)</option>
                </select>
              </div>
            </div>

            {/* Paid elements list table */}
            {(() => {
              const filteredHistory = ledger
                .filter(item => item.isPaid)
                .filter(item => {
                  if (historyFilter !== 'all' && item.eventType !== historyFilter) return false;
                  return item.description.toLowerCase().includes(historySearch.toLowerCase());
                });

              if (filteredHistory.length === 0) {
                return (
                  <div className="py-8 text-center text-stone-500 dark:text-stone-400 text-xs border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                    दर्ज विवरण के अनुरूप कोई भुगतान इतिहास नहीं मिला।
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 dark:border-stone-850 text-stone-400 font-medium whitespace-nowrap">
                        <th className="pb-3 text-left pl-2">विवरण (Contribution Detail)</th>
                        <th className="pb-3 text-left">भुगतान तिथि (Date Paid)</th>
                        <th className="pb-3 text-right">रसीद संचय मूल्य</th>
                        <th className="pb-3 text-center">सत्यापन स्थिति</th>
                        <th className="pb-3 text-right pr-2">आधिकारिक रसीद</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                      {filteredHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/40">
                          <td className="py-4 pl-2 font-semibold text-stone-800 dark:text-stone-200">
                            <div>
                              {item.description}
                              <span className={`inline-block ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                item.eventType === 'Vivah' 
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-400' 
                                  : item.eventType === 'Momera'
                                    ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/40 dark:text-purple-400'
                                    : 'bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-400'
                              }`}>
                                {item.eventType === 'Vivah' ? 'विवाह बही' : item.eventType === 'Momera' ? 'मोमेरा' : 'निधन पूल'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-semibold text-stone-500 dark:text-stone-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              {item.paymentDate || item.dueDate || item.createdAt}
                            </span>
                          </td>
                          <td className="py-4 text-right font-mono font-bold text-green-600 dark:text-green-400">
                            + ₹{item.duesAmount}
                          </td>
                          <td className="py-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold leading-normal inline-block bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400">
                              जमा (Paid)
                            </span>
                          </td>
                          <td className="py-4 text-right pr-2">
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptItem(item)}
                              className="px-3.5 py-1.5 rounded-full border border-green-200 dark:border-green-900 bg-green-500/5 hover:bg-green-500/15 text-green-700 dark:text-green-400 text-xs font-bold flex items-center gap-1.5 ml-auto transition-all cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-green-600" />
                              रसीद देखें
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* RAZORPAY / UPI PAYMENT MODAL SIMULATOR */}
      <AnimatePresence>
        {activePaymentItem && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 font-sans leading-normal overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-stone-900 max-w-2xl w-full rounded-2xl sm:rounded-[2rem] border border-amber-500/20 shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 max-h-[92vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setActivePaymentItem(null)}
                className="absolute top-4 right-4 p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-205 rounded-full transition-colors z-50 cursor-pointer"
                aria-label="Close dialogue"
              >
                <X className="w-5 h-5" />
              </button>

              {/* LEFT SIDEBAR: Invoice Header, Price & Info */}
              <div className="w-full md:w-5/12 bg-amber-50/70 dark:bg-stone-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200/50 dark:border-stone-850">
                <div className="space-y-4">
                  {/* Merchant Brand header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-700 flex items-center justify-center -rotate-3 shrink-0">
                      <span className="text-white font-serif font-black text-sm">म</span>
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-amber-950 dark:text-amber-100 text-sm leading-tight text-left">
                        मालाणी सेवा संस्थान
                      </h4>
                      <span className="text-[10px] text-stone-400 font-medium block text-left">Bithuja Verified Vendor</span>
                    </div>
                  </div>

                  {/* Pricing detail */}
                  <div className="border-t border-amber-900/10 pt-4 text-left">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-stone-405 block">भुगतान योगदान राशि</span>
                    <div className="text-4xl font-serif font-extrabold text-amber-900 dark:text-amber-150 mt-1 flex items-baseline">
                      ₹{activePaymentItem.duesAmount}
                      <span className="text-xs font-sans font-bold text-stone-400 ml-1.5">INR</span>
                    </div>
                    <span className="text-xs font-medium text-stone-500 block mt-2.5">
                      {activePaymentItem.description}
                    </span>
                  </div>
                </div>

                {/* Secure Badge footer */}
                <div className="mt-8 md:mt-2 text-left">
                  <div className="flex items-center gap-1.5 text-green-600 bg-green-500/10 px-2.5 py-1.5 rounded-xl border border-green-500/25">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-green-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Malaani Pay Secure • SSL 256</span>
                  </div>
                  <p className="text-[10px] text-stone-400 block mt-2 text-left font-mono">Txn Ref: {generatedTxnId.slice(0, 14)}...</p>
                </div>
              </div>

              {/* RIGHT WORKSPACE: Payment Gateway Flow Panels */}
              <div className="w-full md:w-7/12 p-6 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[82vh]">
                
                {paymentStep === 'processing' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-4 min-h-[250px]">
                    <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-stone-800 dark:text-stone-200">अंशदान संसाधित किया जा रहा है...</h4>
                      <p className="text-xs text-stone-500 max-w-xs">{statusMessage}</p>
                    </div>
                  </div>
                )}

                {paymentStep === 'otp' && (
                  <div className="flex-1 flex flex-col justify-between py-2 space-y-4 text-left">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                        <Lock className="w-5 h-5 text-amber-700" />
                        <div>
                          <h4 className="font-serif font-bold text-stone-850 dark:text-amber-100 text-sm">3D Secure OTP प्रमाणीकरण</h4>
                          <p className="text-[11px] text-stone-400">बैंक सुरक्षा सत्यापन कूपन</p>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        सुरक्षित भुगतान प्रणाली के अंतर्गत, आपके बैंक पंजीकृत मोबाइल पर भेजे गए OTP को दर्ज करें। (आप सिम्युलेटर के लिए <strong>123456</strong> का उपयोग कर सकते हैं!)
                      </p>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-400 block uppercase">Enter Secure OTP</label>
                        <input 
                          type="password"
                          placeholder="******"
                          maxLength={6}
                          value={cardOtp}
                          onChange={(e) => setCardOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-3 border text-center text-lg font-mono font-bold tracking-widest text-stone-800 dark:text-stone-100 dark:bg-stone-950 border-stone-300 dark:border-stone-800 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                        {otpError && <p className="text-[11px] text-red-500 font-bold">{otpError}</p>}
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <button 
                        onClick={submitCardOtp}
                        className="w-full py-3 rounded-full bg-amber-800 hover:bg-amber-900 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                      >
                        ओटीपी सत्यापित करें (Verify OTP)
                      </button>
                      <button 
                        onClick={() => setPaymentStep('select')}
                        className="w-full py-2.5 rounded-full border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 text-xs font-medium transition-all"
                      >
                        पीछे जाएँ (Select Channel)
                      </button>
                    </div>
                  </div>
                )}

                {paymentStep === 'success' && (
                  <div className="flex-1 flex flex-col justify-between py-2 space-y-4 animate-scaleUp text-left">
                    <div className="space-y-4 text-center">
                      <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-600 mt-2">
                        <Check className="w-10 h-10" />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] bg-green-150 text-green-900 dark:bg-green-950/40 dark:text-green-400 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Malaani Pay Success ✅
                        </span>
                        <h3 className="font-serif font-black text-stone-850 dark:text-amber-100 text-2xl pt-1">
                          भुगतान पूणर्तया सफल!
                        </h3>
                        <p className="text-xs text-stone-500">
                          अंशदान रसीद बही-खाते में सुरक्षापूर्वक जमा कर ली गई है।
                        </p>
                      </div>

                      {/* Transaction slip */}
                      <div className="bg-stone-50 dark:bg-stone-950 border border-stone-150 dark:border-stone-850 p-4 rounded-2xl text-left space-y-2 font-sans">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-400 font-semibold">ट्रांजैक्शन आईडी:</span>
                          <span className="font-mono font-bold text-stone-700 dark:text-stone-200">{generatedTxnId}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-400 font-semibold">भुगतान तिथि:</span>
                          <span className="font-mono text-stone-600 dark:text-stone-300">{new Date().toLocaleString('en-US', { hour12: false })}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-400 font-semibold">देय विवरण:</span>
                          <span className="text-stone-700 dark:text-stone-200 font-bold truncate max-w-[150px]">{activePaymentItem.description.split(' • ')[1] || activePaymentItem.description}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-400 font-semibold">भुगतान माध्यम:</span>
                          <span className="font-bold text-amber-800 uppercase text-[11px]">
                            {paymentMethod === 'upi_app' ? `UPI - ${selectedUpiApp.toUpperCase()}` : paymentMethod === 'upi_qr' ? 'UPI SCAN QR' : paymentMethod === 'card' ? `CARD - ${getCardBrand(cardNo)}` : `NETBANKING - ${selectedBank}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-2 border-t border-dashed border-stone-200 dark:border-stone-800">
                          <span className="text-stone-500 font-bold">जमा योगदान (Dues Settled):</span>
                          <span className="text-sm font-serif font-extrabold text-green-600">₹{activePaymentItem.duesAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={handleFinishPayDues}
                        className="w-full py-3.5 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                      >
                        तैयार! बही अपडेट करें (Update Ledger)
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {paymentStep === 'select' && (
                  <div className="flex-1 flex flex-col justify-between">
                    
                    {/* Header tabs for desktop/mobile navigation */}
                    <div className="grid grid-cols-4 gap-1.5 border-b border-stone-105 dark:border-stone-850 pb-3 shrink-0">
                      {[
                        { id: 'upi_app', label: 'UPI App', icon: Smartphone },
                        { id: 'upi_qr', label: 'Scan QR', icon: QrCode },
                        { id: 'card', label: 'Card Payment', icon: CreditCard },
                        { id: 'netbanking', label: 'Banking', icon: Building },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSel = paymentMethod === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setPaymentMethod(item.id as any);
                              setIsUpiPinScreen(false);
                            }}
                            className={`p-2.5 rounded-xl flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                              isSel 
                                ? 'bg-amber-600 text-white dark:bg-amber-500/10 dark:text-amber-400 border border-amber-600/30' 
                                : 'hover:bg-stone-50 dark:hover:bg-stone-950 text-stone-500 hover:text-stone-800 dark:text-stone-400'
                            }`}
                          >
                            <Icon className="w-4.5 h-4.5 shrink-0" />
                            <span className="text-[9px] font-bold tracking-tight block sm:inline-block leading-tight">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* DYNAMIC FORM AREA CONTROLS */}
                    <div className="flex-1 py-4 flex flex-col justify-start">
                      
                      {/* 1. UPI APPS INSTANT SELECT */}
                      {paymentMethod === 'upi_app' && !isUpiPinScreen && (
                        <div className="space-y-4 text-left animate-fadeIn">
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block">Choose Live UPI Application</span>
                          <div className="grid grid-cols-2 gap-2.5">
                            {[
                              { id: 'gpay', name: 'Google Pay', color: 'border-blue-500 text-blue-600 bg-blue-500/5' },
                              { id: 'phonepe', name: 'PhonePe', color: 'border-purple-500 text-purple-600 bg-purple-500/5' },
                              { id: 'paytm', name: 'Paytm App', color: 'border-cyan-500 text-cyan-600 bg-cyan-500/5' },
                              { id: 'bhim', name: 'BHIM UPI', color: 'border-emerald-500 text-emerald-600 bg-emerald-500/5' },
                            ].map((app) => (
                              <button
                                key={app.id}
                                onClick={() => setSelectedUpiApp(app.id as any)}
                                className={`p-3.5 border rounded-2xl flex items-center gap-2.5 transition-all text-sm font-bold ${
                                  selectedUpiApp === app.id
                                    ? `ring-2 ring-offset-1 ${app.color}`
                                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                                }`}
                              >
                                <Smartphone className="w-4.5 h-4.5 shrink-0" />
                                {app.name}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold text-stone-500 block uppercase">अपनी UPI ID दर्ज करें (वैकल्पिक)</label>
                            <input 
                              type="text"
                              placeholder="username@ybl / paytm"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-800 dark:bg-stone-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            {upiError && <p className="text-[11px] text-red-500 font-bold">{upiError}</p>}
                          </div>

                          <button 
                            type="button"
                            onClick={triggerUpiAppSubmit}
                            className="w-full py-3 mt-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold transition-all text-xs flex items-center justify-center gap-2"
                          >
                            Proceed to secure UPI Gateway
                          </button>
                        </div>
                      )}

                      {/* UPI APPLICATION PIN SCREEN KEYPAD (MOCK SECURE UPI) */}
                      {paymentMethod === 'upi_app' && isUpiPinScreen && (
                        <div className="space-y-4 animate-scaleUp">
                          <div className="flex items-center justify-between border-b border-dashed border-stone-200 dark:border-stone-800 pb-2.5">
                            <button 
                              onClick={() => setIsUpiPinScreen(false)}
                              className="text-xs text-amber-700 font-bold flex items-center gap-1 hover:underline"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              रद्द करें
                            </button>
                            <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-400 px-2 py-0.5 rounded">
                              SECURE UPI KEYPAD
                            </span>
                          </div>

                          <div className="text-center space-y-2">
                            <p className="text-xs text-stone-500 font-bold uppercase">Enter {selectedUpiApp.toUpperCase()} Security PIN</p>
                            
                            {/* Star dots representing PIN */}
                            <div className="flex gap-2.5 justify-center py-2.5">
                              {[0, 1, 2, 3, 4, 5].map((idx) => (
                                <div 
                                  key={idx}
                                  className={`w-4 h-4 rounded-full border border-stone-300 transition-all ${
                                    idx < upiPin.length 
                                      ? 'bg-amber-800 border-amber-805 scale-110' 
                                      : 'bg-transparent'
                                  }`}
                                />
                              ))}
                            </div>
                            {upiError && <p className="text-[11px] text-red-500 font-bold">{upiError}</p>}
                          </div>

                          {/* Keypad Grid */}
                          <div className="max-w-[280px] mx-auto grid grid-cols-3 gap-2 px-4 py-2 bg-stone-50 dark:bg-stone-950 p-4 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-inner text-sm font-semibold select-none">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handlePinKeyPress(num)}
                                className="py-2 hover:bg-stone-200 dark:hover:bg-stone-850 rounded-lg active:scale-95 transition-all text-lg font-bold"
                              >
                                {num}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => handlePinKeyPress('back')}
                              className="py-2 hover:bg-stone-200 dark:hover:bg-stone-850 rounded-lg text-rose-600 flex items-center justify-center font-bold"
                            >
                              ⌫
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePinKeyPress('0')}
                              className="py-2 hover:bg-stone-200 dark:hover:bg-stone-850 rounded-lg text-lg font-bold"
                            >
                              0
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePinKeyPress('check')}
                              className="py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center justify-center font-bold"
                            >
                              ✔
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. UPI DYNAMIC QR GENERATOR */}
                      {paymentMethod === 'upi_qr' && (
                        <div className="space-y-4 text-left animate-fadeIn">
                          <div className="text-center space-y-3">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block">Scan Dynamic UPI QR Code</span>
                            
                            {/* Branded Golden/Amber QR Code */}
                            <svg viewBox="0 0 100 100" className="w-36 h-36 mx-auto bg-white p-2.5 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm">
                              <rect x="0" y="0" width="100" height="100" fill="white" />
                              <rect x="5" y="5" width="22" height="22" fill="black" />
                              <rect x="9" y="9" width="14" height="14" fill="white" />
                              <rect x="12" y="12" width="8" height="8" fill="black" />

                              <rect x="73" y="5" width="22" height="22" fill="black" />
                              <rect x="77" y="9" width="14" height="14" fill="white" />
                              <rect x="80" y="12" width="8" height="8" fill="black" />

                              <rect x="5" y="73" width="22" height="22" fill="black" />
                              <rect x="9" y="77" width="14" height="14" fill="white" />
                              <rect x="12" y="80" width="8" height="8" fill="black" />

                              <rect x="78" y="78" width="8" height="8" fill="black" />

                              {/* QR Blocks */}
                              <path d="M 32,5 H 42 V 12 H 52 V 18 H 62 V 22 H 52 V 32 H 32 Z" fill="black" />
                              <path d="M 5,32 H 15 V 42 H 25 V 50 H 15 V 60 H 5 Z" fill="black" />
                              <path d="M 32,42 H 50 V 48 H 62 V 62 H 42 V 72 H 32 Z" fill="black" />
                              <path d="M 42,72 H 62 V 82 H 52 V 92 H 42 Z" fill="black" />
                              <path d="M 72,32 H 92 V 42 H 82 V 50 H 72 V 60 H 82 V 70 H 72 Z" fill="black" />
                              
                              {/* Center Brand */}
                              <rect x="38" y="38" width="24" height="24" rx="4" fill="#B45309" />
                              <text x="50" y="55" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="serif">म</text>
                            </svg>

                            <p className="text-[11px] text-stone-500 max-w-xs mx-auto text-center leading-relaxed">
                              भीम, गूगल पे, फोनपे, पेटीएम या कोई भी मोबाइल बैंकिंग ऐप से यह क्यूआर स्कैन कर ₹{activePaymentItem.duesAmount} भेजें।
                            </p>

                            <div className="pt-2">
                              <button 
                                onClick={simulateQrScanSuccess}
                                className="px-5 py-2.5 max-w-xs mx-auto rounded-full bg-amber-800 hover:bg-amber-900 border border-amber-900/10 text-white text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
                              >
                                <Check className="w-4 h-4" />
                                सिमुलेशन स्कैन करें (Click to Scan)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. CARD PAYMENT DETAILS INPUT */}
                      {paymentMethod === 'card' && (
                        <div className="space-y-4 text-left animate-fadeIn">
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block">Secure Credit & Debit Cards</span>
                          
                          {/* Real-time elegant Card Preview */}
                          <div className="w-full aspect-[1.586/1] bg-gradient-to-tr from-amber-950 via-amber-900 to-amber-950 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between border border-white/10 relative overflow-hidden shrink-0">
                            {/* Backdrop details */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="flex justify-between items-start">
                              <div className="w-10 h-7.5 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-md opacity-80" /> {/* Chip */}
                              <span className="text-amber-100 font-bold italic tracking-wide text-sm font-serif">
                                {getCardBrand(cardNo)}
                              </span>
                            </div>

                            <div className="space-y-1 z-10">
                              {/* Card Number display */}
                              <span className="text-lg sm:text-xl font-mono text-amber-50 tracking-widest block select-none">
                                {cardNo || '•••• •••• •••• ••••'}
                              </span>
                              
                              <div className="flex justify-between items-end">
                                <div>
                                  <span className="text-[8px] text-amber-250 uppercase block select-none">CARD HOLDER</span>
                                  <span className="text-xs font-bold block uppercase truncate max-w-[150px]">
                                    {cardHolder || 'SUR_P_NAME'}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[8px] text-amber-250 uppercase block select-none">EXPIRES</span>
                                  <span className="text-xs font-bold block font-mono">
                                    {cardExp || 'MM/YY'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick inputs table */}
                          <div className="space-y-2.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-500 uppercase block">Card Number</label>
                              <input 
                                type="text"
                                placeholder="xxxx xxxx xxxx xxxx"
                                value={cardNo}
                                onChange={(e) => handleCardNoChange(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-850 dark:bg-stone-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-500 uppercase block">Valid Thru</label>
                                <input 
                                  type="text"
                                  placeholder="MM/YY"
                                  value={cardExp}
                                  onChange={(e) => handleCardExpChange(e.target.value)}
                                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-850 dark:bg-stone-950 focus:outline-none focus:ring-1 focus:ring-amber-500 text-center"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-500 uppercase block">CVV (3 Digits)</label>
                                <input 
                                  type="password"
                                  placeholder="***"
                                  value={cardCvv}
                                  onChange={(e) => handleCardCvvChange(e.target.value)}
                                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-850 dark:bg-stone-950 focus:outline-none focus:ring-1 focus:ring-amber-500 text-center"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-500 uppercase block">Card Holder Name</label>
                              <input 
                                type="text"
                                placeholder="उदा. सुरेश पटेल"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-850 dark:bg-stone-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            </div>
                            
                            {cardError && <p className="text-[11px] text-red-500 font-bold">{cardError}</p>}
                          </div>

                          <button 
                            type="button"
                            onClick={processCardPayment}
                            className="w-full py-3 mt-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold transition-all text-xs flex items-center justify-center gap-2"
                          >
                            Proceed Securely
                          </button>
                        </div>
                      )}

                      {/* 4. NETBANKING SELECTION */}
                      {paymentMethod === 'netbanking' && (
                        <div className="space-y-4 text-left animate-fadeIn text-sm">
                          {bankStep === 'login' && (
                            <div className="space-y-3">
                              <span className="text-xs font-bold text-stone-405 uppercase tracking-widest block">Select Bank Account Institution</span>
                              
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { id: 'SBI', name: 'State Bank of India' },
                                  { id: 'HDFC', name: 'HDFC Bank' },
                                  { id: 'ICICI', name: 'ICICI NetBank' },
                                  { id: 'AXIS', name: 'Axis Bank' },
                                ].map((bank) => (
                                  <button
                                    key={bank.id}
                                    onClick={() => setSelectedBank(bank.id)}
                                    className={`p-3 border rounded-xl text-left font-bold transition-all ${
                                      selectedBank === bank.id
                                        ? 'bg-amber-100 border-amber-600 text-amber-900 dark:bg-amber-950 dark:text-amber-400'
                                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 text-stone-700 dark:text-stone-300'
                                    }`}
                                  >
                                    {bank.name}
                                  </button>
                                ))}
                              </div>

                              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-850 mt-2 space-y-2.5">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-500 uppercase block">User ID / Username</label>
                                  <input 
                                    type="text"
                                    placeholder="corporate_usr_bithuja"
                                    value={bankUsername}
                                    onChange={(e) => setBankUsername(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-850 dark:bg-stone-950 focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-500 uppercase block">Banking Password</label>
                                  <input 
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={bankPassword}
                                    onChange={(e) => setBankPassword(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-855 dark:bg-stone-955 focus:outline-none"
                                  />
                                </div>
                                {bankError && <p className="text-[11px] text-red-500 font-bold">{bankError}</p>}
                              </div>

                              <button 
                                type="button"
                                onClick={processNetbankingLogin}
                                className="w-full py-3 mt-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold transition-all text-xs"
                              >
                                Connect NetBanking Server
                              </button>
                            </div>
                          )}

                          {bankStep === 'processing' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-4">
                              <Loader2 className="w-10 h-10 text-amber-700 animate-spin" />
                              <div className="space-y-1">
                                <h4 className="font-semibold text-stone-800 dark:text-stone-205">सुरक्षित बैंकिंग प्रमाणीकरण...</h4>
                                <p className="text-xs text-stone-550">{statusMessage}</p>
                              </div>
                            </div>
                          )}

                          {bankStep === 'otp' && (
                            <div className="space-y-4">
                              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex gap-2 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400">
                                <InfoIcon className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                                <p>सुरक्षित निधि स्थानांतरण के सत्यापन हेतु पंजीकृत मोबाइल पर OTP प्रेषित किया गया है। (आप सिम्युलेटर के लिए <strong>123456</strong> लिख सकते हैं)</p>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-505 block uppercase">बैंक OTP पासवर्ड</label>
                                <input 
                                  type="password"
                                  placeholder="******"
                                  maxLength={6}
                                  value={bankOtp}
                                  onChange={(e) => setBankOtp(e.target.value.replace(/\D/g, ''))}
                                  className="w-full px-4 py-3 border text-center text-lg font-mono font-bold tracking-widest text-stone-800 dark:text-stone-100 dark:bg-stone-950 border-stone-300 dark:border-stone-800 rounded-xl focus:outline-none"
                                />
                                {bankError && <p className="text-[11px] text-red-500 font-bold">{bankError}</p>}
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setBankStep('login')}
                                  className="w-1/3 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-bold"
                                >
                                  पीछे
                                </button>
                                <button 
                                  type="button"
                                  onClick={processNetbankingOtp}
                                  className="w-2/3 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold"
                                >
                                  ट्रांजैक्शन स्वीकृत करें (Approve)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Footer security labels */}
                    <div className="border-t border-stone-100 dark:border-stone-850 pt-3 flex justify-between items-center shrink-0">
                      <span className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-stone-450" />
                        PCI-DSS Compliant Gateway
                      </span>
                      <span className="text-[10px] text-stone-400">Powered by Razorpay</span>
                    </div>

                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRANSACTION RECEIPT MODAL VIEWER */}
      <AnimatePresence>
        {selectedReceiptItem && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 font-sans leading-normal overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-stone-900 max-w-lg w-full rounded-3xl border border-green-500/10 shadow-2xl overflow-hidden relative z-10 max-h-[92vh] flex flex-col"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedReceiptItem(null)}
                className="absolute top-4 right-4 p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-500 hover:text-stone-800 dark:text-stone-400 rounded-full transition-colors z-50 cursor-pointer"
                aria-label="Close receipt"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Receipt Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white text-left relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-y-6 translate-x-4 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-40 h-40" />
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-base whitespace-nowrap">मालाणी सेवा संस्थान, बालोतरा</h3>
                    <p className="text-[10px] text-green-100 tracking-wider font-bold uppercase">आधिकारिक डिजिटल सहयोग रसीद (Official Receipt)</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                  <span className="text-xs text-green-100 font-semibold">कुल चुकता धनराशि (INR):</span>
                  <span className="text-2xl font-serif font-extrabold text-white">₹{selectedReceiptItem.duesAmount}</span>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-6 text-left space-y-5 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-955 p-3 rounded-xl border border-stone-100 dark:border-stone-855 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-stone-400 block font-semibold text-[10px] uppercase font-sans">रसीद संख्या (Receipt #)</span>
                    <span className="font-mono font-extrabold text-stone-800 dark:text-stone-200">
                      REC-MSS-{selectedReceiptItem.id.toUpperCase().replace('ITEM-', '952')}
                    </span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-stone-400 block font-semibold text-[10px] uppercase font-sans">भुगतान तिथि (Payment Date)</span>
                    <span className="font-mono font-bold text-stone-700 dark:text-stone-305">
                      {selectedReceiptItem.paymentDate || selectedReceiptItem.dueDate || selectedReceiptItem.createdAt}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-stone-700 dark:text-stone-305">
                  <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-stone-850">
                    <span className="text-stone-400 font-semibold">अंशदान हेतु प्रविष्टि:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{selectedReceiptItem.description.split(' • ')[1] || selectedReceiptItem.description}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-stone-850">
                    <span className="text-stone-400 font-semibold">पंजीकृत बही प्रकार:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {selectedReceiptItem.eventType === 'Vivah' ? 'विवाह सहायता बही (Vivah)' : selectedReceiptItem.eventType === 'Momera' ? 'मोमेरा रस्म कूपन' : 'देवलोक निधन सहायता'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-stone-850">
                    <span className="text-stone-400 font-semibold">सदस्य नाम प्रविष्टि:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">पंजीकृत मालाणी सदस्य (MSS1430)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-stone-850">
                    <span className="text-stone-400 font-semibold">सुरक्षा सुरक्षा स्तर:</span>
                    <span className="font-bold text-green-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Ledger Record
                    </span>
                  </div>
                </div>

                {/* Aesthetic Seal / barcode representation */}
                <div className="py-2.5 flex items-center justify-between text-stone-400 pt-4 border-t border-dashed border-stone-200 dark:border-stone-800 shrink-0">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-bold block text-left">TRUST DIGITAL SEAL</span>
                    <div className="flex gap-0.5 select-none" aria-hidden="true">
                      {/* BARCODE DESIGN */}
                      <span className="w-0.5 h-6 bg-stone-400 shrink-0" />
                      <span className="w-1 h-6 bg-stone-400 shrink-0" />
                      <span className="w-0.5 h-6 bg-stone-400 shrink-0" />
                      <span className="w-1.5 h-6 bg-stone-400 shrink-0" />
                      <span className="w-0.5 h-6 bg-stone-400 shrink-0" />
                      <span className="w-1.5 h-6 bg-stone-300 shrink-0" />
                      <span className="w-0.5 h-6 bg-stone-400 shrink-0" />
                      <span className="w-2 h-6 bg-stone-400 shrink-0" />
                      <span className="w-0.5 h-6 bg-stone-400 shrink-0" />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20 uppercase tracking-widest inline-block font-sans">
                      PAID / चुकता
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert("यह रसीद आपके स्थानीय डिवाइस में कूपन के रूप में डाउनलोड की जा चुकी है! (Simulation success)");
                    }}
                    className="w-1/2 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Download className="w-4 h-4 text-stone-500" />
                    कूपन डाउनलोड
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="w-1/2 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.613 0-1.11-.474-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-14.326 0C3.768 7.28 3 8.213 3 9.294v6.456a2.25 2.25 0 002.25 2.25h1.091M9 10.125h6" />
                    </svg>
                    प्रिंट रसीद
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple internal Info Icon used only for Netbanking alert banner
function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={props.className}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.085 1.085l-.041.02m-2.203-2.196L11.161 7.2h2.24m0 10.5h-5.25" />
    </svg>
  );
}
