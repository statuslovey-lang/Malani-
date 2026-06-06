import { useState } from 'react';
import { 
  FileText, 
  User, 
  Fingerprint, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  Gift, 
  Award, 
  Calendar,
  Layers,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { SansthaClaim, ClaimType } from '../types';

interface ClaimsFormProps {
  unpaidCount: number;
  onAddClaim: (claim: Partial<SansthaClaim>) => void;
  claims: SansthaClaim[];
}

export default function ClaimsForm({ unpaidCount, onAddClaim, claims }: ClaimsFormProps) {
  // Input states
  const [applicantName, setApplicantName] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [claimType, setClaimType] = useState<ClaimType>('Vivah');
  const [eventDate, setEventDate] = useState('');
  const [details, setDetails] = useState('');
  
  // Eligibility checklist states
  const [checklistResident, setChecklistResident] = useState(false);
  const [checklistDuesUnderLimit, setChecklistDuesUnderLimit] = useState(unpaidCount < 3);
  const [checklistApprovedMatch, setChecklistApprovedMatch] = useState(false);

  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submittedClaim, setSubmittedClaim] = useState<SansthaClaim | null>(null);

  // Rule 4 Block condition
  const isSuspended = unpaidCount >= 3;

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!applicantName.trim()) {
      newErrors.name = "आवेदक का नाम भरना आवश्यक है। (Name is required)";
    } else if (applicantName.trim().length < 3) {
      newErrors.name = "कृपया पूरा वास्तविक नाम दर्ज करें (न्यूनतम 3 वर्ण)|";
    }

    const idPattern = /^MSS\d{4}$/;
    if (!membershipId.trim()) {
      newErrors.id = "सदस्यता आईडी आवश्यक है। (Membership ID is required)";
    } else if (!idPattern.test(membershipId.trim())) {
      newErrors.id = "अवैध आईडी प्रारूप! आईडी 'MSS' और इसके बाद ठीक 4 अंकों की होनी चाहिए (उदा. MSS1234)";
    }

    if (!eventDate) {
      newErrors.date = "आयोजन की तारीख चुनना आवश्यक है।";
    }

    if (!checklistResident) {
      newErrors.checklist = "मूल निवासी होने सत्यापिक चेकबॉक्स को सिलेक्ट करना आवश्यक है।";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSuspended) {
      alert("सहायता अस्वीकृत ⚠️ नियम 4 के अनुसार आपकी ३ या अधिक किस्तें बकाया होने के कारण आपकी ग्रेस अवधि और नए अनुदान दावे निलंबित कर दिए गए हैं। कृपया पहले बही खाता से भुगतान पूर्ण करें।");
      return;
    }

    if (validateForm()) {
      const claimId = 'CLM-' + Math.floor(100000 + Math.random() * 900000);
      const newClaim: SansthaClaim = {
        applicantName: applicantName.trim(),
        membershipId: membershipId.trim().toUpperCase(),
        claimType,
        eventDate,
        details: details.trim() || `${claimType} सहायता अनुदान हेतु आवेदन पत्र `,
        status: 'Pending',
        submittedAt: new Date().toLocaleDateString(),
        refNumber: claimId,
        userId: 'session-user'
      };

      onAddClaim(newClaim);
      setSubmittedClaim(newClaim);

      // Reset Inputs
      setApplicantName('');
      setMembershipId('');
      setEventDate('');
      setDetails('');
      setChecklistResident(false);
      setChecklistApprovedMatch(false);
      setErrors({});
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-200/50 pb-4">
        <h2 className="text-3xl font-serif font-bold text-amber-950 dark:text-amber-100 flex items-center gap-3">
          <FileText className="w-8 h-8 text-amber-700 dark:text-amber-500" />
          सहायता अनुदान आवेदन (आवेदन फॉर्म)
        </h2>
        <p className="text-stone-600 dark:text-stone-400 mt-1">कन्या विवाह (Vivah) या मोमेरा (Momera) सहायता अनुदान के लिए नवीन आवेदन</p>
      </div>

      {isSuspended && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex gap-4 text-left items-start dark:bg-rose-950/20 dark:border-rose-900/40">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-rose-950 dark:text-rose-400 text-lg">
              आवेदन जमा करने की अनुमति नहीं है! (Suspended Status)
            </h4>
            <p className="text-sm text-rose-700 dark:text-rose-300">
              <strong>नियम 4 (किस्त उल्लंघन):</strong> आपकी <strong>{unpaidCount} सामाजिक किस्तें</strong> बकाया पाई गई हैं। जब तक आपकी बकाया किस्तें 3 से कम नहीं हो जातीं, समाज नियमानुसार सभी वित्तीय दावे व आवेदन ब्लॉक-इन और निलंबित रहेंगे। कृपया पहले बही-खाता अनुभाग में जाएँ और बकाया जमा कराएँ।
            </p>
          </div>
        </div>
      )}

      {submittedClaim && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-3xl space-y-4 text-left dark:bg-green-950/15 dark:border-green-900/30">
          <div className="flex gap-4 items-start">
            <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-green-950 dark:text-green-400 text-xl">
                आधिकारिक आवेदन पत्र सफलतापूर्वक प्राप्त हुआ!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                आपका आवेदन दर्ज कर लिया गया है। समीक्षा हेतु ब्यौरा निम्न प्रकार है:
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-green-150/50 space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-sm">
            <div>
              <span className="text-xs font-semibold text-stone-400">आवेदक नाम:</span>
              <p className="font-bold text-stone-850 dark:text-stone-100">{submittedClaim.applicantName}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-stone-400">सदस्यता आईडी:</span>
              <p className="font-mono font-bold text-amber-700 dark:text-amber-400">{submittedClaim.membershipId}</p>
            </div>
            <div className="mt-2">
              <span className="text-xs font-semibold text-stone-400">सहायता प्रकार:</span>
              <p className="font-bold text-stone-850 dark:text-stone-100">
                {submittedClaim.claimType === 'Vivah' && 'कन्या विवाह (Vivah)'}
                {submittedClaim.claimType === 'Momera' && 'मायरा/मोमेरा (Momera)'}
                {submittedClaim.claimType === 'Death' && 'बुजुर्ग निधन सहायता (Elderly Death Aid)'}
                {submittedClaim.claimType === 'DaughterMarriage' && 'पुत्री विवाह योजना (Daughter Marriage)'}
              </p>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-xs font-semibold text-stone-400">रिफरेन्स नंबर:</span>
              <p className="font-mono font-bold text-stone-800 dark:text-stone-200">{submittedClaim.refNumber}</p>
            </div>
          </div>

          <button 
            onClick={() => setSubmittedClaim(null)}
            className="text-xs font-bold text-green-700 dark:text-green-400 hover:underline"
          >
            नया आवेदन फॉर्म भरें (Submit another application)
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Registration Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-2 border-b border-stone-100 dark:border-stone-850 pb-2 text-left">
              सहायता आवेदन विवरण पत्र (Form Details)
            </h3>

            {/* Applicant Name */}
            <div className="space-y-1.5 text-left">
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-700" />
                आवेदक का नाम (Applicant Full Name) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                value={applicantName}
                onChange={(e) => {
                  setApplicantName(e.target.value);
                  if (errors.name) setErrors(prev => { const d={...prev}; delete d.name; return d; });
                }}
                disabled={isSuspended}
                placeholder="उदा. राम देवसी बिठुजा"
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-all ${
                  errors.name 
                    ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/10' 
                    : 'border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500'
                }`}
              />
              {errors.name && (
                <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name}
                </span>
              )}
            </div>

            {/* Membership ID and Assistance Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Membership ID */}
              <div className="space-y-1.5 text-left">
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-amber-700" />
                  सदस्यता आईडी (Membership ID) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={membershipId}
                  onChange={(e) => {
                    setMembershipId(e.target.value);
                    if (errors.id) setErrors(prev => { const d={...prev}; delete d.id; return d; });
                  }}
                  disabled={isSuspended}
                  placeholder="उदा. MSS1234"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-all uppercase font-mono ${
                    errors.id 
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/10' 
                      : 'border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500'
                  }`}
                />
                {errors.id ? (
                  <span className="text-xs text-red-500 flex items-start gap-1 mt-1 leading-tight">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{errors.id}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 block mt-1 font-medium select-none">
                    प्रारूप: MSS के बाद ठीक चार अंक (उदा. MSS1002)
                  </span>
                )}
              </div>

              {/* Assistance Type */}
              <div className="space-y-1.5 text-left">
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-700" />
                  सहायता वर्ग (Assistance Scheme Type) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setClaimType('Vivah')}
                    disabled={isSuspended}
                    className={`py-3 px-1 text-xs rounded-xl border font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      claimType === 'Vivah' 
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>विवाह बही</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClaimType('Momera')}
                    disabled={isSuspended}
                    className={`py-3 px-1 text-xs rounded-xl border font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      claimType === 'Momera' 
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>मायरा / मोमेरा</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClaimType('Death')}
                    disabled={isSuspended}
                    className={`py-3 px-1 text-xs rounded-xl border font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      claimType === 'Death' 
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span>बुजुर्ग सहायता</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClaimType('DaughterMarriage')}
                    disabled={isSuspended}
                    className={`py-3 px-1 text-xs rounded-xl border font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      claimType === 'DaughterMarriage' 
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>पुत्री विवाह</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Event Date & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  आयोजन तिथि (Event Date) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date"
                  value={eventDate}
                  onChange={(e) => {
                    setEventDate(e.target.value);
                    if (errors.date) setErrors(prev => { const d={...prev}; delete d.date; return d; });
                  }}
                  disabled={isSuspended}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-all ${
                    errors.date 
                      ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/10' 
                      : 'border-stone-200 dark:border-stone-800 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500'
                  }`}
                />
                {errors.date && (
                  <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.date}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                  अतिरिक्त ब्यौरा (Description)
                </label>
                <input 
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  disabled={isSuspended}
                  placeholder="उदा. बड़ी सुपुत्री का शुभ विवाह"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Interactive Eligibility Checklist */}
            <div className="space-y-3 bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl border border-stone-205/50 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                योग्यता सत्यापन चेकलिस्ट (Eligibility Indicators)
              </span>

              <div className="space-y-2 pt-1.5 text-sm">
                <label className="flex items-start gap-2.5 cursor-pointer selection:bg-transparent">
                  <input 
                    type="checkbox"
                    checked={checklistResident}
                    onChange={(e) => {
                      setChecklistResident(e.target.checked);
                      if (errors.checklist) setErrors(prev => { const d={...prev}; delete d.checklist; return d; });
                    }}
                    disabled={isSuspended}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500/20 mt-0.5 border-stone-300"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 block">मूल निवासी सत्यापन प्रमाण</span>
                    <span className="text-xs text-stone-500 block leading-normal">आवेदक परिवार बिठुजा क्षेत्र का मूल निवासी है और समाज बही में पंजीकृत है।</span>
                  </div>
                </label>
                {errors.checklist && (
                  <span className="text-xs text-red-500 flex items-center gap-1.5 ml-6">
                    <AlertCircle className="w-3 h-3" />
                    {errors.checklist}
                  </span>
                )}

                <div className="flex items-start gap-2.5 opacity-80 pt-1.5 border-t border-stone-200/50">
                  <input 
                    type="checkbox" 
                    checked={checklistDuesUnderLimit} 
                    readOnly 
                    className="w-4 h-4 rounded mt-0.5 accent-amber-600 border-stone-350" 
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 block">किस्त बही अनुशासन स्थिति</span>
                    <span className={`text-xs block font-semibold ${isSuspended ? 'text-rose-600' : 'text-green-600'}`}>
                      {isSuspended 
                        ? `अयोग्य: आपके ${unpaidCount} किस्तों का बकाया अतिदेय (सीमा 3) है!` 
                        : `योग्य: बही खाते में केवल ${unpaidCount} किस्तें बकाया हैं जो सुरक्षित सीमा में हैं।`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSuspended}
              className="w-full py-4 bg-amber-800 text-white rounded-full font-bold shadow-md hover:bg-amber-900 transition-all flex items-center justify-center gap-2 text-md leading-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              आवेदन सुरक्षित करें (Submit Claim)
            </button>
          </form>
        </div>

        {/* Claim Directory / History Column */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-100 dark:border-stone-850 pb-2 text-left">
              सक्रिय सहायता आवेदन बही (Claims Log)
            </h3>

            {claims.length === 0 ? (
              <div className="py-16 text-center text-stone-400 font-medium">
                <FileText className="w-12 h-12 stroke-[1.2] mx-auto text-stone-300 mb-3" />
                <span>कोई आवेदन उपलब्ध नहीं</span>
              </div>
            ) : (
              <div className="space-y-3.5 divide-y divide-stone-100 dark:divide-stone-850">
                {claims.map((claim) => (
                  <div key={claim.refNumber} className="pt-3.5 first:pt-0 flex justify-between items-center text-left">
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          claim.claimType === 'Vivah' 
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-400' 
                            : claim.claimType === 'Momera'
                              ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/40 dark:text-purple-400'
                              : claim.claimType === 'Death'
                                ? 'bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-400'
                                : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}>
                          {claim.claimType === 'Vivah' && 'विवाह सहायता'}
                          {claim.claimType === 'Momera' && 'मोमेरा सहायता'}
                          {claim.claimType === 'Death' && 'बुजुर्ग निधन'}
                          {claim.claimType === 'DaughterMarriage' && 'पुत्री विवाह'}
                        </span>
                        <span className="font-mono text-[10px] text-stone-400 font-semibold">{claim.refNumber}</span>
                      </div>
                      <h4 className="font-bold text-stone-850 dark:text-stone-100 text-sm leading-snug">
                        {claim.applicantName}
                      </h4>
                      <p className="text-xs text-stone-400">
                        आवेदन तिथि: {claim.submittedAt} • सदस्य: {claim.membershipId}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        claim.status === 'Pending' 
                          ? 'bg-stone-100 text-stone-500' 
                          : claim.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {claim.status === 'Pending' ? 'विचाराधीन' : 'स्वीकृत'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-stone-105 dark:border-stone-850 pt-4 text-xs text-stone-400 text-left select-none leading-relaxed">
            * दर्ज आवेदनों का भौतिक सत्यापन समिति अधिकारियों द्वारा परिवार निवास बिठुजा पर जाकर किया जाता है, जिसके उपरांत सहायता राशि सीधा हस्तांतरित की जाती है।
          </div>
        </div>
      </div>
    </div>
  );
}
