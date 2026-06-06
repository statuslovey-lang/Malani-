import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { askSansthaAi } from '../services/geminiService';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface AiAdvisorProps {
  profile: {
    displayName: string;
    membershipId?: string;
    unpaidInstallments?: number;
    duesAmount?: number;
    isStudent?: boolean;
  };
}

const SAMPLE_QUESTIONS = [
  "बकाया किस्त और नियम चार (Rule 4) क्या है?",
  "विवाह सहायता अनुदान की गणना कैसे की जाती है?",
  "क्या मैं विवाह सहायता अनुदान हेतु योग्य हूँ?",
  "मायरा / मोमेरा की अंशदान दरें क्या हैं?"
];

export default function AiAdvisor({ profile }: AiAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'ai',
      text: `राम राम सा! मालाणी सेवा संस्थान बिठुजा के डिजिटल मार्गदर्शक पोर्टल पर आपका स्वागत है। मैं संस्थान के नियम और बही-खाता दिशानिर्देशों को समझाने में आपकी सहायता कर सकता हूँ। आप मुझसे नियम ४, ५, पूलिंग गणित या आपकी सदस्यता स्थिति के बारे में कुछ भी पूछ सकते हैं।`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await askSansthaAi(textToSend, profile);
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI error:", error);
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: "क्षमा करें, मार्गदर्शक डेटाबेस से जुड़ने में समस्या आ रही है। कृपया एक बार फिर प्रयास करें।",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-200/50 pb-4">
        <h2 className="text-3xl font-serif font-bold text-amber-950 dark:text-amber-100 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-amber-700 dark:text-amber-500 animate-pulse" />
          एआई संस्थान मार्गदर्शक (AI advisor)
        </h2>
        <p className="text-stone-600 dark:text-stone-400 mt-1">परस्पर सहायता नियमों व बही-खाता गणित के समाधान हेतु एआई मार्गदर्शक</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Helper suggestions Sidebar */}
        <div className="lg:col-span-4 bg-amber-50/30 dark:bg-stone-900 border border-amber-200/20 rounded-3xl p-5 text-left h-fit space-y-4">
          <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 border-b border-amber-200/10 pb-2 flex items-center gap-2 text-sm sm:text-base">
            <HelpCircle className="w-4.5 h-4.5 text-amber-700" />
            त्वरित सुझाव प्रश्न (Quick Questions)
          </h4>
          <p className="text-xs text-stone-500 leading-normal">
            संस्थान मार्गदर्शक से सीधे पूछताछ करने के लिए निम्न में से किसी भी विषय पर क्लिक करें:
          </p>

          <div className="flex flex-col gap-2.5">
            {SAMPLE_QUESTIONS.map((question, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(question)}
                className="p-3 text-left bg-white dark:bg-stone-850 hover:bg-amber-50/50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 transition-all hover:translate-x-1"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-amber-200/10 text-[10px] text-stone-400 leading-relaxed font-semibold block">
            * मार्गदर्शक नियमों एवं सदस्य की वर्तमान खाता स्थिति (आईडी: {profile.membershipId || 'MSS1001'}, लंबित किस्त: {profile.unpaidInstallments || 0}) के आधार पर विचार प्रस्तुत करता है।
          </div>
        </div>

        {/* Live Chat Window Column */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[550px]">
          {/* Chat Window Header */}
          <div className="bg-gradient-to-r from-amber-700 to-amber-900 p-4 shrink-0 flex items-center gap-3 text-white text-left">
            <div className="p-2 bg-white/15 rounded-xl">
              <Bot className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base">मार्गदर्शक बही सहायक (Advisor Bot)</h4>
              <p className="text-[10px] text-amber-200 font-medium tracking-wide">सक्रिय मार्गदर्शन सेवा • मालाणी सेवा संस्थान</p>
            </div>
          </div>

          {/* Chat Message Box */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30 dark:bg-stone-950/20">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}
              >
                {/* Avatar icon */}
                <div className={`p-2 h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-stone-105 border bg-white border-stone-200 text-amber-800 dark:bg-stone-850 dark:border-stone-800 dark:text-amber-400'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Text */}
                <div className="space-y-1">
                  <div className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-amber-750 bg-amber-700 text-white rounded-tr-none' 
                      : 'bg-white text-stone-800 border border-stone-100 rounded-tl-none dark:bg-stone-850 dark:border-stone-800 dark:text-stone-200'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-stone-400 block font-mono pr-1 select-none">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-[80%] mr-auto text-left">
                <div className="p-2 h-9 w-9 bg-white border border-stone-200 text-amber-800 dark:bg-stone-850 dark:border-stone-900 rounded-xl flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 bg-white border border-stone-100 rounded-2xl rounded-tl-none flex items-center gap-2 dark:bg-stone-850 dark:border-stone-800 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                  <span className="text-xs text-stone-400 font-bold tracking-wide">मार्गदर्शक बही पड़ताल कर रहा है...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form Footer */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
            className="p-3 border-t border-stone-100 dark:border-stone-850 bg-white dark:bg-stone-900 flex gap-2 shrink-0"
          >
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder="नियम या बकाया को लेकर सवाल पूछें (Ask a question)..."
              className="flex-1 px-4 py-3 rounded-xl border border-stone-202 text-xs sm:text-sm bg-[#fafafa] dark:bg-stone-950 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button 
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
