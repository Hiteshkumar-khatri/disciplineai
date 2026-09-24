import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Task, UserSettings } from '../types';
import { askGeminiCoach } from '../geminiService';

interface AICoachPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  userSettings: UserSettings;
  tasks: Task[];
  disciplineScore: number;
  currentStreak: number;
  onOpenSettings: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AICoachPanel: React.FC<AICoachPanelProps> = ({
  messages,
  onSendMessage,
  userSettings,
  tasks,
  disciplineScore,
  currentStreak,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || isSending) return;

    setInputText('');
    setIsSending(true);
    try {
      await onSendMessage(text);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickChips = [
    { label: 'Check in', prompt: 'Check in with me. How is my discipline looking today?' },
    { label: 'Plan tomorrow', prompt: 'Help me plan tomorrow. Keep it ruthless and high-leverage.' },
    { label: 'Why am I failing', prompt: 'Why am I failing to execute my daily schedule consistently?' },
    { label: 'Motivate me', prompt: "I'm feeling lazy and looking for excuses. Motivate me." },
  ];

  return (
    <div
      id="ai-coach-panel"
      className={`fixed lg:static inset-y-0 right-0 z-40 w-full sm:w-96 lg:w-88 xl:w-96 bg-[#1a1a1c] border-l border-[#2d2e33] flex flex-col transition-transform duration-200 ease-in-out ${
        isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Panel Header */}
      <div className="p-3.5 border-b border-[#2d2e33] flex items-center justify-between bg-[#1f1f22]">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-[#2b2b30] border border-[#3e3f48] flex items-center justify-center text-[#7c6af7]">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1f1f22]" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Discipline Coach</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#7c6af7]/20 text-[#7c6af7] font-mono">
                Groq Cloud
              </span>
            </div>
            <div className="text-[11px] text-[#8e8ea0]">Direct • Strict • Action First</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="coach-settings-shortcut-btn"
            onClick={onOpenSettings}
            title="Configure your API key"
            className="p-1 text-[#8e8ea0] hover:text-white rounded hover:bg-[#2c2d33] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">key</span>
          </button>
          <button
            id="close-coach-mobile-btn"
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-[#8e8ea0] hover:text-white rounded hover:bg-[#2c2d33]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* Notice bar if API key is not entered */}
      {!userSettings.geminiApiKey && (
        <div className="bg-[#242429] px-3 py-1.5 border-b border-[#2f3037] flex items-center justify-between text-[11px]">
          <span className="text-[#9ca3af] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#7c6af7]">info</span>
            Local engine active
          </span>
          <button
            onClick={onOpenSettings}
            className="text-[#7c6af7] hover:underline font-semibold"
          >
            Add API Key →
          </button>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="p-2.5 rounded-lg bg-[#25252b] border border-[#35363e] text-[12px] text-[#b0b2c0] font-mono leading-relaxed"
              >
                <div className="flex items-center gap-1.5 text-[#7c6af7] font-semibold text-[11px] mb-1">
                  <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                  <span>SYSTEM AUDIT</span>
                  <span className="ml-auto text-[10px] text-[#8e8ea0]">{msg.timestamp}</span>
                </div>
                <div className="whitespace-pre-line">{msg.text}</div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-[#747582] mb-1 px-1">
                <span>{isUser ? userSettings.name || 'You' : 'Discipline Coach'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#7c6af7] text-white rounded-br-xs shadow-xs'
                    : 'bg-[#26262a] text-[#ededed] border border-[#34353c] rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex flex-col items-start">
            <div className="text-[10px] text-[#747582] mb-1 px-1">Discipline Coach</div>
            <div className="bg-[#26262a] text-[#8e8ea0] border border-[#34353c] rounded-2xl rounded-bl-xs px-3.5 py-2 text-xs flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] animate-pulse delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] animate-pulse delay-200" />
              <span className="ml-1 text-[11px]">Evaluating your commitment...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 pt-2 pb-1 border-t border-[#2a2b30] bg-[#1a1a1c]">
        <div className="text-[10px] uppercase font-semibold text-[#666774] mb-1.5 tracking-wider">
          Quick Accountability Prompts
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              id={`quick-chip-${idx}`}
              onClick={() => handleSend(chip.prompt)}
              disabled={isSending}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#26262a] hover:bg-[#323339] text-[#b4b7c4] hover:text-white border border-[#34353d] transition-colors whitespace-nowrap active:scale-98 disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Field */}
      <div className="p-3 bg-[#1f1f22] border-t border-[#2d2e33]">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            id="coach-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type anything (e.g. 'I'm feeling lazy')..."
            disabled={isSending}
            className="w-full bg-[#29292e] text-white text-xs rounded-xl pl-3.5 pr-10 py-2.5 border border-[#3a3b44] focus:outline-hidden focus:border-[#7c6af7] placeholder-[#6f707f] disabled:opacity-60"
          />
          <button
            id="send-coach-msg-btn"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isSending}
            className="absolute right-1.5 p-1.5 rounded-lg bg-[#7c6af7] hover:bg-[#6e5ce6] text-white disabled:opacity-30 transition-colors flex items-center justify-center"
            aria-label="Send message"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
          </button>
        </div>
        <div className="mt-1.5 text-[10px] text-center text-[#686976]">
          AI Coach keeps responses under 3 sentences. Direct action only.
        </div>
      </div>
    </div>
  );
};
