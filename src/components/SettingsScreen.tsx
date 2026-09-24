import React, { useState } from 'react';
import { UserSettings } from '../types';

interface SettingsScreenProps {
  userSettings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetData: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userSettings,
  onUpdateSettings,
  onResetData,
  theme,
  onToggleTheme,
}) => {
  const [name, setName] = useState(userSettings.name);
  const [apiKey, setApiKey] = useState(userSettings.geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(userSettings.soundEnabled);
  const [autoDailyReport, setAutoDailyReport] = useState(userSettings.autoDailyReport);
  const [notificationsEnabled, setNotificationsEnabled] = useState(userSettings.notificationsEnabled);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      name: name.trim(),
      geminiApiKey: apiKey.trim(),
      soundEnabled,
      autoDailyReport,
      notificationsEnabled,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div id="settings-screen" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-[#2d2e33]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#7c6af7] text-3xl">tune</span>
          <span>DisciplineAI Settings</span>
        </h1>
        <p className="text-sm text-[#8e8ea0] mt-1">
          Configure personal preferences, AI Coach credentials, and data persistence.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Preferences updated and safely preserved in local storage.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-5 rounded-xl bg-[#202023] border border-[#2e2f34] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c6af7]">person</span>
            <span>User Profile</span>
          </h2>
          <div>
            <label className="block text-xs font-semibold text-[#b0b2be] mb-1.5">
              Your Name
            </label>
            <input
              id="settings-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Hunter"
              className="w-full bg-[#18181a] border border-[#373843] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-[#7c6af7]"
            />
            <p className="text-[11px] text-[#717382] mt-1">
              Used for daily greetings and coaching personalization.
            </p>
          </div>
        </div>

        {/* Groq API Key Card */}
        <div className="p-5 rounded-xl bg-[#202023] border border-[#2e2f34] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7c6af7]">key</span>
              <span>AI Coach API Connection</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#272635] text-[#a294fc] border border-[#3f3b5c] font-mono font-semibold">
              groq-api
            </span>
          </div>

          <p className="text-xs text-[#8e8ea0] leading-relaxed">
            Enter your Groq API key to power your AI accountability coach (get one free at{' '}
            <a
              href="https://console.groq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#7c6af7] hover:underline font-semibold"
            >
              console.groq.com
            </a>
            ). The key is saved strictly in your browser's{' '}
            <code className="text-[#a294fc]">localStorage</code> and is never sent to any secondary server.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#b0b2be] mb-1.5">
              Groq API Key
            </label>
            <div className="relative flex items-center">
              <input
                id="settings-gemini-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full bg-[#18181a] border border-[#373843] rounded-lg pl-3.5 pr-12 py-2.5 text-sm text-white font-mono focus:outline-hidden focus:border-[#7c6af7] placeholder-[#666775]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-[#8e8ea0] hover:text-white text-xs p-1"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showKey ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className={apiKey ? 'text-emerald-400 font-medium' : 'text-[#8e8ea0]'}>
                {apiKey ? '✓ Groq Key configured' : 'No key provided — local coach rules active'}
              </span>
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7c6af7] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Get a Groq API Key</span>
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </a>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#18181a] border border-[#2b2c35] text-[11px] text-[#8e8ea0] space-y-1">
            <div className="text-white font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#7c6af7]">terminal</span>
              <span>System Prompt Enforcement:</span>
            </div>
            <p className="italic text-[#b3b5c4]">
              "You are a strict but supportive discipline coach. Keep responses under 3 sentences. Be direct, no fluff. Focus on action not motivation."
            </p>
          </div>
        </div>

        {/* Notification Preferences Card */}
        <div className="p-5 rounded-xl bg-[#202023] border border-[#2e2f34] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c6af7]">notifications</span>
            <span>Notification & Audio Preferences</span>
          </h2>

          <div className="space-y-3 divide-y divide-[#2a2b30] text-xs">
            {/* Theme Mode Appearance Option */}
            {onToggleTheme && (
              <div className="flex items-center justify-between pb-1">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        theme === 'light' ? 'text-amber-500 fill' : 'text-[#7c6af7]'
                      }`}
                    >
                      {theme === 'light' ? 'light_mode' : 'dark_mode'}
                    </span>
                    <span>Appearance: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  <div className="text-[#8e8ea0] text-[11px]">
                    Switch between dark and light color themes (persisted in localStorage)
                  </div>
                </div>
                <button
                  type="button"
                  id="settings-theme-toggle-btn"
                  onClick={onToggleTheme}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                    theme === 'light' ? 'bg-[#7c6af7]' : 'bg-[#373841]'
                  }`}
                  aria-label="Toggle theme mode"
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white flex items-center justify-center transition-transform ${
                      theme === 'light' ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[10px] text-[#242427] fill leading-none">
                      {theme === 'light' ? 'light_mode' : 'dark_mode'}
                    </span>
                  </span>
                </button>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Audio Feedback</div>
                <div className="text-[#8e8ea0] text-[11px]">Subtle chime when checking off discipline tasks</div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                  soundEnabled ? 'bg-[#7c6af7]' : 'bg-[#373841]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">11:59 PM Daily Audit to Chat</div>
                <div className="text-[#8e8ea0] text-[11px]">
                  Automatically generate final daily score review in AI Coach chat
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoDailyReport(!autoDailyReport)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                  autoDailyReport ? 'bg-[#7c6af7]' : 'bg-[#373841]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    autoDailyReport ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Task Accountability Prompts</div>
                <div className="text-[#8e8ea0] text-[11px]">
                  Immediate coach commentary on task completion or miss
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                  notificationsEnabled ? 'bg-[#7c6af7]' : 'bg-[#373841]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            id="reset-all-data-btn"
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset All Data</span>
          </button>

          <button
            type="submit"
            id="save-settings-btn"
            className="px-6 py-2.5 rounded-lg bg-[#7c6af7] hover:bg-[#6c58ef] text-white text-xs font-bold transition-colors shadow-xs"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showConfirmReset && (
        <div
          id="confirm-reset-modal-backdrop"
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowConfirmReset(false)}
        >
          <div
            id="confirm-reset-modal"
            className="bg-[#212124] border border-[#3f2a2a] rounded-xl w-full max-w-sm p-5 space-y-4 shadow-xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 text-rose-400">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="text-base font-bold text-white">Reset All Discipline Data?</h3>
            </div>
            <p className="text-xs text-[#a3a5b6] leading-relaxed">
              This action will erase all task history, streaks, and custom messages from your browser storage and reset the board to default baseline. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2f2424]">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-2 rounded-lg bg-[#2b2c33] text-xs font-semibold text-[#b8bac7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
