import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, Trash2, MinusCircle } from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { usePreferences } from '../context/PreferencesContext';
import { buildShopContext, getAssistantReply } from '../utils/aiChatEngine';

const CHAT_STORAGE_KEY = 'khatabook_ai_chat_history_v1';

const QUICK_CHIPS = [
  'Today\'s gold rate 💰',
  'Is gold going up or down? 📈',
  'Expected price next week 🔮',
  'Who owes me the most? 🧾',
  'Low stock items? ⚠️'
];

/** Minimal markdown: **bold**, bullet lines, emoji kept as-is */
function renderRich(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <React.Fragment key={i}>
        {parts.map((p, j) => {
          if (p.startsWith('**') && p.endsWith('**')) {
            return <strong key={j} className="font-extrabold">{p.slice(2, -2)}</strong>;
          }
          return <React.Fragment key={j}>{p}</React.Fragment>;
        })}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export function AiChatbot() {
  const ledger = useLedger();
  const { preferences } = usePreferences();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return [{
      id: 'welcome',
      role: 'assistant',
      text: `🙏 Namaste! I'm **${preferences.assistantName || 'Jewel AI'}** — your shop's AI assistant.\n\nAsk me about today's rates, price trends, forecasts, customer balances or stock.`,
      ts: new Date().toISOString()
    }];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Persist chat for the session
  useEffect(() => {
    try { sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch (e) { /* ignore */ }
  }, [messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 150); }
  }, [isOpen]);

  const sendQuestion = useCallback(async (rawQuestion) => {
    const question = (rawQuestion ?? input).trim();
    if (!question || isTyping) return;

    const userMsg = { id: `u_${Date.now()}`, role: 'user', text: question, ts: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const ctx = buildShopContext(ledger, preferences);
      const { text } = await getAssistantReply(question, ctx, preferences, { customers: ledger.customers });
      setMessages(prev => [...prev, { id: `a_${Date.now()}`, role: 'assistant', text, ts: new Date().toISOString() }]);
      if (!isOpen) setUnread(u => u + 1);
    } catch (err) {
      console.warn('[chatbot] reply failed', err);
      setMessages(prev => [...prev, { id: `e_${Date.now()}`, role: 'assistant', text: '⚠️ Something went wrong while thinking. Please try again.', ts: new Date().toISOString() }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, ledger, preferences, isOpen]);

  const clearChat = () => {
    setMessages([{ id: 'welcome2', role: 'assistant', text: `🧹 Fresh start! What would you like to know?`, ts: new Date().toISOString() }]);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`no-print fixed z-50 bottom-5 right-5 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 active:scale-90 accent-grad accent-glow ${isOpen ? 'rotate-90' : 'hover:scale-105'}`}
        title={`Ask ${preferences.assistantName || 'Jewel AI'}`}
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
            {unread}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="no-print fixed z-50 bottom-24 right-4 sm:right-5 w-[calc(100vw-2rem)] sm:w-96 max-h-[70vh] flex flex-col rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900 animate-fade-in"
          style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >

          {/* Header */}
          <div className="accent-grad px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-white leading-tight">
                  {preferences.assistantName || 'Jewel AI'}
                </p>
                <p className="text-[10px] font-semibold text-white/80 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse inline-block"></span>
                  <span>
                    {preferences.chatProvider !== 'local' && preferences.chatApiKey
                      ? `${preferences.chatProvider === 'gemini' ? 'Gemini' : 'OpenAI'} connected`
                      : 'Local brain • works offline'}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors" title="Clear chat">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors" title="Minimise">
                <MinusCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3 bg-slate-50 dark:bg-slate-950 min-h-[220px]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md'
                }`}>
                  {m.role === 'assistant' && (
                    <div className="flex items-center space-x-1 mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      <Bot className="w-3 h-3" />
                      <span>{preferences.assistantName || 'Jewel AI'}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{renderRich(m.text)}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-bl-md flex items-center space-x-1.5">
                  <span className="typing-dot w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
                  <span className="typing-dot w-2 h-2 rounded-full bg-slate-400 inline-block" style={{ animationDelay: '0.15s' }}></span>
                  <span className="typing-dot w-2 h-2 rounded-full bg-slate-400 inline-block" style={{ animationDelay: '0.3s' }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick chips */}
          <div className="px-3 pt-2 pb-1 bg-slate-50 dark:bg-slate-950 flex gap-1.5 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => sendQuestion(chip.replace(/[^\p{L}\p{N}?' ]/gu, '').trim())}
                disabled={isTyping}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendQuestion(); }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 shrink-0"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about rates, trends, ledger…"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-xl accent-bg flex items-center justify-center text-white shadow-md active:scale-90 disabled:opacity-40 transition-all shrink-0"
            >
              <Send className="w-[18px] h-[18px]" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
