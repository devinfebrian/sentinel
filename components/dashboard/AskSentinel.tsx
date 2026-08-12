'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  SparklesIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { askApi, ApiError } from '@/lib/services/api';
import { useAuthStore } from '@/lib/stores/auth.store';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  warning?: string;
  unsourcedFigures?: string[];
}

// Minimal **bold** support — the answer text carries the model's emphasis.
function renderAnswer(text: string) {
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i}>{part}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

// crypto.randomUUID() rather than a module-level counter — a counter resets
// on Fast Refresh while existing message state survives it, producing
// duplicate keys against messages already in the list.
const createMessageId = () => crypto.randomUUID();

// Inlined (rather than <img src="/knight-svgrepo-com.svg">) so the strokes
// can use currentColor — the source file hardcodes stroke="#000000", which
// can't be recolored or theme-adapted from outside an <img>.
function KnightIcon({ className, animateEyes = false }: { className?: string; animateEyes?: boolean }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M103.948 189.007C122.979 146.166 174.912 106.379 225.953 118.967C337.274 146.418 292.742 318.738 178.953 308.374C119.948 303 90.022 208.667 105.949 192.952C126.975 172.215 181.401 166.48 200.176 166.48C219.28 166.48 267.7 175.748 282.957 187.033C289.496 191.872 246.484 201.828 240.954 202.82C198.208 210.485 161.608 212.189 119.948 199.86" stroke="currentColor" strokeOpacity="0.9" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <g className={animateEyes ? 'animate-knight-eyes' : undefined}>
        <path d="M181.472 190.628C180.808 185.073 181.738 179.593 182.57 174.201" stroke="currentColor" strokeOpacity="0.9" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M210.059 189.891C208.932 183.937 209.453 178.421 208.932 174.729" stroke="currentColor" strokeOpacity="0.9" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path opacity="0.503384" d="M165.817 55.4552C188.059 88.8544 185.092 123.901 191.955 118.596C202.113 110.743 199.839 94.0062 202.009 66.2158C202.993 53.6086 202.993 43.87 202.009 37C202.638 64.5934 202.974 78.8407 203.016 79.742C203.049 80.4493 203.205 91.9041 203.485 114.106C207.245 114.106 200 114.106 217.399 88.0728C228.597 71.3186 229.553 69.1864 234.184 57.399" stroke="currentColor" strokeOpacity="0.9" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M150 300C65 300 69.7204 333.085 58 363" stroke="currentColor" strokeOpacity="0.9" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M260.771 292.24C323.999 292.24 331.999 338 338 363" stroke="currentColor" strokeOpacity="0.9" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Colors are hardcoded (not the on-primary-container token) so this avatar
// looks identical in light and dark mode, unlike the rest of the theme.
function AiAvatar({ isGenerating = false }: { isGenerating?: boolean }) {
  return (
    <div className="w-12 h-12 rounded-full bg-white text-[#687710] border-2 border-current flex items-center justify-center shrink-0 mr-3 mt-1 overflow-hidden">
      <KnightIcon className="h-14 w-14" animateEyes={isGenerating} />
    </div>
  );
}

export function AskSentinel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastQuestionRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, error]);

  const runAsk = async (question: string) => {
    if (!accessToken) return;

    setError(null);
    setIsTyping(true);

    try {
      const res = await askApi(question, accessToken);
      setMessages(prev => [
        ...prev,
        {
          id: createMessageId(),
          role: 'ai',
          content: res.data.answer,
          warning: res.data.warning,
          unsourcedFigures: res.data.unsourced_figures ?? [],
        },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping || !accessToken) return;

    const userMsg: Message = {
      id: createMessageId(),
      role: 'user',
      content: trimmed,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    lastQuestionRef.current = trimmed;
    runAsk(trimmed);
  };

  const handleRetry = () => {
    if (lastQuestionRef.current && !isTyping) {
      runAsk(lastQuestionRef.current);
    }
  };

  const onSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleSend(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.role === 'user') {
      return <span className="whitespace-pre-wrap">{msg.content}</span>;
    }

    return (
      <div className="flex flex-col gap-3 w-full">
        <p className="whitespace-pre-wrap">{renderAnswer(msg.content)}</p>

        {msg.warning && (
          <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-secondary-container/70 px-3 py-1 text-[11px] font-semibold text-on-secondary-container">
            <ExclamationTriangleIcon aria-hidden="true" className="h-3.5 w-3.5" />
            {msg.warning}
          </div>
        )}

        {msg.unsourcedFigures && msg.unsourcedFigures.length > 0 && (
          <div className="rounded-lg border border-error/30 bg-error-container/20 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ExclamationTriangleIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-error" />
              <span className="font-label-sm text-label-sm font-bold text-error">
                Some numbers could not be verified
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              The following figures appear in the answer but did not come from the query results.
              Treat them as unverified:
            </p>
            <ul className="mt-1.5 flex flex-col gap-0.5">
              {msg.unsourcedFigures.map((figure, i) => (
                <li key={i} className="font-body-sm text-body-sm text-error">
                  &middot; {figure}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pr-2 mb-4 custom-scrollbar flex flex-col relative">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in my-auto h-full pb-10">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-6">
              <SparklesIcon className="w-8 h-8 text-on-primary-container" />
            </div>
            <h3 className="text-2xl font-semibold text-on-surface mb-3">How can I assist you today?</h3>
            <p className="text-on-surface-variant max-w-md mx-auto text-sm leading-relaxed">
              I can help analyze spending or assess vendor risks based on your latest data.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && <AiAvatar />}

                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 font-body-sm ${
                    msg.role === 'user'
                      ? 'bg-primary-fixed text-on-primary-fixed rounded-br-none'
                      : 'bg-surface border border-surface-container-high text-on-surface shadow-sm'
                  }`}
                >
                  {renderMessageContent(msg)}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start items-center">
                <AiAvatar isGenerating />
                <div className="bg-surface border border-surface-container-high rounded-2xl px-5 py-4 shadow-sm flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start items-start">
                <AiAvatar />
                <div className="max-w-[85%] rounded-2xl border border-error/30 bg-error-container/20 px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ExclamationTriangleIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-error" />
                    <span className="font-label-sm text-label-sm font-bold text-error">
                      Could not get an answer
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface whitespace-pre-wrap">{error}</p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-surface-container-high bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container"
                  >
                    <ArrowPathIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    Try again
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-auto shrink-0 flex flex-col">
        {messages.length === 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {['Summarize expenses', 'Vendor risk analysis'].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="px-4 py-1.5 rounded-full bg-surface-container-highest hover:bg-surface-container-high text-xs text-on-surface-variant transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-center w-full bg-surface border border-surface-container-high rounded-2xl p-2 shadow-sm focus-within:border-primary transition-colors">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your finances..."
            className="flex-1 bg-transparent border-none px-3 font-body-sm text-on-surface focus:outline-none focus:ring-0"
          />

          <button
            onClick={onSubmit}
            disabled={!inputValue.trim() || isTyping}
            className="ml-2 p-3 rounded-xl bg-primary-container text-on-primary-container hover:brightness-110 disabled:opacity-80 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center mt-3 mb-1">
          <span className="text-[10px] text-on-surface-variant/70">
            AI can make mistakes. Verify important financial data.
          </span>
        </div>
      </div>
    </div>
  );
}
