'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  SparklesIcon, 
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PaperClipIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isTable?: boolean;
}

export function AskSentinel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      // eslint-disable-next-line react-hooks/purity
      id: Date.now().toString(),
      role: 'user',
      content: text.trim()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response with a table like the screenshot
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "Certainly. Here is a summary of your Q3 software expenses compared to Q2. Overall spending increased by **12.4%**, primarily driven by new enterprise licenses.",
        isTable: true
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const onSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleSend(inputValue);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const renderMessageContent = (msg: Message) => {
    if (!msg.isTable) {
      return <span>{msg.content}</span>;
    }

    return (
      <div className="flex flex-col gap-4 w-full">
        <p>Certainly. Here is a summary of your Q3 software expenses compared to Q2. Overall spending increased by <span className="font-bold">12.4%</span>, primarily driven by new enterprise licenses.</p>
        <div className="overflow-hidden rounded-xl border border-surface-container-high w-full">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface">
              <tr className="border-b border-surface-container-high">
                <th className="px-4 py-3 text-center font-semibold text-on-surface">Category</th>
                <th className="px-4 py-3 text-center font-semibold text-on-surface">Q2 Spend</th>
                <th className="px-4 py-3 text-center font-semibold text-on-surface">Q3 Spend</th>
                <th className="px-4 py-3 text-center font-semibold text-on-surface">Δ Change</th>
              </tr>
            </thead>
            <tbody className="bg-surface">
              <tr className="border-b border-surface-container-highest">
                <td className="px-4 py-3 text-on-surface-variant">Cloud Infrastructure</td>
                <td className="px-4 py-3 text-on-surface-variant">$45,200</td>
                <td className="px-4 py-3 text-on-surface-variant">$48,100</td>
                <td className="px-4 py-3 text-error">+6.4%</td>
              </tr>
              <tr className="border-b border-surface-container-highest">
                <td className="px-4 py-3 text-on-surface-variant">CRM & Sales Tools</td>
                <td className="px-4 py-3 text-on-surface-variant">$18,500</td>
                <td className="px-4 py-3 text-on-surface-variant">$24,000</td>
                <td className="px-4 py-3 text-error">+29.7%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-on-surface-variant">Design & Creative</td>
                <td className="px-4 py-3 text-on-surface-variant">$6,400</td>
                <td className="px-4 py-3 text-on-surface-variant">$6,200</td>
                <td className="px-4 py-3 text-secondary">-3.1%</td>
              </tr>
            </tbody>
          </table>
        </div>
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
                      ? 'bg-primary text-gray-900 rounded-br-none' 
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
