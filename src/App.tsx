import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Send, 
  Calendar, 
  Info, 
  ChevronRight,
  ShieldCheck,
  Flag,
  HelpCircle,
  Menu,
  X,
  Zap,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { askElectionAssistant } from './services/gemini';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm your Election Education Assistant. I can help you with registration deadlines, polling locations, or understanding your ballot. What's on your mind today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', label: 'Check registration status', completed: false },
    { id: '2', label: 'Register to vote', completed: false },
    { id: '3', label: 'Find your polling place', completed: false },
    { id: '4', label: 'Research candidates/issues', completed: false },
    { id: '5', label: 'Make a voting plan', completed: false },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const response = await askElectionAssistant(userMessage, history);
      setMessages(prev => [...prev, { role: 'model', content: response || "I'm sorry, I couldn't process that request." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please make sure your Gemini API key is configured correctly." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const suggestedQuestions = [
    "How do I register to vote?",
    "What are the deadlines for mail-in ballots?",
    "Can I register on election day?",
    "What ID do I need to vote?"
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Mobile Toggle */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-full shadow-md border border-slate-200 text-slate-600"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className="fixed md:relative z-40 w-80 h-full bg-white border-r border-slate-200 flex flex-col shadow-xl md:shadow-none"
          >
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <Flag size={22} fill="currentColor" />
                  </div>
                  <h1 className="font-bold text-xl tracking-tight text-slate-900">VoteGuide AI</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Voter Checklist</h2>
                <div className="space-y-1.5">
                  {checklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-xl border transition-all group",
                        item.completed 
                          ? "bg-slate-50 border-slate-100 opacity-60" 
                          : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
                      )}
                    >
                      {item.completed ? (
                        <CheckCircle2 size={18} className="text-indigo-600" />
                      ) : (
                        <Circle size={18} className="text-slate-300 group-hover:text-indigo-400" />
                      )}
                      <span className={cn(
                        "text-sm font-medium transition-all",
                        item.completed ? "text-slate-400 line-through" : "text-slate-700"
                      )}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-4">Important Info</h2>
                <div className="space-y-3">
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                    <div className="text-[10px] font-bold text-indigo-700 mb-1 uppercase tracking-wider">ELECTION DAY</div>
                    <div className="text-xl font-black text-indigo-900">Nov 3, 2026</div>
                    <div className="text-[10px] text-indigo-600 mt-2 font-semibold">MIDTERM ELECTIONS</div>
                  </div>
                  
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                    <div className="text-[10px] font-bold text-emerald-700 mb-1 uppercase tracking-wider">STATUS</div>
                    <div className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                       <ShieldCheck size={14} /> Ready to Assist
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100">
              <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-start gap-3">
                <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Official data from <br/> 
                  <a href="https://vote.gov" target="_blank" className="text-white underline font-bold hover:text-indigo-300 transition-colors">vote.gov</a>
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-50">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Gemini 1.5 Flash
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-10 scrollbar-hide">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex justify-center mb-8">
              <p className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-4 py-1 rounded-full uppercase tracking-widest">Election Assistant Console</p>
            </div>

            {messages.map((message, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={index}
                className={cn(
                  "flex gap-4",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105",
                  message.role === 'user' 
                    ? "bg-slate-900 text-white font-bold text-[10px]" 
                    : "bg-indigo-100 text-indigo-600"
                )}>
                  {message.role === 'user' ? "ME" : <Zap size={14} fill="currentColor" />}
                </div>
                <div className={cn(
                  "max-w-[85%] px-5 py-4 shadow-sm border leading-relaxed",
                  message.role === 'user' 
                    ? "bg-indigo-600 border-indigo-700 text-white rounded-2xl rounded-tr-none" 
                    : "bg-white border-slate-100 text-slate-800 rounded-2xl rounded-tl-none"
                )}>
                  <div className={cn(
                    "prose prose-sm max-w-none text-sm",
                    message.role === 'user' ? "prose-p:text-white" : "prose-p:text-slate-600"
                  )}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Zap size={14} fill="currentColor" />
                </div>
                <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto">
            {/* Suggested Tags */}
            {messages.length < 3 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 border border-slate-200 px-4 py-2 rounded-lg transition-all text-slate-500 flex items-center gap-2"
                  >
                    <HelpCircle size={10} /> {q}
                  </button>
                ))}
              </div>
            )}

            <div className="relative group bg-slate-50 border border-slate-200 rounded-xl p-2 px-4 shadow-inner flex items-center gap-4 transition-all focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100/50">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about registration, deadlines, or requirements..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 text-slate-800 placeholder:text-slate-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all shadow-md",
                  input.trim() 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-100" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-center text-[9px] text-slate-400 mt-4 uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 opacity-80 pl-2">
              <ShieldCheck size={10} /> Secured Election Advisory Console
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
