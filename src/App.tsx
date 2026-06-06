import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  signIn, 
  logOut 
} from './firebase';

import { 
  SansthaClaim,
  LedgerItem,
  SansthaProfile
} from './types';

// Importing custom components
import Rulebook from './components/Rulebook';
import BenefitCalculator from './components/BenefitCalculator';
import MembershipCard from './components/MembershipCard';
import ClaimsForm from './components/ClaimsForm';
import LedgerBook from './components/LedgerBook';
import AiAdvisor from './components/AiAdvisor';
import MemberDirectory from './components/MemberDirectory';
import DuesDashboard from './components/DuesDashboard';

import { 
  Plus, 
  Search, 
  Filter, 
  Link as LinkIcon, 
  LogOut, 
  Users, 
  Star, 
  ChevronRight, 
  ChefHat, 
  X, 
  Loader2,
  Trash2,
  Edit2,
  Clock,
  Utensils,
  AlertCircle,
  Soup,
  Sparkles,
  Sun,
  Moon,
  IdCard,
  FileText,
  BookOpen,
  Calculator,
  Coins,
  ShieldCheck,
  ShieldAlert,
  Bot,
  TrendingUp
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Initial default ledger items
const INITIAL_LEDGER: LedgerItem[] = [
  {
    id: 'item-1',
    eventType: 'Vivah',
    description: 'विवाह घोषणा • रामदेव देवसी की सुपुत्री विवाह पूल अंशदान',
    duesAmount: 300,
    createdAt: new Date().toLocaleDateString(),
    isPaid: true,
    dueDate: '2026-05-10',
    paymentDate: '2026-05-10'
  },
  {
    id: 'item-2',
    eventType: 'Momera',
    description: 'मोमेरा घोषणा • मोहन चौधरी भांजा मायरा पूल अंशदान',
    duesAmount: 200,
    createdAt: new Date().toLocaleDateString(),
    isPaid: true,
    dueDate: '2026-05-18',
    paymentDate: '2026-05-18'
  },
  {
    id: 'item-3',
    eventType: 'Death',
    description: 'देवलोक गमन सूचना • लक्ष्मी देवी स्वर्गवास सहायता योगदान',
    duesAmount: 200,
    createdAt: new Date().toLocaleDateString(),
    isPaid: false,
    dueDate: '2026-05-28'
  },
  {
    id: 'item-4',
    eventType: 'Vivah',
    description: 'विवाह घोषणा • सुरेश पटेल शादी समाज महादान अंशदान',
    duesAmount: 300,
    createdAt: new Date().toLocaleDateString(),
    isPaid: false,
    dueDate: '2026-06-01'
  },
  {
    id: 'item-5',
    eventType: 'Momera',
    description: 'मोमेरा घोषणा • राजेश व्यास परिवार मांगलिक रस्म अनुभाग अंशदान',
    duesAmount: 200,
    createdAt: new Date().toLocaleDateString(),
    isPaid: false,
    dueDate: '2026-06-03'
  }
];

// Initial default claims list
const INITIAL_CLAIMS: SansthaClaim[] = [
  {
    applicantName: "सुनीता देवसी (सुपुत्री)",
    membershipId: "MSS1430",
    claimType: 'Vivah',
    eventDate: "2026-11-15",
    details: "बड़ी सुपुत्री कन्या विवाह सहायता अनुदान आवंटन।",
    status: 'Approved',
    submittedAt: "10-May-2026",
    refNumber: "CLM-834210",
    userId: "session-user"
  },
  {
    applicantName: "पवन देवसी (भांजा)",
    membershipId: "MSS1430",
    claimType: 'Momera',
    eventDate: "2026-12-05",
    details: "ससुरारी पक्ष शादी विवाह मायरा रस्म सामाजिक पूल सहायता।",
    status: 'Pending',
    submittedAt: "01-Jun-2026",
    refNumber: "CLM-901452",
    userId: "session-user"
  }
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'calculator' | 'card' | 'claims' | 'ledger' | 'advisor' | 'directory' | 'report'>('dashboard');
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Theme Sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Integrated User State
  const [sansthaProfile, setSansthaProfile] = useState<SansthaProfile>({
    uid: '',
    displayName: 'Anonymous Member',
    membershipId: 'MSS1430',
    fatherName: 'गणपत देवसी बिठुजा',
    phone: '+91 98765 43210',
    email: 'statuslovey@gmail.com',
    isStudent: true,
    unpaidInstallments: 3,
    eligibilityChecked: true,
    joinedAt: '01-Jan-2026'
  });

  // Avatar profile URL
  const [avatarUrl, setAvatarUrl] = useState<string>("https://images.unsplash.com/photo-150705211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200");

  // Ledger items state
  const [ledgerItems, setLedgerItems] = useState<LedgerItem[]>(() => {
    const cached = localStorage.getItem('mss_ledger');
    return cached ? JSON.parse(cached) : INITIAL_LEDGER;
  });

  // Claims items state
  const [claimsList, setClaimsList] = useState<SansthaClaim[]>(() => {
    const cached = localStorage.getItem('mss_claims');
    return cached ? JSON.parse(cached) : INITIAL_CLAIMS;
  });

  // Cache data locally upon changes
  useEffect(() => {
    localStorage.setItem('mss_ledger', JSON.stringify(ledgerItems));
  }, [ledgerItems]);

  useEffect(() => {
    localStorage.setItem('mss_claims', JSON.stringify(claimsList));
  }, [claimsList]);

  // Handle pay actions from Ledger
  const handlePayDues = async (itemId: string) => {
    const updated = ledgerItems.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          isPaid: true, 
          paymentDate: new Date().toLocaleDateString('hi-IN') || new Date().toLocaleDateString()
        };
      }
      return item;
    });
    setLedgerItems(updated);

    // Dynamic dues decrement
    const unpaidLeft = updated.filter(item => !item.isPaid).length;
    
    setSansthaProfile(prev => {
      const p = { ...prev, unpaidInstallments: unpaidLeft };
      
      // Sync seamlessly to Firestore if user logged in
      if (user) {
        setDoc(doc(db, 'users', user.uid), {
          ...p,
          avatarUrl,
          claimsList,
          ledgerItems: updated
        }, { merge: true }).catch(err => {
          console.error("Firestore sync fail on pay dues:", err);
        });
      }
      return p;
    });
  };

  // Handle custom community declarations (add a due)
  const handleDeclareEvent = (type: 'Vivah' | 'Momera' | 'Death', desc: string) => {
    const dueCost = type === 'Vivah' ? 300 : 200;
    const newItem: LedgerItem = {
      id: 'item-' + Math.floor(100000 + Math.random() * 900000),
      eventType: type,
      description: desc,
      duesAmount: dueCost,
      createdAt: new Date().toLocaleDateString(),
      isPaid: false,
      dueDate: new Date().toISOString().split('T')[0]
    };

    const updatedLedger = [newItem, ...ledgerItems];
    setLedgerItems(updatedLedger);

    const unpaidCountTemp = updatedLedger.filter(item => !item.isPaid).length;
    setSansthaProfile(prev => {
      const p = { ...prev, unpaidInstallments: unpaidCountTemp };
      
      if (user) {
        setDoc(doc(db, 'users', user.uid), {
          ...p,
          avatarUrl,
          claimsList,
          ledgerItems: updatedLedger
        }, { merge: true }).catch(err => {
          console.error("Firestore sync fail on declare event:", err);
        });
      }
      return p;
    });
  };

  // Handle add claims
  const handleAddClaim = (newClaim: Partial<SansthaClaim>) => {
    const claimObj = newClaim as SansthaClaim;
    const updatedClaims = [claimObj, ...claimsList];
    setClaimsList(updatedClaims);

    if (user) {
      setDoc(doc(db, 'users', user.uid), {
        claimsList: updatedClaims
      }, { merge: true }).catch(err => {
        console.error("Firestore sync fail on add claim:", err);
      });
    }
  };

  // Handle custom avatar change
  const handleUpdateAvatar = (newUrl: string) => {
    setAvatarUrl(newUrl);
    if (user) {
      setDoc(doc(db, 'users', user.uid), {
        avatarUrl: newUrl
      }, { merge: true }).catch(err => {
        console.error("Firestore sync fail on avatar:", err);
      });
    }
  };

  // Sign-in Listeners from Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Authenticated. Check and fetch/hydrate user profiles safely from Firestore
        try {
          const userDocRef = doc(db, 'users', u.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Sync states from Database if found
            if (data.membershipId) {
              setSansthaProfile({
                uid: u.uid,
                displayName: data.displayName || u.displayName || 'Anonymous Member',
                membershipId: data.membershipId || 'MSS1430',
                fatherName: data.fatherName || 'गणपत देवसी बिठुजा',
                phone: data.phone || '+91 98765 43210',
                email: u.email || 'statuslovey@gmail.com',
                isStudent: data.isStudent !== undefined ? data.isStudent : true,
                unpaidInstallments: data.unpaidInstallments !== undefined ? data.unpaidInstallments : 3,
                eligibilityChecked: data.eligibilityChecked !== undefined ? data.eligibilityChecked : true,
                joinedAt: data.joinedAt || '01-Jan-2026'
              });
            } else {
              // Creating profiles template within user doc for persistence
              const initialData = {
                uid: u.uid,
                displayName: u.displayName || 'मालणी सदस्य',
                membershipId: 'MSS1430',
                fatherName: 'गणपत देवसी बिठुजा',
                phone: '+91 98765 43210',
                email: u.email || 'statuslovey@gmail.com',
                isStudent: true,
                unpaidInstallments: 3,
                eligibilityChecked: true,
                joinedAt: '01-Jan-2026'
              };
              await setDoc(userDocRef, initialData, { merge: true });
              setSansthaProfile(initialData);
            }

            if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
            if (data.ledgerItems) setLedgerItems(data.ledgerItems);
            if (data.claimsList) setClaimsList(data.claimsList);

          } else {
            // First time auth. Create database profiles document with merge block
            const initialData = {
              uid: u.uid,
              displayName: u.displayName || 'मालणी सदस्य',
              membershipId: 'MSS1430',
              fatherName: 'गणपत देवसी बिठुजा',
              phone: '+91 98765 43210',
              email: u.email || 'statuslovey@gmail.com',
              isStudent: true,
              unpaidInstallments: 3,
              eligibilityChecked: true,
              joinedAt: '01-Jan-2026'
            };
            await setDoc(userDocRef, initialData, { merge: true });
            setSansthaProfile(initialData);
          }
        } catch (err) {
          console.error("Firestore hydration error:", err);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync profile details manually
  const handleSaveProfileChanges = async (updatedFields: Partial<SansthaProfile>) => {
    setSansthaProfile(prev => {
      const p = { ...prev, ...updatedFields };
      if (user) {
        setDoc(doc(db, 'users', user.uid), p, { merge: true }).catch(err => {
          console.error("Firestore sync profile change failed:", err);
        });
      }
      return p;
    });
  };

  // Summary figures
  const unpaidCount = ledgerItems.filter(item => !item.isPaid).length;
  const totalDuesAmount = ledgerItems
    .filter(item => !item.isPaid)
    .reduce((sum, item) => sum + item.duesAmount, 0);

  // App loader
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#faf9f5] dark:bg-stone-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-700 mx-auto" />
          <p className="text-stone-500 font-serif font-semibold text-lg select-none">मालाणी सेवा संस्थान बही लोड हो रही है...</p>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-stone-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Subtle decorative elements for Rajasthani cultural heritage */}
        <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-amber-600 via-yellow-405 via-yellow-500 to-amber-900" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-amber-205/30 p-8 shadow-2xl relative z-10"
        >
          {/* Logo container with radiant gold aura */}
          <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[1.8rem] flex items-center justify-center mx-auto shadow-2xl rotate-3 relative">
            <div className="absolute inset-0.5 bg-gradient-to-br from-[#AA1E1E] to-[#55050C] rounded-[1.6rem] flex items-center justify-center">
              <span className="font-serif font-black text-3xl text-amber-100 flex items-center justify-center">म</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-serif font-bold text-amber-950 dark:text-amber-100 tracking-tight leading-tight">
              मालाणी सेवा संस्थान
            </h1>
            <p className="text-stone-400 font-serif font-bold tracking-widest text-xs uppercase">
              Bithuja Community Portal
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed pt-2">
              पारिवारिक सदस्यता बही, कन्या विवाह अनुदान (Vivah), मोमेरा (Momera) सहायता योजना, एवं डिजिटल स्वर्ण पहचान पत्र प्रबंधन प्रणाली।
            </p>
          </div>

          <button 
            type="button"
            onClick={signIn} 
            className="w-full py-4 bg-amber-800 text-white hover:bg-amber-900 rounded-full text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            Google खाते से लॉगिन करें (Sign In)
          </button>

          <p className="text-[10px] text-stone-400 font-medium">
            ।। सहकारिता और सहयोग ही समाज की वास्तविक सुरक्षा और समृद्धि है ।।
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] dark:bg-stone-950 text-stone-850 dark:text-stone-100 font-sans pb-16 transition-colors duration-300">
      
      {/* Decorative Traditional Head Ribbon */}
      <div className="h-2.5 bg-gradient-to-r from-amber-600 via-amber-400 to-red-900 border-b border-amber-100/10" />

      {/* Main Core Header */}
      <header className="sticky top-0 z-30 bg-[#FCFBF7]/90 dark:bg-stone-950/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-light-amber/20 dark:border-stone-850">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-700 dark:bg-amber-550 rounded-xl flex items-center justify-center shadow-lg -rotate-6">
            <span className="font-serif font-black text-amber-50 text-xl">म</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-amber-950 dark:text-amber-50 block leading-none">
              मालाणी सेवा संस्थान
            </h1>
            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-stone-400 dark:text-stone-500 block text-left">
              Bithuja, Rajasthan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button 
            type="button"
            onClick={() => setIsDarkMode(prev => !prev)}
            className="p-2.5 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-full transition-colors text-stone-500 dark:text-stone-400 h-10 w-10 flex items-center justify-center flex-shrink-0"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-amber-800" />}
          </button>

          {/* Quick status button */}
          <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono border ${
            unpaidCount >= 3 
              ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20' 
              : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/25'
          }`}>
            <span className={`w-2 h-2 rounded-full ${unpaidCount >= 3 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            {unpaidCount >= 3 ? 'restricted' : 'active'} ID: {sansthaProfile.membershipId}
          </span>

          {/* Profile controls and Log out */}
          <div className="flex items-center gap-3 pl-3 border-l border-amber-900/10 dark:border-stone-850">
            <img 
              src={avatarUrl} 
              referrerPolicy="no-referrer" 
              className="w-8 h-8 rounded-full border border-amber-500" 
              alt="Profile" 
            />
            <button 
              onClick={logOut} 
              className="p-2.5 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-full transition-colors h-10 w-10 flex items-center justify-center text-stone-400 hover:text-stone-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 text-left">
        
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-amber-900/10 to-red-900/5 dark:from-stone-905/30 border border-amber-950/5 dark:border-stone-900 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest font-mono">
              ।। श्री गणेशाय नमः ।।
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-amber-950 dark:text-amber-50 leading-none">
              स्वागत है सा, {user.displayName?.split(' ')[0] || 'सदस्य'}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
              <span className="font-semibold block sm:inline">आईडी: {sansthaProfile.membershipId}</span>
              <span className="font-semibold block sm:inline">पिता का नाम: {sansthaProfile.fatherName}</span>
              <span className="font-semibold block sm:inline">ड्यू बकाया: ₹{totalDuesAmount} ({unpaidCount} बही)</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <button
              onClick={() => setSelectedTab('claims')}
              className="px-4 py-2.5 rounded-full bg-amber-800 hover:bg-amber-900 text-white transition-all shadow-md leading-none"
            >
              अनुदान आवेदन
            </button>
            <button
              onClick={() => setSelectedTab('ledger')}
              className="px-4 py-2.5 rounded-full border border-stone-250 bg-white hover:bg-stone-50 text-stone-700 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300 transition-all leading-none"
            >
              देय राशियाँ (₹{totalDuesAmount})
            </button>
          </div>
        </section>

        {/* Dynamic Warning Notice if unpaid dues >= 3 */}
        {unpaidCount >= 3 && (
          <div className="bg-rose-50 border border-rose-220 p-5 rounded-2xl flex gap-3 text-left items-start dark:bg-rose-950/20 dark:border-rose-900/40">
            <AlertCircle className="w-5.5 h-5.5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-rose-800 dark:text-rose-400">
              <h4 className="font-serif font-black text-base">नियम 4 प्रतिबंध - ग्रेस अवधि निलंबित (Grace Period Suspended)</h4>
              <p className="text-xs sm:text-sm">
                आपके खाते में <strong>{unpaidCount} सामाजिक किस्त बही</strong> भुगतान लंबित हैं। समाज संविधान के अनुसार 3 या अधिक बकाया होने पर आपकी सदस्यता अधिकार सीमित कर दिए गए हैं एवं समस्त नए अनुदान दावे अमान्य घोषित रहेंगे। कृपया देयता दूर करने के लिए देय बही से चुकता करें।
              </p>
            </div>
          </div>
        )}

        {/* Tab Selection Row */}
        <section className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-amber-900/10 dark:border-stone-850">
          {[
            { id: 'dashboard', label: 'मार्गदर्शन व नियम', icon: BookOpen },
            { id: 'directory', label: 'सदस्य निर्देशिका', icon: Users },
            { id: 'calculator', label: 'अनुदान कैलकुलेटर', icon: Calculator },
            { id: 'claims', label: 'सहायता आवेदन (आवेदन)', icon: FileText },
            { id: 'card', label: 'स्वर्ण पहचान पत्र (ID)', icon: IdCard },
            { id: 'ledger', label: 'बही-खाता (Ledger)', icon: Coins },
            { id: 'report', label: 'वार्षिक रिपोर्ट (Report)', icon: TrendingUp },
            { id: 'advisor', label: 'एआई सलाहकार', icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={cn(
                  "px-5 py-4 rounded-t-2xl whitespace-nowrap font-bold text-sm transition-all flex items-center gap-2 border-b-2",
                  isActive 
                    ? "text-amber-800 border-amber-700 dark:text-amber-400 dark:border-amber-500 bg-amber-500/5" 
                    : "text-stone-500 border-transparent hover:text-stone-800 dark:hover:text-stone-200"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </section>

        {/* Live Active Content Section */}
        <section className="min-h-[400px] bg-white/40 dark:bg-stone-900/20 rounded-3xl pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {selectedTab === 'dashboard' && <Rulebook />}
              
              {selectedTab === 'directory' && (
                <MemberDirectory 
                  currentProfile={sansthaProfile}
                  currentAvatarUrl={avatarUrl}
                />
              )}
              
              {selectedTab === 'calculator' && <BenefitCalculator />}
              
              {selectedTab === 'claims' && (
                <ClaimsForm 
                  unpaidCount={unpaidCount} 
                  claims={claimsList} 
                  onAddClaim={handleAddClaim} 
                />
              )}
              
              {selectedTab === 'card' && (
                <MembershipCard 
                  profile={sansthaProfile} 
                  avatarUrl={avatarUrl} 
                  onUpdateAvatar={handleUpdateAvatar} 
                />
              )}
              
              {selectedTab === 'ledger' && (
                <LedgerBook 
                  ledger={ledgerItems} 
                  unpaidCount={unpaidCount} 
                  totalDuesAmount={totalDuesAmount} 
                  onPayDues={handlePayDues} 
                  onDeclareEvent={handleDeclareEvent} 
                />
              )}

              {selectedTab === 'report' && (
                <DuesDashboard 
                  ledger={ledgerItems} 
                  profile={sansthaProfile} 
                />
              )}

              {selectedTab === 'advisor' && (
                <AiAdvisor 
                  profile={{
                    displayName: user.displayName || 'सदस्य',
                    membershipId: sansthaProfile.membershipId,
                    unpaidInstallments: unpaidCount,
                    duesAmount: totalDuesAmount,
                    isStudent: sansthaProfile.isStudent
                  }} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </section>

      </main>

      {/* Footer Branding line */}
      <footer className="text-center text-stone-400 dark:text-stone-500 text-xs py-6 border-t border-amber-900/10 dark:border-stone-850 select-none">
        <p>© 2026 मालाणी सेवा संस्थान बिठुजा। सभी अधिकार सुरक्षित हैं।</p>
        <p className="mt-1 font-serif italic text-[10px]">।। परोपकाराय पुण्याय पापाय परपीडनम् ।।</p>
      </footer>
    </div>
  );
}
