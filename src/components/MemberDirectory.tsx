import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  GraduationCap, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  ChevronRight,
  Info,
  X,
  Sparkles,
  QrCode,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { SansthaProfile } from '../types';

interface MemberDirectoryProps {
  currentProfile: SansthaProfile;
  currentAvatarUrl: string;
}

// Highly detailed realistic default members of the Malani Seva Sanstha community
const DEFAULT_MEMBERS: SansthaProfile[] = [
  {
    uid: 'mock-1',
    displayName: 'कैलाश कुमार प्रजापत',
    membershipId: 'MSS1002',
    fatherName: 'नेनाराम प्रजापत जसोल',
    phone: '+91 94142 56832',
    email: 'kailash.jasol@gmail.com',
    isStudent: false,
    unpaidInstallments: 0,
    eligibilityChecked: true,
    joinedAt: '12-Jan-2026'
  },
  {
    uid: 'mock-2',
    displayName: 'मदन लाल माली',
    membershipId: 'MSS1015',
    fatherName: 'किशनाराम माली बिठुजा',
    phone: '+91 97855 41258',
    email: 'madan.mali@yahoo.com',
    isStudent: false,
    unpaidInstallments: 1,
    eligibilityChecked: true,
    joinedAt: '18-Jan-2026'
  },
  {
    uid: 'mock-3',
    displayName: 'सुरेश देवासी (विद्यार्थी)',
    membershipId: 'MSS1050',
    fatherName: 'सदाराम देवासी बालोतरा',
    phone: '+91 90016 11452',
    email: 'suresh.student@outlook.com',
    isStudent: true,
    unpaidInstallments: 4,
    eligibilityChecked: false,
    joinedAt: '03-Feb-2026'
  },
  {
    uid: 'mock-4',
    displayName: 'पारस प्रजापत',
    membershipId: 'MSS1085',
    fatherName: 'मोहनलाल प्रजापत जसोल',
    phone: '+91 80059 95831',
    email: 'paras.prajapat@gmail.com',
    isStudent: false,
    unpaidInstallments: 0,
    eligibilityChecked: true,
    joinedAt: '20-Feb-2026'
  },
  {
    uid: 'mock-5',
    displayName: 'हरीश माली (विद्यार्थी)',
    membershipId: 'MSS1120',
    fatherName: 'गोविन्दराम माली बिठुजा',
    phone: '+91 63753 27684',
    email: 'harish.study@gmail.com',
    isStudent: true,
    unpaidInstallments: 0,
    eligibilityChecked: true,
    joinedAt: '02-Mar-2026'
  },
  {
    uid: 'mock-6',
    displayName: 'अशोक देवासी',
    membershipId: 'MSS1199',
    fatherName: 'राजाराम देवासी सिणधरी',
    phone: '+91 90247 60815',
    email: 'ashok.sinhari@gmail.com',
    isStudent: false,
    unpaidInstallments: 3,
    eligibilityChecked: true,
    joinedAt: '15-Mar-2026'
  },
  {
    uid: 'mock-7',
    displayName: 'दिनेश कुमार प्रजापत',
    membershipId: 'MSS1250',
    fatherName: 'भंवरलाल प्रजापत बालोतरा',
    phone: '+91 96102 34567',
    email: 'dinesh.balotra@gmail.com',
    isStudent: true,
    unpaidInstallments: 2,
    eligibilityChecked: true,
    joinedAt: '01-Apr-2026'
  },
  {
    uid: 'mock-8',
    displayName: 'कमला कुमारी माली',
    membershipId: 'MSS1340',
    fatherName: 'रामलाल माली बिठुजा',
    phone: '+91 95493 88776',
    email: 'kamla.mali@gmail.com',
    isStudent: true,
    unpaidInstallments: 0,
    eligibilityChecked: true,
    joinedAt: '14-Apr-2026'
  }
];

export default function MemberDirectory({ currentProfile, currentAvatarUrl }: MemberDirectoryProps) {
  const [members, setMembers] = useState<SansthaProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'restricted' | 'student' | 'non-student'>('all');
  const [villageFilter, setVillageFilter] = useState<string>('all');
  const [loadingFirestore, setLoadingFirestore] = useState(false);
  const [selectedMember, setSelectedMember] = useState<SansthaProfile | null>(null);

  const isAdmin = currentProfile.email === 'statuslovey@gmail.com' || currentProfile.email === 'sodoom@google.com';
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newMemberData, setNewMemberData] = useState<Partial<SansthaProfile>>({
    displayName: '',
    membershipId: '',
    fatherName: '',
    phone: '',
    email: '',
    isStudent: false,
    unpaidInstallments: 0
  });

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberData.displayName || !newMemberData.membershipId) return;
    
    setIsAdding(true);
    try {
      const uid = 'admin-created-' + Date.now();
      const finalMember: SansthaProfile = {
        uid,
        displayName: newMemberData.displayName || '',
        membershipId: newMemberData.membershipId || '',
        fatherName: newMemberData.fatherName || '',
        phone: newMemberData.phone || '',
        email: newMemberData.email || '',
        isStudent: !!newMemberData.isStudent,
        unpaidInstallments: Number(newMemberData.unpaidInstallments) || 0,
        eligibilityChecked: true,
        joinedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      };
      
      await setDoc(doc(db, 'users', uid), finalMember);
      
      setMembers(prev => [finalMember, ...prev]);
      setShowAddForm(false);
      setNewMemberData({
        displayName: '',
        membershipId: '',
        fatherName: '',
        phone: '',
        email: '',
        isStudent: false,
        unpaidInstallments: 0
      });
    } catch (err) {
      console.error("Failed to add member", err);
      alert("Error adding member. Ensure you have admin permissions.");
    } finally {
      setIsAdding(false);
    }
  };

  // Load and merge members from Firestore with defaults
  useEffect(() => {
    async function loadMembers() {
      setLoadingFirestore(true);
      try {
        let firestoreList: SansthaProfile[] = [];
        import('../firebase').then(async ({ auth }) => {
            if (auth.currentUser) {
                const querySnapshot = await getDocs(collection(db, 'users'));
                querySnapshot.forEach((docSnap) => {
                  const data = docSnap.data() as SansthaProfile;
                  if (data && data.membershipId && data.uid !== currentProfile.uid) {
                    firestoreList.push({
                      uid: data.uid,
                      displayName: data.displayName || 'Unnamed Member',
                      membershipId: data.membershipId,
                      fatherName: data.fatherName || 'मालणी सदस्य',
                      phone: data.phone || '+91 99999 99999',
                      email: data.email || '',
                      isStudent: !!data.isStudent,
                      unpaidInstallments: data.unpaidInstallments !== undefined ? data.unpaidInstallments : 0,
                      eligibilityChecked: data.eligibilityChecked !== undefined ? data.eligibilityChecked : true,
                      joinedAt: data.joinedAt || '01-Jan-2026'
                    });
                  }
                });
            }

            // Dedup: filter mock items if a real firebase user has the same membership ID
            const finalMock = DEFAULT_MEMBERS.filter(
              mockMember => !firestoreList.some(f => f.membershipId === mockMember.membershipId)
            );

            // Include current user in the directory naturally!
            const selfInDirectory: SansthaProfile = {
              ...currentProfile,
              photoURL: currentAvatarUrl
            };

            setMembers([selfInDirectory, ...firestoreList, ...finalMock]);
            setLoadingFirestore(false);
        }).catch(err => {
            console.warn("Error loading firebase auth:", err);
            setMembers([currentProfile, ...DEFAULT_MEMBERS]);
            setLoadingFirestore(false);
        });

      } catch (err) {
        console.warn("Firestore directory load warn, falling back to cached/defaults:", err);
        // Fallback to current user + default mock list
        setMembers([currentProfile, ...DEFAULT_MEMBERS]);
        setLoadingFirestore(false);
      }
    }
    loadMembers();
  }, [currentProfile, currentAvatarUrl]);

  // Extract unique villages/निवास places from member names/fathers' names for filter dropdown
  const uniqueVillages = Array.from(new Set(
    members.map(m => {
      // Look for typical village keywords in fathers field or fatherName
      const fatherStr = m.fatherName || '';
      if (fatherStr.includes('बिठुजा')) return 'बिठुजा';
      if (fatherStr.includes('बालोतरा')) return 'बालोतरा';
      if (fatherStr.includes('जसोल')) return 'जसोल';
      if (fatherStr.includes('सिणधरी')) return 'सिणधरी';
      return '';
    }).filter(v => v !== '')
  ));

  // Determine eligibility status for card render
  const isMemberRestricted = (m: SansthaProfile) => {
    return (m.unpaidInstallments ?? 0) >= 3;
  };

  // Safe search normalization
  const normalizedQuery = searchQuery.toLowerCase().trim();

  // Filter members based on query & filters
  const filteredMembers = members.filter(member => {
    // 1. Search Query Match
    const nameMatch = member.displayName?.toLowerCase().includes(normalizedQuery);
    const idMatch = member.membershipId?.toLowerCase().includes(normalizedQuery);
    const fatherMatch = member.fatherName?.toLowerCase().includes(normalizedQuery);
    const phoneMatch = member.phone?.toLowerCase().includes(normalizedQuery);
    const matchesSearch = !normalizedQuery || nameMatch || idMatch || fatherMatch || phoneMatch;

    if (!matchesSearch) return false;

    // 2. Status Filter
    if (statusFilter === 'active' && isMemberRestricted(member)) return false;
    if (statusFilter === 'restricted' && !isMemberRestricted(member)) return false;
    if (statusFilter === 'student' && !member.isStudent) return false;
    if (statusFilter === 'non-student' && member.isStudent) return false;

    // 3. Village Filter
    if (villageFilter !== 'all') {
      const fatherStr = member.fatherName || '';
      const matchesVillage = fatherStr.includes(villageFilter);
      if (!matchesVillage) return false;
    }

    return true;
  });

  // Calculate Metrics from current filtered/unfiltered list
  const totalCount = members.length;
  const activeCount = members.filter(m => !isMemberRestricted(m)).length;
  const restrictedCount = members.filter(m => isMemberRestricted(m)).length;
  const studentCount = members.filter(m => m.isStudent).length;

  return (
    <div className="space-y-6">
      {/* Directory Title Panel */}
      <div className="bg-stone-50/55 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-850 p-6 rounded-3xl text-left shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 pb-1.5 pt-1.5 rounded-full bg-amber-500/10 text-amber-900 dark:text-amber-400 font-sans font-black text-[10px] tracking-widest uppercase">
              <Users className="w-3.5 h-3.5" /> सदस्य निर्देशिका • LIVE DIRECTORY
            </div>
            <h2 className="text-3xl font-serif font-black text-stone-900 dark:text-stone-50">
              मालाणी समाज सेवा संस्थान सदस्य डायरेक्टरी
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-sans flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              बिठुजा एवं आसपास के समस्त पंजीकृत सक्रिय समाज बन्धुओं की डिजिटल सूची
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-800 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-2xl font-bold leading-none">
            <UserCheck className="w-4 h-4 text-amber-700" />
            <span>कुल पंजीकृत: {totalCount} सदस्य</span>
          </div>
        </div>

        {/* Community Stat Summary Cards inside Title Block */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-stone-150 dark:border-stone-850">
          <div className="bg-white dark:bg-stone-950/40 border border-stone-150 dark:border-stone-850 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">कुल सदस्य (Total)</span>
            <span className="text-xl font-serif font-black text-stone-800 dark:text-stone-100">{totalCount}</span>
          </div>
          <div className="bg-white dark:bg-stone-950/40 border border-stone-150 dark:border-stone-850 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-stone-400 block text-emerald-600 dark:text-emerald-400">सक्रिय (Active)</span>
            <span className="text-xl font-serif font-black text-emerald-600 dark:text-emerald-400">{activeCount}</span>
          </div>
          <div className="bg-white dark:bg-stone-950/40 border border-stone-150 dark:border-stone-850 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-stone-400 block text-amber-600 dark:text-amber-500">विद्यार्थी (Students)</span>
            <span className="text-xl font-serif font-black text-amber-600 dark:text-amber-500">{studentCount}</span>
          </div>
          <div className="bg-white dark:bg-stone-950/40 border border-stone-150 dark:border-stone-850 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-stone-400 block text-red-600">सीमित/प्रतिबंधित (Dues D)</span>
            <span className="text-xl font-serif font-black text-red-600">{restrictedCount}</span>
          </div>
        </div>
      </div>

      {/* Admin Action: Add New Member Button */}
      {isAdmin && (
        <div className="flex justify-end pt-1">
          <button 
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm text-xs tracking-wide"
          >
            <UserPlus className="w-4 h-4" /> नया सदस्य जोड़ें (Add offline member)
          </button>
        </div>
      )}

      {/* Search and Filters Section */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Detailed Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              id="member-search-input"
              placeholder="नाम, आईडी (MSS...), पिता का नाम या मोबाइल नंबर से खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-stone-50 dark:bg-stone-955 border border-stone-250 dark:border-stone-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-550 focus:border-amber-550 dark:text-stone-100 placeholder:text-stone-400 transition-all font-sans font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                साफ़ करें
              </button>
            )}
          </div>

          {/* Village/Place selector */}
          <div className="w-full md:w-56">
            <div className="relative">
              <select
                id="member-village-select"
                value={villageFilter}
                onChange={(e) => setVillageFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-3.5 bg-stone-50 dark:bg-stone-955 border border-stone-250 dark:border-stone-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-550 focus:border-amber-550 dark:text-stone-100 font-sans font-bold appearance-none cursor-pointer"
              >
                <option value="all">📍 सभी निवास क्षेत्र (All Towns)</option>
                <option value="बिठुजा">बिठुजा (Bithuja)</option>
                <option value="बालोतरा">बालोतरा (Balotra)</option>
                <option value="जसोल">जसोल (Jasol)</option>
                <option value="सिणधरी">सिणधरी (Sindhari)</option>
                {uniqueVillages.map(v => (
                  !['बिठुजा', 'बालोतरा', 'जसोल', 'सिणधरी'].includes(v) && v && (
                    <option key={v} value={v}>{v}</option>
                  )
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick status tabs group */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase mr-1.5 tracking-wider">त्वरित फ़िल्टर:</span>
          {[
            { id: 'all', label: 'सभी सदस्य (All)', color: 'border-stone-200' },
            { id: 'active', label: 'सक्रिय (Active / No Dues)', color: 'text-emerald-700 bg-emerald-500/10' },
            { id: 'restricted', label: 'सीमित (Restricted/Dues)', color: 'text-rose-700 bg-rose-500/10' },
            { id: 'student', label: 'विद्यार्थी (Students)', color: 'text-blue-700 bg-blue-500/10' },
            { id: 'non-student', label: 'गैर-विद्यार्थी (Non-Students)', color: 'text-purple-700 bg-purple-500/10' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'bg-stone-50 dark:bg-stone-955 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-850'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loadingFirestore && (
        <div className="text-center py-6 text-stone-400 font-sans text-xs flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          नवीनतम लाइव सदस्यों का डेटा सिंक किया जा रहा है...
        </div>
      )}

      {/* Grid List representation */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member, idx) => {
            const isRestricted = isMemberRestricted(member);
            const isSelf = member.uid === currentProfile.uid;

            return (
              <motion.div
                key={member.uid || idx}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-[1.6rem] overflow-hidden hover:border-amber-500/20 active:scale-[0.99] transition-all duration-200 shadow-sm flex flex-col text-left group"
              >
                {/* Micro Header with Status Badges and ID */}
                <div className="p-4 pb-3 border-b border-stone-100 dark:border-stone-855 flex items-center justify-between">
                  {/* Membership ID and Self indicator */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono bg-stone-50 dark:bg-stone-955 px-2.5 py-1 rounded-lg text-stone-600 dark:text-stone-400 font-extrabold text-[11px] border border-stone-150 dark:border-stone-800">
                      {member.membershipId}
                    </span>
                    {isSelf && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-800 dark:text-amber-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wide">
                        स्वयं (YOU)
                      </span>
                    )}
                  </div>

                  {/* Operational Status Badges */}
                  <div className="flex items-center gap-1">
                    {/* Student Status Badge */}
                    {member.isStudent && (
                      <span className="p-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400" title="विद्यार्थी सदस्य (Student Member)">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </span>
                    )}

                    {/* Eligibility Status Ribbon */}
                    {isRestricted ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 rounded-full text-[9px] font-black uppercase tracking-wide flex items-center gap-1.5 border border-red-500/10">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        सीमित
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-wide flex items-center gap-1.5 border border-emerald-500/10">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        सक्रिय
                      </span>
                    )}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-4 flex-1 flex gap-3">
                  {/* Photo or Initials block */}
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-stone-150 dark:border-stone-800 shrink-0 overflow-hidden flex items-center justify-center relative select-none">
                    {member.photoURL ? (
                      <img
                        src={member.photoURL}
                        alt={member.displayName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-serif font-black text-amber-800 dark:text-amber-400 text-base">
                        {member.displayName?.charAt(0) || 'म'}
                      </span>
                    )}
                  </div>

                  {/* Core details lines */}
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-serif font-black text-sm text-stone-900 dark:text-stone-50 truncate leading-none">
                      {member.displayName}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate">
                      पिता: {member.fatherName}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-stone-400 pt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Phone className="w-2.5 h-2.5 shrink-0" />
                        {member.phone ? member.phone.replace(/(\+91\s)/g, '') : 'N/A'}
                      </span>
                      {member.unpaidInstallments !== undefined && (
                        <span className={`font-semibold ${isRestricted ? 'text-red-500 font-bold' : 'text-stone-400'}`}>
                          बकाया: {member.unpaidInstallments} बही
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card CTA block - digital credential card look */}
                <div className="px-4 py-2 bg-stone-50 dark:bg-stone-955 border-t border-stone-100 dark:border-stone-855 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    className="text-[10px] font-black text-amber-850 dark:text-amber-400 uppercase tracking-widest hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    विवरण कार्ड देखें <ChevronRight className="w-3 h-3 text-amber-700" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center space-y-4">
          <Info className="w-10 h-10 text-stone-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-serif font-black text-lg text-stone-800 dark:text-stone-200">
              कोई मिलान सदस्य नहीं मिला (No Results Found)
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
              आपके द्वारा खोजे गए शब्द या चुने गए फ़िल्टर मानदंडों के साथ मालाणी समाज की बही में कोई भी सदस्य पंजीकृत नहीं मिल पाया है। कृपया खोज शब्द बदलें।
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setVillageFilter('all');
            }}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 rounded-xl text-xs font-bold transition-all text-stone-700 dark:text-stone-300"
          >
            सभी फ़िल्टर साफ़ करें
          </button>
        </div>
      )}

      {/* Member Identity Credential Gold Modal Sheet */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm"
            />

            {/* Modal Sheet Window - Gorgeous traditional styled gold card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-[#FCFBF7] dark:bg-stone-900 rounded-[2.5rem] border border-amber-500/20 shadow-2xl relative z-10 w-full max-w-md overflow-hidden"
            >
              {/* Top Rajasthani Saffron ribbon */}
              <div className="h-2.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-red-900" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 text-left space-y-6">
                {/* Badge Header info */}
                <div className="text-center space-y-2 pt-4">
                  <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-400 px-3 py-1.5 pb-2 pt-2 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" /> मालाणी समाज डिजिटल कार्ड
                  </div>
                  <h3 className="text-2xl font-serif font-black text-stone-900 dark:text-stone-100">
                    {selectedMember.displayName}
                  </h3>
                  <span className="font-mono bg-stone-100 dark:bg-stone-955 px-3 py-1 text-stone-600 dark:text-stone-300 rounded-lg text-xs font-black border border-stone-200 dark:border-stone-800">
                    {selectedMember.membershipId}
                  </span>
                </div>

                {/* Identity Golden Card block */}
                <div className="metallic-gold-card relative overflow-hidden bg-gradient-to-br from-amber-500 via-[#d1a12e] to-amber-700 text-[#301600] rounded-3xl p-5 shadow-lg border border-yellow-200/20">
                  {/* Subtle traditional aura */}
                  <div className="absolute inset-0 bg-radial-gradient opacity-10 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-serif font-bold text-xs uppercase tracking-widest text-amber-900/80 leading-none">मालाणी सेवा संस्थान</h5>
                        <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-amber-950/70 whitespace-nowrap pt-1">REGISTERED ID CARD</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isMemberRestricted(selectedMember) 
                          ? 'bg-[#AA1E1E] text-white' 
                          : 'bg-[#0f5132] text-emerald-100'
                      }`}>
                        {isMemberRestricted(selectedMember) ? 'RESTRICTED' : 'ACTIVE'}
                      </span>
                    </div>

                    {/* Member data section */}
                    <div className="grid grid-cols-12 gap-3 pt-2">
                      <div className="col-span-8 space-y-2 text-xs">
                        <div>
                          <span className="text-[9px] leading-none text-amber-950/60 uppercase font-black block">सदस्य का नाम (Member)</span>
                          <span className="font-bold text-[13px]">{selectedMember.displayName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] leading-none text-amber-950/60 uppercase font-black block">पिता का नाम (Father)</span>
                          <span className="font-bold">{selectedMember.fatherName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] leading-none text-amber-950/60 uppercase font-black block">मोबाइल (Phone)</span>
                            <span className="font-mono font-bold text-[11px]">{selectedMember.phone?.replace(/(\+91\s)/g, '') || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] leading-none text-amber-950/60 uppercase font-black block">शामिल तिथि (Joined)</span>
                            <span className="font-mono font-bold text-[11px]">{selectedMember.joinedAt || '2026'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-4 flex flex-col justify-between items-center bg-[#FCFBF7]/10 p-1.5 rounded-2xl border border-[#FCFBF7]/20">
                        {/* Member photo space */}
                        <div className="w-14 h-14 bg-[#FCFBF7] rounded-xl border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                          {selectedMember.photoURL ? (
                            <img
                              src={selectedMember.photoURL}
                              alt={selectedMember.displayName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-serif font-black text-amber-800 text-lg">
                              {(selectedMember.displayName || 'म').charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="inline-flex items-center gap-0.5 mt-1">
                          <QrCode className="w-6 h-6 text-amber-950/80" />
                          <span className="text-[7px] font-black uppercase text-amber-950/70 block tracking-tight leading-none">APPROVED<br />MSS DIGITAL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Detailed stats list in modal */}
                <div className="bg-stone-50 dark:bg-stone-955 border border-stone-150 dark:border-stone-850 rounded-2xl p-4 text-xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-500">ईमेल (Email ID):</span>
                    <span className="font-medium text-stone-800 dark:text-stone-200 select-all font-mono">
                      {selectedMember.email || 'अघोषित'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-500">अनपेड किश्तें (Unpaid Installments):</span>
                    <span className={`font-black ${isMemberRestricted(selectedMember) ? 'text-red-500' : 'text-stone-800 dark:text-stone-200'}`}>
                      {selectedMember.unpaidInstallments} बही (किश्त)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-500">छात्र सदस्यता (Student Status):</span>
                    <span className="font-extrabold text-stone-800 dark:text-stone-200">
                      {selectedMember.isStudent ? 'हाँ (Student Benefits Active)' : 'नहीं (General Profile)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-500">पात्रता जांच (Eligibility Audited):</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      selectedMember.eligibilityChecked 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30'
                    }`}>
                      {selectedMember.eligibilityChecked ? 'वेरिफाइड (Verified)' : 'पेंडिंग (Pending Verification)'}
                    </span>
                  </div>
                </div>

                {/* Rule Warning/Notice for active vs. restricted */}
                {isMemberRestricted(selectedMember) ? (
                  <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-2xl text-[11px] text-red-700 dark:text-red-400 leading-relaxed text-left flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>नियम 4 प्रतिबंध:</strong> इस सदस्य के खाते में 3 या अधिक सामाजिक किस्तें बकाया हैं। संविधान के अनुसार सहायता योजना के दावे तब तक अमान्य रहेंगे जब तक पूर्व बही का समाधान नहीं किया जाता।
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed text-left flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      इस सदस्य की साख एवं समस्त सहायता किश्ते समय पर अदायगी द्वारा सुदृढ़ हैं। ये सदस्य संस्थान के समस्त विवाह व बुजुर्ग कल्याणकारी सहायता दावों के लिए पूर्ण रूप से पात्र हैं।
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Offline Member Form Modal */}
      <AnimatePresence>
        {showAddForm && isAdmin && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-xl relative z-10 w-full max-w-lg overflow-hidden"
            >
              <div className="h-2 bg-amber-600 w-full" />
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 md:p-8 space-y-6 text-left">
                <div className="space-y-1">
                  <h3 className="text-2xl font-serif font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-amber-600" />
                    नया सदस्य जोड़ें
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                    डिजिटल बही में नए ऑफलाइन सदस्य की प्रविष्टि करें।
                  </p>
                </div>

                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">सदस्य का नाम *</label>
                      <input
                        type="text"
                        required
                        value={newMemberData.displayName || ''}
                        onChange={(e) => setNewMemberData({ ...newMemberData, displayName: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">सदस्यता संख्या (ID) *</label>
                      <input
                        type="text"
                        required
                        value={newMemberData.membershipId || ''}
                        onChange={(e) => setNewMemberData({ ...newMemberData, membershipId: e.target.value })}
                        placeholder="MSS..."
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">पिता का नाम (निवास)</label>
                      <input
                        type="text"
                        value={newMemberData.fatherName || ''}
                        onChange={(e) => setNewMemberData({ ...newMemberData, fatherName: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">मोबाइल नंबर</label>
                      <input
                        type="text"
                        value={newMemberData.phone || ''}
                        onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                        placeholder="+91..."
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">अनपेड किश्तें (Dues count)</label>
                      <input
                        type="number"
                        min="0"
                        value={newMemberData.unpaidInstallments || 0}
                        onChange={(e) => setNewMemberData({ ...newMemberData, unpaidInstallments: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2 flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="isStudentCheckbox"
                        checked={newMemberData.isStudent || false}
                        onChange={(e) => setNewMemberData({ ...newMemberData, isStudent: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-stone-300"
                      />
                      <label htmlFor="isStudentCheckbox" className="text-sm font-bold text-stone-700 dark:text-stone-300">
                        यह सदस्य विद्यार्थी (Student) है
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-sm font-bold transition-all hover:bg-stone-50 dark:hover:bg-stone-800"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      disabled={isAdding}
                      className="px-6 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                    >
                      {isAdding ? 'सिंक हो रहा है...' : 'सुरक्षित करें'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
