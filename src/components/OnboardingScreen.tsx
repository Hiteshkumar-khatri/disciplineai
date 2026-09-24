import React, { useState } from 'react';
import { UserSettings } from '../types';

interface OnboardingScreenProps {
  theme: 'dark' | 'light';
  onComplete: (partial: Partial<UserSettings>) => void;
}

/**
 * First-launch welcome screen. Both fields are optional — the user can skip
 * either (or jump straight into the app) without being blocked.
 */
export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ theme, onComplete }) => {
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const light = theme === 'light';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ name: name.trim(), geminiApiKey: apiKey.trim() });
  };

  const inputStyle: React.CSSProperties = {
    background: light ? '#ffffff' : '#18181a',
    border: `1px solid ${light ? '#cccccc' : '#373843'}`,
    color: light ? '#0d0d0d' : '#ffffff',
    outline: 'none',
  };
  const labelColor = light ? '#333333' : '#b0b2be';
  const hintColor = light ? '#555555' : '#8e8ea0';
  const faintColor = light ? '#888888' : '#686976';

  return (
    <div id="onboarding-screen" className="min-h-screen w-screen flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      <div
        id="onboarding-card"
        className="w-full max-w-md p-6 sm:p-7 rounded-2xl shadow-xl space-y-5 text-left"
        style={{ background: light ? '#ffffff' : '#212124' }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl bg-[#7c6af7] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[28px]">bolt</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-3" style={{ color: light ? '#111111' : '#ffffff' }}>
            Welcome to Discipline<span style={{ color: '#7c6af7' }}>AI</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: hintColor }}>
            Your daily accountability engine. Build a routine, check in with your
            coach, and protect your streak — one day at a time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: labelColor }}>
              What is your name?
              <span className="font-normal" style={{ color: faintColor }}>
                {' '}(optional)
              </span>
            </label>
            <input
              id="onboarding-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah"
              autoComplete="name"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget as HTMLInputElement).style.borderColor = '#7c6af7'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: labelColor }}>
              Paste your Groq API key
              <span className="font-normal" style={{ color: faintColor }}>
                {' '}(get one free at{' '}
                <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" style={{ color: '#7c6af7', fontWeight: 600 }}>
                  console.groq.com
                </a>
                )
              </span>
            </label>
            <input
              id="onboarding-api-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              autoComplete="off"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm font-mono"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget as HTMLInputElement).style.borderColor = '#7c6af7'}
            />
            <p className="text-[11px] mt-1" style={{ color: faintColor }}>
              Optional — skip for now and the local coach will answer. It is stored only in your
              browser and used to power the AI coach chat.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              id="onboarding-skip-btn"
              className="px-3 py-2 rounded-lg text-xs font-semibold"
              style={{
                color: hintColor,
                background: 'transparent',
                border: `1px solid ${light ? '#cccccc' : '#3a3b44'}`,
              }}
            >
              Skip for now
            </button>
            <button
              type="submit"
              id="onboarding-start-btn"
              className="px-5 py-2.5 rounded-lg text-sm font-bold"
              style={{ background: '#7c6af7', color: '#ffffff' }}
            >
              Save & Start
            </button>
          </div>
          <p className="text-center text-[11px]" style={{ color: faintColor }}>
            You can change either anytime in Settings.
          </p>
          <p className="text-center text-[11px] mt-1" style={{ color: faintColor }}>
            📱 Want it installed on your phone like an app?{' '}
            <a href="./install/" target="_blank" rel="noopener" style={{ color: '#7c6af7', fontWeight: 600 }}>
              Get the app
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};