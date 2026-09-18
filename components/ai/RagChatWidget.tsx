'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Trash2,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Info,
  ShieldCheck,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { askRagQuestion, RagChatMessage, RagSource } from '@/lib/rag';
import FormattedMarkdown from './FormattedMarkdown';

const QUICK_PROMPTS = [
  'What is the 50/30/20 budgeting rule?',
  'How much should I save in an emergency fund?',
  'What is the difference between debt snowball and avalanche?',
  'How do high-yield savings accounts work?'
];

export default function RagChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<RagChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<{ source: RagSource; messageId: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: RagChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const data = await askRagQuestion(query);

      const aiMessage: RagChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || "I couldn't retrieve a specific answer for your query.",
        sources: data.sources || [],
        grounded: data.grounded ?? true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('[Spendly AI] Error during RAG query:', err);
      const errorMessage: RagChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: err?.message || 'Unable to connect to Spendly AI service. Please make sure the service is running and try again.',
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedSource(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#0D1B3E] to-[#3D7FE8] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open Spendly AI Advisor"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-semibold text-sm tracking-wide">Spendly AI</span>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className={`${isExpanded ? 'w-[95vw] sm:w-[720px] md:w-[840px] h-[80vh] sm:h-[750px] max-h-[92vh]' : 'w-[90vw] sm:w-[450px] h-[600px] max-h-[82vh]'} bg-white rounded-2xl shadow-2xl border border-[#E4E7EF] flex flex-col overflow-hidden animate-slide-up transition-all duration-300`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0D1B3E] via-[#162A5E] to-[#3D7FE8] p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base leading-tight">Spendly AI Advisor</h3>
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-semibold border border-amber-300/30">
                    RAG Knowledge
                  </span>
                </div>
                <p className="text-xs text-blue-200 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Grounded Financial Wisdom
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                title={isExpanded ? "Standard view" : "Expand view"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                title="Minimize Chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3 text-[#3D7FE8] border border-blue-100 shadow-sm">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-base text-[#0D1B3E] mb-1">
                  Ask Financial Questions
                </h4>
                <p className="text-xs text-[#7B8399] max-w-xs mb-4 leading-relaxed">
                  Get instant answers grounded in curated financial education guides, budgeting models, and debt strategies.
                </p>

                <div className="w-full space-y-2 text-left">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-[#7B8399] px-1">
                    Suggested Questions
                  </p>
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="w-full p-2.5 text-xs text-[#0D1B3E] bg-white border border-[#E4E7EF] rounded-xl hover:border-[#3D7FE8] hover:bg-blue-50/50 transition-all text-left flex items-center justify-between group shadow-2xs"
                    >
                      <span>{prompt}</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#3D7FE8] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'max-w-[88%] bg-gradient-to-r from-[#0D1B3E] to-[#3D7FE8] text-white rounded-br-none'
                      : m.error
                      ? 'max-w-[88%] bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                      : 'w-full max-w-[96%] bg-white text-[#0D1B3E] border border-[#E4E7EF] rounded-bl-none'
                  }`}
                >
                  {m.sender === 'ai' && !m.error && (
                    <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-gray-100 text-[11px] font-semibold text-[#3D7FE8]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Spendly AI</span>
                      {m.grounded && (
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Grounded
                        </span>
                      )}
                    </div>
                  )}

                  {m.sender === 'user' || m.error ? (
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  ) : (
                    <FormattedMarkdown content={m.text} />
                  )}
                </div>

                {/* Sources Badges */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[88%]">
                    <span className="text-[10px] text-[#7B8399] font-medium flex items-center gap-1 mr-0.5">
                      <BookOpen className="w-3 h-3 text-[#3D7FE8]" /> Sources:
                    </span>
                    {m.sources.map((src, sIdx) => {
                      const isSelected =
                        selectedSource?.source.docId === src.docId &&
                        selectedSource?.messageId === m.id;
                      return (
                        <button
                          key={sIdx}
                          onClick={() =>
                            setSelectedSource(
                              isSelected ? null : { source: src, messageId: m.id }
                            )
                          }
                          className={`text-[10px] px-2 py-1 rounded-md border font-medium transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#3D7FE8] text-white border-[#3D7FE8] shadow-xs'
                              : 'bg-blue-50 text-[#3D7FE8] border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          <span>{src.title}</span>
                          <Info className="w-2.5 h-2.5" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Source Details Popover */}
                {selectedSource && selectedSource.messageId === m.id && (
                  <div className="mt-2 max-w-[88%] p-2.5 bg-blue-900 text-white rounded-xl text-xs space-y-1 shadow-lg animate-fade-in border border-blue-700">
                    <div className="flex items-center justify-between font-semibold border-b border-blue-800 pb-1">
                      <span className="text-amber-300">{selectedSource.source.title}</span>
                      <button
                        onClick={() => setSelectedSource(null)}
                        className="text-blue-300 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex justify-between text-[11px] text-blue-200 pt-0.5">
                      <span>Category: <strong className="text-white capitalize">{selectedSource.source.category}</strong></span>
                      <span>Score: <strong className="text-emerald-400">{(selectedSource.source.score * 100).toFixed(1)}% match</strong></span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex flex-col items-start">
                <div className="bg-white border border-[#E4E7EF] p-3.5 rounded-2xl rounded-bl-none text-xs text-[#7B8399] flex items-center gap-2 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-[#3D7FE8] animate-spin" />
                  <span>Researching financial guides...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 bg-white border-t border-[#E4E7EF] flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-[#F0F2F6] border border-[#E4E7EF] rounded-xl px-3.5 py-2.5 text-sm text-[#0D1B3E] placeholder-[#7B8399] outline-none focus:border-[#3D7FE8] focus:bg-white transition-all"
              placeholder="Ask a financial question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-[#3D7FE8] text-white hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-[#3D7FE8] transition-all shadow-sm"
              aria-label="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
