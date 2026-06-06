import { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck,
  Users, 
  Award, 
  Coins, 
  Clock, 
  UserPlus,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Gift,
  Heart
} from 'lucide-react';

interface Founder {
  name: string;
  role: string;
  phone: string;
}

const FOUNDERS: Founder[] = [
  { name: "केवलराम माली", role: "संस्थापक", phone: "9001611645" },
  { name: "घेवरचंद प्रजापत", role: "संस्थापक", phone: "6375327642" },
  { name: "सुजाराम माली", role: "संस्थापक", phone: "8005995812" },
  { name: "अर्जुन प्रजापत", role: "संस्थापक", phone: "9024760816" }
];

export default function Rulebook() {
  const [activeSchema, setActiveSchema] = useState<'vivah_momera' | 'elderly' | 'daughter_marriage'>('vivah_momera');

  return (
    <div className="space-y-6">
      {/* Head Panel */}
      <div className="bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-850 p-6 rounded-3xl text-left shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 pb-1.5 pt-1.5 rounded-full bg-amber-500/10 text-amber-900 dark:text-amber-400 font-sans font-black text-[10px] tracking-widest uppercase">
              <BookOpen className="w-3 h-3" /> !! श्री गणेशाय नमः !!
            </div>
            <h2 className="text-3xl font-serif font-black text-stone-900 dark:text-stone-50">
              मालाणी समाज सेवा संस्थान बिठुजा
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-sans flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              पता :- रामदेव मंदिर के पास बिठुजा, जिला- बालोतरा - 344022 (राज.)
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/10 px-3.5 py-2 rounded-2xl border border-emerald-500/20 text-xs font-bold leading-none">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>पंजीकृत आधिकारिक नियमावली</span>
          </div>
        </div>

        {/* Founders Grid */}
        <div className="mt-5 pt-5 border-t border-stone-150 dark:border-stone-850 grid grid-cols-2 md:grid-cols-4 gap-3">
          {FOUNDERS.map((founder) => (
            <div key={founder.name} className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 p-3 rounded-2xl text-left space-y-1 hover:border-amber-500/20 transition-all">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">{founder.role}</span>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">{founder.name}</span>
              <a 
                href={`tel:${founder.phone}`}
                className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:underline"
              >
                <Phone className="w-3 h-3 text-stone-400" />
                {founder.phone}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Tabs for the 3 Scanned Schemes */}
      <div className="flex flex-col sm:flex-row bg-stone-100 dark:bg-stone-955 p-1 rounded-2xl gap-1 shadow-inner select-none">
        <button
          type="button"
          onClick={() => setActiveSchema('vivah_momera')}
          className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSchema === 'vivah_momera'
              ? 'bg-white dark:bg-stone-850 text-amber-900 dark:text-amber-400 shadow-sm'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Gift className="w-4 h-4 shrink-0" />
          विवाह व मोमेरा सहायता योजना
        </button>
        <button
          type="button"
          onClick={() => setActiveSchema('elderly')}
          className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSchema === 'elderly'
              ? 'bg-white dark:bg-stone-850 text-amber-900 dark:text-amber-400 shadow-sm'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Heart className="w-4 h-4 shrink-0" />
          बुजुर्ग सहायता योजना [देहान्त्र]
        </button>
        <button
          type="button"
          onClick={() => setActiveSchema('daughter_marriage')}
          className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSchema === 'daughter_marriage'
              ? 'bg-white dark:bg-stone-850 text-amber-900 dark:text-amber-400 shadow-sm'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          पुत्री विवाह योजना [नियम]
        </button>
      </div>

      {/* Scheme Visual Boards */}
      <div className="space-y-6">
        {activeSchema === 'vivah_momera' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Table Matrix Card */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-5 text-left text-white">
                <span className="text-[10px] font-bold tracking-widest uppercase block text-amber-100">SCHEME MATRIX 1</span>
                <h3 className="text-xl font-serif font-black">विवाह व मोमेरा सहायता योजना विवरण</h3>
              </div>

              <div className="p-6 text-left">
                {/* Age & Contribution Board */}
                <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-stone-50 dark:bg-stone-955 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-bold whitespace-nowrap">
                        <th className="p-4">विवरण (Metric)</th>
                        <th className="p-4 text-center">श्रेणी क (Age group 1)</th>
                        <th className="p-4 text-center">श्रेणी ख (Age group 2)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-medium">
                      <tr>
                        <td className="p-4 font-bold text-stone-800 dark:text-stone-200">आयु सीमा (Age Bracket)</td>
                        <td className="p-4 text-center text-stone-600 dark:text-stone-300 font-semibold font-mono">15 से 18 वर्ष</td>
                        <td className="p-4 text-center text-stone-600 dark:text-stone-300 font-semibold font-mono">18 से 20 वर्ष</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-stone-800 dark:text-stone-200">सदस्य बनने की फीस (Enrollment Fee)</td>
                        <td className="p-4 text-center text-green-600 dark:text-green-400 font-extrabold font-mono">₹11,000/-</td>
                        <td className="p-4 text-center text-green-600 dark:text-green-400 font-extrabold font-mono">₹11,500/-</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-stone-800 dark:text-stone-200">हर शादी की किश्त (Installment per Marriage)</td>
                        <td className="p-4 text-center text-stone-600 dark:text-stone-300 font-extrabold font-mono">₹200/-</td>
                        <td className="p-4 text-center text-stone-600 dark:text-stone-300 font-extrabold font-mono">₹200/-</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-stone-800 dark:text-stone-200">हर मोमेरा की किश्त (Installment per Momera)</td>
                        <td className="p-4 text-center text-stone-600 dark:text-stone-300 font-extrabold font-mono">₹300/-</td>
                        <td className="p-4 text-center text-stone-600 dark:text-stone-300 font-extrabold font-mono">₹300/-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Official Rules Card */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 text-left shadow-sm space-y-5">
              <h3 className="text-lg font-serif font-black text-stone-900 dark:text-stone-50 border-b border-stone-100 dark:border-stone-850 pb-2 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-700" />
                संस्था के नियम (Official Scheme Rules)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "300 सदस्य बनने तक हर शादी पर 51,000/- रुपये दिये जायेंगे।",
                  "300 सदस्य बनने तक हर मामेरा पर 51,000/- रुपये दिये जायेंगे।",
                  "जैसे-जैसे समाज के सदस्य जुड़ेंगे वैसे सहायता के लिए संचित पुल राशि बढ़ती रहेगी।",
                  "शादियों या मामेरा में लगातार 3 किश्तों को समय पर जमा ना करने पर संस्था की सदस्यता रद्द की जाएगी।",
                  "संस्था में सदस्यता लेने के 12 माह के अन्दर यदि शादी होती है तो सहायता पूल कूपन देय नहीं होगा।",
                  "जिस सदस्य की शादी या मोमेरा होती हैं, उसकी सूचना 15 दिन पहले संस्था को विवाह कार्ड के साथ देनी होगी।",
                  "शादी या मोमरा की सूचना वॉटसप ग्रुप के माध्यम से सदस्यों को दी जाएगी, सूचना के 5 दिन के अन्दर किश्त जमा कराना अनिवार्य है।",
                  "किसी भी सदस्य की शादी या मोमेरा से पहले आकस्मिक या दुर्घटना होने पर संस्था द्वारा ₹11,000/- सहायता राशि प्रदान की जाएगी।",
                  "विवाह व मोमरा समारोह संपंन होने से 5 दिन पहले सहायता राशि का भुगतान कर दिया जायेगा।"
                ].map((rule, idx) => (
                  <div key={idx} className="flex gap-3 bg-stone-50 dark:bg-stone-955 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-855 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans items-start">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-amber-500/10 text-amber-900 dark:bg-amber-950/40 dark:text-amber-400 font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{rule}</span>
                  </div>
                ))}
              </div>

              {/* Requirement Section */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mt-4 space-y-2 text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-400 block font-serif text-sm">🔖 सदस्य बनने के लिए आवश्यक दस्तावेज:</span>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  जन्म प्रमाण पत्र, आधार कार्ड, 2 रंगीन पासपोर्ट आकार फोटो, माता-पिता का आधार कार्ड एवं 2-2 रंगीन फोटो संस्था कार्यालय में जमा कराना आवश्यक है।
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSchema === 'elderly' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Table Matrix Card */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-red-700 to-red-850 p-5 text-left text-white">
                <span className="text-[10px] font-bold tracking-widest uppercase block text-red-200">SCHEME MATRIX 2</span>
                <h3 className="text-xl font-serif font-black">बुजुर्ग सहायता योजना [निधन सहायता विवरण]</h3>
              </div>

              <div className="p-6 text-left">
                {/* Age & Contribution Board */}
                <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-stone-50 dark:bg-stone-955 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-bold whitespace-nowrap">
                        <th className="p-4">विवरण (Elderly Metric)</th>
                        <th className="p-4 text-center">श्रेणी क (Age group 1)</th>
                        <th className="p-4 text-center">श्रेणी ख (Age group 2)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-medium">
                      <tr>
                        <td className="p-4 font-bold text-stone-800 dark:text-stone-200">आयु सीमा (Age Bracket)</td>
                        <td className="p-4 text-center text-stone-600 dark:text-stone-300 font-semibold font-mono">45 से 55 वर्ष</td>
                        <td className="p-4 text-center text-stone-600 dark:text-stone-300 font-semibold font-mono">56 से 70 वर्ष</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-stone-800 dark:text-stone-200">सदस्य बनने की फीस (Enrollment Fee)</td>
                        <td className="p-4 text-center text-red-600 dark:text-red-400 font-extrabold font-mono">₹6,100/-</td>
                        <td className="p-4 text-center text-red-600 dark:text-red-400 font-extrabold font-mono">₹8,100/-</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-stone-800 dark:text-stone-200">हर सदस्य के निधन पर देय किश्त (Individual Installment)</td>
                        <td className="p-4 text-center text-stone-600 dark:text-stone-300 font-extrabold font-mono">₹300/-</td>
                        <td className="p-4 text-center text-stone-600 dark:text-stone-300 font-extrabold font-mono">₹300/-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Official Rules Card */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 text-left shadow-sm space-y-5">
              <h3 className="text-lg font-serif font-black text-rose-900 dark:text-rose-400 border-b border-stone-100 dark:border-stone-850 pb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-700" />
                बुजुर्ग सुरक्षा के नियम (Official Rules)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "संस्था में सदस्य बने हुए व्यक्ति की मृत्यु (देहान्त) होने पर बाकी प्रत्येक सदस्य के तौर पर 300/- रुपये किश्त ली जाएगी।",
                  "संस्था की ओर से बारह दिन (द्वादश संस्कार) पर मृतक के परिवार को निर्धारित सहायता प्रदान की जाएगी।",
                  "250 सदस्य बनने तक मृतक के परिवार को 51,000/- रुपये प्रेषित किये जायेंगे। वहीं 300 से अधिक सदस्य होने पर कुल एकत्रित राशि में से 20% प्रतिशत प्रशासनिक कटौती की जायेगी।",
                  "3 किश्त तक राशि समय पर जमा नहीं करने पर बिना सूचना सदस्यता तत्काल निरस्त कर दी जाएगी। इसके लिए सदस्य स्वयं जिम्मेदार होंगे।",
                  "जो सदस्य इस संस्था को निरंतर 25 वर्ष तक निष्ठापूर्वक सेवा प्रदान करेगा, उसे जीवित पेमेंट (नियमित सुरक्षा भुगतान) दिया जाएगा।",
                  "सदस्यता रद्द होने की स्थिति में, संबंधित सदस्य द्वारा संस्था में पूर्व में जमा कराई गई कोई भी राशि वापस देय नहीं होगी।",
                  "अगर समाज में किसी का भी घरेलू विवाद या आपसी मनमुटाव है तो उसमें संस्था का कोई हस्तक्षेप नहीं रहेगा; संस्था के लिए समाज के प्रत्येक घटक समान श्रेणी में हैं।",
                  "संस्था के नियमों अथवा सिद्धांतों के बारे में किसी भी आपत्ति के संबंध में सीधे संस्था बालोतरा कार्यालय में संपर्क कर समाधान कराएं।",
                  "नियमों के संकलन का मुख्य लक्ष्य एक-दूसरे के प्रति संवेदनशीलता व्यक्त करना एवं समाज की कल्याणकारी कड़ियों को सुदृढ़ीकरण प्रदान करना है।"
                ].map((rule, idx) => (
                  <div key={idx} className="flex gap-3 bg-stone-50 dark:bg-stone-955 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-855 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans items-start">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-red-500/10 text-red-900 dark:bg-red-950/40 dark:text-red-400 font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSchema === 'daughter_marriage' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Table Matrix Card */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-5 text-left text-white">
                <span className="text-[10px] font-bold tracking-widest uppercase block text-emerald-200">SCHEME MATRIX 3</span>
                <h3 className="text-xl font-serif font-black">पुत्री विवाह सहायता योजना [नियम व विस्तृत तालिका]</h3>
              </div>

              <div className="p-6 text-left">
                {/* Age & Contribution Board */}
                <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-stone-50 dark:bg-stone-955 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-bold whitespace-nowrap">
                        <th className="p-4">विवरण (Age Slab)</th>
                        <th className="p-4 text-center">सदस्यता अनुदान राशि (Grant Fee)</th>
                        <th className="p-4 text-center">सहयोग किश्त राशि (Swayam Kist)</th>
                        <th className="p-4 text-center">भाग प्रकार (Plan Section)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-medium">
                      {[
                        { age: "0 से 7 वर्ष", grant: "₹110.0", kist: "₹100", part: "भाग-1" },
                        { age: "7 से 12 वर्ष", grant: "₹310.0", kist: "₹150", part: "भाग-1" },
                        { age: "12 से 17 वर्ष", grant: "₹510.0", kist: "₹200", part: "भाग-1" },
                        { age: "17 से 20 वर्ष", grant: "₹710.0", kist: "₹300", part: "भाग-2" },
                        { age: "20 से 22 वर्ष", grant: "₹910.0", kist: "₹400", part: "भाग-2" },
                        { age: "22+ वर्ष", grant: "₹1100.0", kist: "₹500", part: "भाग-2" }
                      ].map((slab) => (
                        <tr key={slab.age} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                          <td className="p-4 font-bold text-stone-800 dark:text-stone-200 font-mono">{slab.age}</td>
                          <td className="p-4 text-center text-emerald-600 dark:text-emerald-400 font-extrabold font-mono">{slab.grant}</td>
                          <td className="p-4 text-center text-stone-750 dark:text-stone-250 font-extrabold font-mono">{slab.kist}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              slab.part === 'भाग-1' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                            }`}>
                              {slab.part}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Official Rules Card */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 text-left shadow-sm space-y-5">
              <h3 className="text-lg font-serif font-black text-emerald-900 dark:text-emerald-400 border-b border-stone-100 dark:border-stone-850 pb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-700" />
                पुत्री विवाह सहायता नियम और शर्तें (T&C)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "संस्था की इस विशिष्ट योजना का उद्देश्य केवल पुत्री के शुभ विवाह पर आवश्यक सहयोग राशि का प्रत्यक्ष संवितरण करवाना है।",
                  "इस बालिका योजना में नियम अनुसार सदस्यता अनुदान राशि एवं विवाह सहयोग राशि (किश्त) का निर्धारण सीधे सदस्य की आयु के आधार पर किया जाएगा।",
                  "योजना में किसी सदस्य का विवाह जुड़ने की तिथि से 8 महीने के अंदर होता है तो उनको केवल सदस्यता अनुदान राशि का ही भुगतान संस्था के कार्यालय खर्च काटकर प्रेषित किया जाएगा।",
                  "योजना में किसी सदस्य का विवाह 6 महीने से 12 महीने के मध्य होने पर 51,000/-, तथा 12 महीने के बाद होने पर योजना में पूर्ण मेम्बर भुगतान देय रहेगा।",
                  "योजना में सदस्य को कुल विवाह सहयोग लाभ राशि का भुगतान संस्था के वित्तीय संतुलन बनाये रखने के लिए 20% कटौती करके किया जायेगा।",
                  "सभी सदस्यों से सविनय निवेदन रहेगा कि वे विवाह सहयोग राशि की किश्ते समय पर संस्था के अधिकृत कार्यकर्ता या डायरेक्ट खाते में सहेजकर आधिकारिक रसीद लेवें।",
                  "बालिका विवाह योजना के अंतर्गत विवाह आयोजन के होने से कम से कम 15 दिन पूर्व संस्था के कार्यालय को लिखित अथवा प्रमाण सहित सूचना देना अनिवार्य होगा।",
                  "इस योजना का लाभ अत्यंत विश्वसनीय रूप से केवल उन्हीं संस्कारी परिवारों को मिलेगा जिनका विवाह दोनों परिवारों की आपसी सहमती एवं मर्यादा से संपन्न हुआ हो।",
                  "योजना के सभी सदस्य संस्था के नियमों तथा विधानों का पूर्ण निष्ठा से पालन करने के लिए व्यक्तिगत तौर पर जिम्मेदार रहेंगे।",
                  "संस्था बालोतरा भविष्य में समय के साथ योजना की आवश्यकताओं के अनुरूप नियम, ब्याज, आवंटन एवं शर्तों परिवर्तन करने के लिए पूर्णतः स्वतंत्र रहेगी।"
                ].map((rule, idx) => (
                  <div key={idx} className="flex gap-3 bg-stone-50 dark:bg-stone-955 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-855 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans items-start">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-500/10 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Community Mandate Statement */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/40 rounded-3xl p-6 dark:from-stone-900 dark:to-stone-950 dark:border-stone-800 text-left">
        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-2 font-serif flex items-center gap-1.5 uppercase tracking-wider">
          💡 नोट: संस्था के अनुसार नियम में संशोधन किया जा सकता है!
        </h4>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          मालाणी सेवा समाज की नियमावली कल्याणकारी भावना से बनाई गई है। समाज हित को सर्वोपरि मानते हुए आवश्यकतानुसार संशोधन कार्यकारी समिति की सहमति से किया जा सकेगा। किसी भी शिकायत या पूछताछ के लिए संस्थापक प्रतिनिधियों से संपर्क करें।
        </p>
      </div>
    </div>
  );
}
