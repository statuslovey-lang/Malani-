import { useState } from 'react';
import { 
  Calculator, 
  HelpCircle, 
  Users, 
  Gift, 
  Award, 
  Percent, 
  Coins 
} from 'lucide-react';

export default function BenefitCalculator() {
  const [activeMembers, setActiveMembers] = useState<number>(2240);
  const [ageGroup, setAgeGroup] = useState<string>('standard'); // 'minor', 'standard', 'veteran', 'ineligible'

  // Age group configuration
  const ageConfig = {
    ineligible: {
      label: "15 वर्ष से कम (बालिका)",
      hindiLabel: "बाल विवाह निषेध (अपात्र)",
      weight: 0.0,
      description: "न्यूनतम आयु सीमा से कम होने पर कानूनन सहायता अपात्र है।"
    },
    minor: {
      label: "15-18 वर्ष",
      hindiLabel: "अभिभावक लॉक-इन पात्रता (70%)",
      weight: 0.7,
      description: "विशेष मामलों में कानूनी अभिभावक की सहमति एवं लॉक-इन के साथ 70% सहायता देय।"
    },
    standard: {
      label: "18-20 वर्ष",
      hindiLabel: "मानक पूर्ण पात्रता (100%)",
      weight: 1.0,
      description: "मानक आयु समूह हेतु पूर्ण समाज पूलिंग योगदान लागू है।"
    },
    veteran: {
      label: "20 वर्ष से अधिक",
      hindiLabel: "वरिष्ठ परिपक्वता पात्रता (120%)",
      weight: 1.2,
      description: "समाज के परिपक्व विवाह योग्य वर्ग हेतु 120% की बढ़ी हुई सहायता।"
    }
  };

  const currentAge = ageConfig[ageGroup as keyof typeof ageConfig];

  // Base payout rates per active member
  const baseVivahRate = 250; 
  const baseMomeraRate = 150;

  // Real-time calculations
  const calculatedVivah = Math.floor(activeMembers * baseVivahRate * currentAge.weight);
  const calculatedMomera = Math.floor(activeMembers * baseMomeraRate * currentAge.weight);

  // Formatting currency
  const formatRupee = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-200/50 pb-4">
        <h2 className="text-3xl font-serif font-bold text-amber-950 dark:text-amber-100 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-amber-700 dark:text-amber-500" />
          प्रगतिशील योजना अनुदान कैलकुलेटर
        </h2>
        <p className="text-stone-600 dark:text-stone-400 mt-1">
          सदस्य संख्या और आयु वर्ग के आधार पर वास्तविक समय अनुदान राशि की गणना
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simulator Controls */}
        <div className="lg:col-span-5 space-y-6 bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-2 border-b border-stone-100 dark:border-stone-850 pb-2">
            सिम्युलेटर सेटिंग्स (Simulator Settings)
          </h3>

          {/* Slider for Active Members */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                सक्रिय समाज सदस्य संख्या
              </span>
              <span className="bg-amber-100/70 text-amber-900 dark:bg-amber-950/40 dark:text-amber-400 px-3 py-1 rounded-full font-mono font-bold">
                {activeMembers} सदस्य
              </span>
            </div>
            
            <input 
              type="range" 
              min="100" 
              max="5000" 
              step="10"
              value={activeMembers}
              onChange={(e) => setActiveMembers(Number(e.target.value))}
              className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-xs text-stone-400">
              <span>100 न्यूनतम</span>
              <span>2,500</span>
              <span>5,000 अधिकतम</span>
            </div>
          </div>

          {/* Age Bracket Selector */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-amber-600" />
              लड़की की विवाह आयु वर्ग (Age Group)
            </span>
            
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(ageConfig).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAgeGroup(key)}
                  className={`p-3 rounded-2xl border text-left flex justify-between items-center transition-all ${
                    ageGroup === key 
                      ? 'bg-amber-500/10 border-amber-500 font-medium' 
                      : 'border-stone-200/80 hover:bg-stone-50 dark:border-stone-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                      {config.hindiLabel}
                    </span>
                    <span className="text-xs text-stone-500 block">
                      उम्र श्रेणी: {config.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full ${
                      config.weight === 0.0 
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/25 dark:text-red-400' 
                        : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                    }`}>
                      {config.weight * 100}% वेटेज
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Context Advisory message */}
          <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl text-xs text-stone-500 dark:text-stone-400 leading-relaxed border border-stone-100 dark:border-stone-800">
            <strong>गणित सूत्र:</strong> प्रत्येक विवाह अनुदान का आकलन <code className="bg-stone-200 dark:bg-stone-800 px-1 rounded">सक्रिय सदस्य संख्या × आधार दर × आयु वेटेज</code> से होता है। यह परस्पर पूल पूँजी समाज बही द्वारा संवितरित की जाती है।
          </div>
        </div>

        {/* Simulator Outputs */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          {/* Card 1: Vivah Assistance */}
          <div className="bg-gradient-to-br from-amber-600/50 via-amber-700/50 to-maroon-900/50 p-0.5 rounded-3xl shadow-md">
            <div className="bg-gradient-to-br from-[#FAEDED] to-white dark:from-stone-900 dark:to-stone-950 p-6 rounded-[1.6rem] space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 px-2.5 py-1 rounded-full">
                    कन्या विवाह सहायता अनुदान
                  </span>
                  <h4 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 pt-1">
                    श्री विवाह कल्याण पूल राशि (Vivah)
                  </h4>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-2xl">
                  <Gift className="w-8 h-8" />
                </div>
              </div>

              <div className="py-2">
                {currentAge.weight === 0.0 ? (
                  <span className="text-3xl font-serif font-bold text-red-500 dark:text-red-400">
                    सहायता प्रतिबंधित ₹0
                  </span>
                ) : (
                  <div className="space-y-1">
                    <span className="text-4xl sm:text-5xl font-serif font-bold text-amber-900 dark:text-amber-200 block">
                      {formatRupee(calculatedVivah)}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">
                      (औसत मानक आधार राशि: {formatRupee(activeMembers * baseVivahRate)})
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-400">
                {currentAge.description} लड़की के विवाह के समय समाज बही से सीधा परिवार को भुगतान योग्य होगा।
              </p>
            </div>
          </div>

          {/* Card 2: Momera Assistance */}
          <div className="bg-gradient-to-br from-amber-500/30 via-orange-500/30 to-amber-600/30 p-0.5 rounded-3xl shadow-md">
            <div className="bg-gradient-to-br from-[#FDF9F2] to-white dark:from-stone-900 dark:to-stone-950 p-6 rounded-[1.6rem] space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full">
                    मायरा/मोमेरा सहयोग पूल
                  </span>
                  <h4 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 pt-1">
                    श्री मोमेरा सहायता पूल (Momera)
                  </h4>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-2xl">
                  <Award className="w-8 h-8" />
                </div>
              </div>

              <div className="py-2">
                {currentAge.weight === 0.0 ? (
                  <span className="text-3xl font-serif font-bold text-red-500 dark:text-red-400">
                    सहायता प्रतिबंधित ₹0
                  </span>
                ) : (
                  <div className="space-y-1">
                    <span className="text-4xl sm:text-5xl font-serif font-bold text-amber-850 dark:text-amber-300 block">
                      {formatRupee(calculatedMomera)}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">
                      (औसत मानक आधार राशि: {formatRupee(activeMembers * baseMomeraRate)})
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-400">
                पारंपरिक मायरे के शुभ अवसर पर ननिहाल पक्ष की रस्म के सहयोग स्वरूप अनुदान राशि देय है।
              </p>
            </div>
          </div>

          {/* Cost per Member Summary */}
          <div className="p-5 bg-gradient-to-r from-amber-900/10 to-red-900/10 border border-amber-950/10 dark:border-stone-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-amber-950 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>व्यक्तिगत समाज अंशदान दर: </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 rounded-lg">
                विवाह: ₹300 / घटना
              </span>
              <span className="px-3 py-1.5 bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 rounded-lg">
                मोमेरा/देवलोक गमन: ₹200 / घटना
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
