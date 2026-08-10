'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  SparklesIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PaperClipIcon,
  CpuChipIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { askSentinelApi } from '@/lib/services/ask';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  dataRange?: string;
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

// Monotonic id source. Date.now() is impure per react-hooks/purity, and ids
// only need to be unique within the list.
let nextMessageId = 0;
const createMessageId = () => `msg-${nextMessageId++}`;

export function AskSentinel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastQuestionRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, error]);

  const runAsk = async (question: string) => {
    setError(null);
    setIsTyping(true);

    try {
      const res = await askSentinelApi(question);
      setMessages(prev => [
        ...prev,
        {
          id: createMessageId(),
          role: 'ai',
          content: res.answer,
          dataRange: res.data_range,
          unsourcedFigures: res.unsourced_figures ?? [],
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

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

        {msg.dataRange && (
          <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-secondary-container/70 px-3 py-1 text-[11px] font-semibold text-on-secondary-container">
            <CalendarDaysIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Data range: {msg.dataRange}
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
    <div className="flex flex-col h-full w-full max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-4 shrink-0">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Financial Assistant</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-xs text-on-surface-variant">Online</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <button className="hover:text-on-surface transition-colors p-1"><MagnifyingGlassIcon className="w-5 h-5" /></button>
          <button className="hover:text-on-surface transition-colors p-1"><EllipsisVerticalIcon className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pr-2 mb-4 custom-scrollbar flex flex-col relative">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in my-auto h-full pb-10">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <SparklesIcon className="w-8 h-8 text-on-surface" />
            </div>
            <h3 className="text-2xl font-semibold text-on-surface mb-3">How can I assist you today?</h3>
            <p className="text-on-surface-variant max-w-md mx-auto text-sm leading-relaxed">
              I can help analyze spending, generate financial reports, or assess vendor risks based on your latest data.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 mr-3 mt-1">
                    <CpuChipIcon className="w-4 h-4 text-on-surface" />
                  </div>
                )}

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
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 mr-3">
                  <CpuChipIcon className="w-4 h-4 text-on-surface" />
                </div>
                <div className="bg-surface border border-surface-container-high rounded-2xl px-5 py-4 shadow-sm flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start items-start">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 mr-3 mt-1">
                  <CpuChipIcon className="w-4 h-4 text-on-surface" />
                </div>
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
            {['Summarize expenses', 'Vendor risk analysis', 'Generate Q3 report'].map(suggestion => (
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
          <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <PaperClipIcon className="w-5 h-5" />
          </button>

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
            className="ml-2 p-3 rounded-xl bg-primary text-gray-900 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
