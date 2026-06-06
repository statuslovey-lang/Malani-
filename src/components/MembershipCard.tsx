import { useState, useRef } from 'react';
import { 
  User, 
  QrCode, 
  Printer, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle, 
  Award,
  IdCard,
  Camera,
  AlertCircle
} from 'lucide-react';

interface MembershipCardProps {
  profile: {
    displayName: string;
    membershipId?: string;
    fatherName?: string;
    phone?: string;
    isStudent?: boolean;
    unpaidInstallments?: number;
    eligibilityChecked?: boolean;
    joinedAt?: string;
  };
  onUpdateAvatar?: (avatarUrl: string) => void;
  avatarUrl?: string;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", // Male 1
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200", // Female 1
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200", // Male 2
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"  // Female 2
];

export default function MembershipCard({ profile, onUpdateAvatar, avatarUrl }: MembershipCardProps) {
  const [showQr, setShowQr] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Determine if user has restricted status (Rule 4: unpaid count >= 3)
  const unpaidCount = profile.unpaidInstallments ?? 0;
  const isRestricted = unpaidCount >= 3;

  // Custom QR Code representation
  const qrValue = `MSS-ID: ${profile.membershipId || 'MSS9999'} | NAME: ${profile.displayName} | STATUS: ${isRestricted ? 'RESTRICTED' : 'ACTIVE_VERIFIED'}`;

  const handlePrint = () => {
    const printContent = cardRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      const win = window.open('', '', 'width=800,height=600');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Membership Card - Malani Seva Sanstha</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                body { background: white; color: black; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }
                .metallic-gold-card { background: linear-gradient(135deg, #d4af37, #f3e5ab, #aa7c11); }
              </style>
            </head>
            <body>
              <div style="width: 450px;">
                ${printContent}
              </div>
            </body>
          </html>
        `);
        win.document.close();
        win.focus();
        setTimeout(() => {
          win.print();
          win.close();
        }, 500);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-200/50 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-amber-950 dark:text-amber-100 flex items-center gap-3">
            <IdCard className="w-8 h-8 text-amber-700 dark:text-amber-500" />
            डिजिटल स्वर्ण पहचान पत्र
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mt-1">राजसी स्वर्ण शैली डिजिटल सदस्यता कार्ड - मालाणी सेवा संस्थान बिठुजा</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowQr(!showQr)}
            className="px-4 py-2 rounded-full border border-stone-200/80 hover:bg-stone-50 dark:border-stone-800 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <QrCode className="w-4 h-4 text-amber-700" />
            {showQr ? 'विवरण दिखाएं' : 'QR कोड दिखाएं'}
          </button>
          
          <button 
            onClick={handlePrint}
            className="px-4 py-2 rounded-full bg-amber-800 text-white hover:bg-amber-900 flex items-center gap-2 text-sm font-medium transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            प्रिंट कार्ड
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Printable Card Area */}
        <div className="lg:col-span-7 flex justify-center">
          <div 
            ref={cardRef}
            className="relative w-full max-w-[450px] aspect-[1.58/1] rounded-3xl overflow-hidden shadow-2xl transition-all"
            style={{
              background: isRestricted 
                ? 'linear-gradient(135deg, #2B1B1D 0%, #4D1621 50%, #1A0D0E 100%)' 
                : 'linear-gradient(135deg, #F9D066 0%, #E8AD31 35%, #C28711 75%, #A36F08 100%)',
              border: isRestricted ? '4px solid #F05252' : '4px solid #F6E05E',
              boxShadow: isRestricted 
                ? '0 20px 40px -15px rgba(239, 83, 80, 0.2)' 
                : '0 20px 40px -15px rgba(220, 150, 20, 0.3)'
            }}
          >
            {/* Gloss Highlight overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 pointer-events-none" />

            {/* Traditional Indian Mandala Background Motif */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900 via-stone-800 to-black rounded-full" />

            {/* Card Content Wrapper */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white font-sans z-10">
              
              {/* Card Header */}
              <div className="flex justify-between items-start border-b border-white/20 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base sm:text-lg font-serif font-bold tracking-wide text-stone-100 uppercase">
                    मालाणी सेवा संस्थान बिठुजा
                  </h3>
                  <p className="text-[10px] uppercase font-mono tracking-widest text-stone-200/80">
                    Malani Seva Sanstha Bithuja
                  </p>
                </div>
                
                {/* Status stamp/icon */}
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase ${
                  isRestricted 
                    ? 'bg-red-650 text-red-100 border border-red-500 animate-pulse' 
                    : 'bg-stone-900/40 text-amber-100 border border-amber-300'
                }`}>
                  {isRestricted ? (
                    <>
                      <ShieldAlert className="w-3 h-3 text-red-400" />
                      लॉक-इन निलंबित
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3 text-amber-300" />
                      वैध सदस्य
                    </>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex gap-4 items-center flex-1 my-3">
                {showQr ? (
                  /* QR Code view */
                  <div className="flex items-center justify-between w-full">
                    <div className="bg-white p-2.5 rounded-2xl flex-shrink-0 border border-yellow-200">
                      {/* Generates a neat aesthetic mock QR canvas representation */}
                      <div className="w-24 h-24 bg-stone-100 border-2 border-stone-800 flex items-center justify-center relative">
                        <QrCode className="w-16 h-16 text-stone-800" />
                        <div className="absolute inset-x-0 bottom-0 text-[6px] text-center font-mono bg-stone-800 text-white truncate py-0.5 px-0.5">
                          {profile.membershipId || 'MSS1001'}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 pl-4 space-y-1.5 text-left">
                      <span className="text-[10px] font-mono tracking-widest text-amber-200 uppercase block">Verification Data</span>
                      <p className="text-xs font-mono text-stone-200 break-all leading-tight">
                        ID: {profile.membershipId || 'MSS1001'}<br />
                        Name: {profile.displayName}<br />
                        User: {profile.isStudent ? 'Youth/Student' : 'Head of Household'}<br />
                        Alerts: {profile.unpaidInstallments || 0} Dues
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Standard Details view */
                  <>
                    {/* User profile photo */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-850 border-2 border-white/40 flex-shrink-0 flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} className="w-full h-full object-cover" alt="Profile avatar" />
                      ) : (
                        <div className="w-full h-full bg-stone-800/80 flex items-center justify-center text-white font-bold text-center">
                          <User className="w-8 h-8 opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Member parameters */}
                    <div className="flex-1 text-left space-y-1">
                      <div>
                        <span className="text-[9px] font-bold text-yellow-100 uppercase tracking-widest block opacity-70">
                          सदस्य का नाम / Name
                        </span>
                        <h4 className="text-sm font-bold sm:text-base text-stone-50 truncate leading-snug">
                          {profile.displayName}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <span className="text-[8px] font-bold text-yellow-105 uppercase tracking-widest block opacity-70">
                            सदस्यता आईडी / ID
                          </span>
                          <span className="text-xs font-mono font-bold block text-yellow-200">
                            {profile.membershipId || 'MSS1001'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-yellow-105 uppercase tracking-widest block opacity-70">
                            पिता का नाम / Father
                          </span>
                          <span className="text-xs truncate block text-stone-100">
                            {profile.fatherName || 'समाज प्रमुख'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <span className="text-[8px] font-bold text-yellow-105 uppercase tracking-widest block opacity-70">
                            मोबाइल / Phone
                          </span>
                          <span className="text-xs font-mono block text-stone-100 truncate">
                            {profile.phone || '+91 - - - - -'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-yellow-105 uppercase tracking-widest block opacity-70">
                            श्रेणी / Category
                          </span>
                          <span className="text-xs block text-stone-100">
                            {profile.isStudent ? 'छात्र (Student)' : 'सामान्य परिवार'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-center text-[9px] border-t border-white/20 pt-2.5">
                <span className="text-yellow-100 opacity-80">
                  जारी तिथि: {profile.joinedAt || '04-Jun-2026'}
                </span>
                <span className="font-mono flex items-center gap-1 text-yellow-100">
                  <Award className="w-3.5 h-3.5 text-yellow-300" />
                  मालाणी सेवा बोर्ड द्वारा प्रमाणित
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Avatar Customizer / Card Meta Instructions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-100 dark:border-stone-850 pb-2">
              <Camera className="w-5 h-5 text-amber-700" />
              पहचान पत्र कस्टमाइज़ करें
            </h3>
            
            <span className="text-sm font-medium text-stone-605 dark:text-stone-400 block mb-2 text-left">
              पहचान फोटो चुनें (Choose Avatar Photo):
            </span>

            <div className="flex flex-wrap gap-3">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onUpdateAvatar?.(url)}
                  className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${
                    avatarUrl === url ? 'border-amber-500 scale-105 ring-2 ring-amber-500/20' : 'border-stone-200'
                  }`}
                >
                  <img src={url} className="w-full h-full object-cover" alt={`Preset avatar ${i+1}`} />
                </button>
              ))}
            </div>

            <div className="border-t border-stone-105 dark:border-stone-850 pt-4 text-xs space-y-2 text-stone-500 text-left leading-relaxed">
              <p className="flex items-start gap-1.5 text-stone-600 dark:text-stone-400 font-medium">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>डिजिटल सोने के कार्ड का QR कोड किसी भी मालाणी समाज आयोजन पर आपके सदस्यता सत्यापन हेतु प्रयुक्त हो सकता है।</span>
              </p>
              <p className="flex items-start gap-1.5 text-stone-600 dark:text-stone-400 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>बकाया बकाया किस्तें 3 होने पर कार्ड पर <strong>LOCK-IN SUSPENDED</strong> चेतावनी दर्ज होगी जो कि सहायता आवेदनों को खारिज करने का संकेत है।</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
