import React from 'react';
import { UserSettings } from '../types';

interface SidebarProps {
  currentScreen: 'today' | 'reports' | 'streaks' | 'settings';
  onSelectScreen: (screen: 'today' | 'reports' | 'streaks' | 'settings') => void;
  userSettings: UserSettings;
  currentStreak: number;
  disciplineScore: number;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  userSettings,
  currentStreak,
  disciplineScore,
  isOpenOnMobile,
  onCloseMobile,
  theme,
  onToggleTheme,
}) => {
  const navItems = [
    {
      id: 'today' as const,
      label: 'Today',
      icon: 'calendar_today',
      badge: `${disciplineScore}%`,
    },
    {
      id: 'reports' as const,
      label: 'Reports',
      icon: 'monitoring',
    },
    {
      id: 'streaks' as const,
      label: 'Streaks',
      icon: 'local_fire_department',
      badge: `${currentStreak}d`,
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: 'tune',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenOnMobile && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 border-r flex flex-col transition-transform duration-200 ease-in-out ${
          theme === 'light' ? 'bg-[#f5f5f5] border-[#e0e0e0]' : 'bg-[#1e1e20] border-[#2d2e33]'
        } ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            theme === 'light' ? 'border-[#e0e0e0]' : 'border-[#2d2e33]'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#7c6af7] flex items-center justify-center text-white font-bold shadow-xs">
              <span className="material-symbols-outlined text-[20px] text-white">bolt</span>
            </div>
            <div>
              <div
                className={`text-base font-bold tracking-tight flex items-center gap-1.5 ${
                  theme === 'light' ? 'text-[#111111]' : 'text-white'
                }`}
              >
                Discipline<span className="text-[#7c6af7]">AI</span>
              </div>
              <div
                className={`text-[11px] font-medium tracking-wide ${
                  theme === 'light' ? 'text-[#555555]' : 'text-[#8e8ea0]'
                }`}
              >
                Accountability Engine
              </div>
            </div>
          </div>
          <button
            id="close-sidebar-mobile-btn"
            onClick={onCloseMobile}
            className={`lg:hidden p-1 rounded-md ${
              theme === 'light'
                ? 'text-[#444444] hover:text-[#0d0d0d]'
                : 'text-[#8e8ea0] hover:text-white'
            }`}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div
            className={`px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider ${
              theme === 'light' ? 'text-[#555555]' : 'text-[#6c6d7a]'
            }`}
          >
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => {
                  onSelectScreen(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? theme === 'light'
                      ? 'bg-[#ede9ff] text-[#5b4fcf] font-semibold'
                      : 'bg-[#29292e] text-white border border-[#7c6af7]/40'
                    : theme === 'light'
                    ? 'text-[#333333] hover:text-[#0d0d0d] hover:bg-[#ebebeb]'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[#252528]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive
                        ? theme === 'light'
                          ? 'text-[#5b4fcf]'
                          : 'text-[#7c6af7]'
                        : theme === 'light'
                        ? 'text-[#444444]'
                        : 'text-[#8e8ea0]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? theme === 'light'
                          ? 'bg-[#dcd5fe] text-[#5b4fcf]'
                          : 'bg-[#7c6af7]/20 text-[#7c6af7]'
                        : theme === 'light'
                        ? 'bg-[#e5e5e5] text-[#555555]'
                        : 'bg-[#2b2b30] text-[#8e8ea0]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Light / Dark Mode Toggle Switch */}
        <div
          id="theme-mode-toggle-card"
          className={`mx-3 mb-2.5 p-2.5 rounded-lg border flex items-center justify-between shadow-xs select-none ${
            theme === 'light'
              ? 'bg-[#ffffff] border-[#e0e0e0]'
              : 'bg-[#242427] border-[#2e2f34]'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span
              className={`material-symbols-outlined text-[18px] transition-colors ${
                theme === 'light' ? 'text-amber-500 fill' : 'text-[#7c6af7]'
              }`}
            >
              {theme === 'light' ? 'light_mode' : 'dark_mode'}
            </span>
            <div className="flex flex-col">
              <span
                className={`text-xs font-semibold leading-tight ${
                  theme === 'light' ? 'text-[#111111]' : 'text-white'
                }`}
              >
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </span>
              <span
                className={`text-[10px] leading-tight ${
                  theme === 'light' ? 'text-[#555555]' : 'text-[#8e8ea0]'
                }`}
              >
                {theme === 'light' ? 'Bright theme' : 'Eye-saver theme'}
              </span>
            </div>
          </div>

          {/* Switch Button with Sun & Moon Icons */}
          <button
            id="theme-toggle-switch-btn"
            type="button"
            role="switch"
            aria-checked={theme === 'light'}
            aria-label={`Toggle theme (currently ${theme} mode)`}
            onClick={onToggleTheme}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-hidden ${
              theme === 'light' ? 'bg-[#7c6af7]' : 'bg-[#373841]'
            }`}
          >
            {/* Background mini icons inside switch track */}
            <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none text-[10px]">
              <span className="material-symbols-outlined text-[11px] text-[#242427] fill">
                dark_mode
              </span>
              <span className="material-symbols-outlined text-[11px] text-white/90 fill">
                light_mode
              </span>
            </div>

            {/* Moving Thumb Slider */}
            <span
              className={`pointer-events-none relative z-10 inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                theme === 'light' ? 'translate-x-7' : 'translate-x-0'
              }`}
            >
              {theme === 'light' ? (
                <span className="material-symbols-outlined text-[14px] text-amber-500 fill leading-none">
                  light_mode
                </span>
              ) : (
                <span className="material-symbols-outlined text-[14px] text-[#7c6af7] fill leading-none">
                  dark_mode
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Quick Streak Summary Box */}
        <div
          id="sidebar-streak-box"
          className={`mx-3 mb-3 p-3 rounded-lg border ${
            theme === 'light'
              ? 'bg-[#ffffff] border-[#e0e0e0]'
              : 'bg-[#242427] border-[#2e2f34]'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={theme === 'light' ? 'text-[#555555]' : 'text-[#8e8ea0]'}>Today's Target</span>
            <span className={`font-semibold ${theme === 'light' ? 'text-[#111111]' : 'text-white'}`}>
              ≥ 70% for streak
            </span>
          </div>
          <div
            className={`w-full rounded-full h-1.5 overflow-hidden ${
              theme === 'light' ? 'bg-[#e0e0e0]' : 'bg-[#1b1b1c]'
            }`}
          >
            <div
              className={`h-full transition-all duration-300 ${
                disciplineScore >= 70 ? 'bg-[#7c6af7]' : 'bg-[#e056fd]'
              }`}
              style={{ width: `${Math.min(disciplineScore, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className={theme === 'light' ? 'text-[#555555]' : 'text-[#9ca3af]'}>
              Current: {disciplineScore}%
            </span>
            <span
              className={`font-semibold ${
                disciplineScore >= 70
                  ? 'text-[#7c6af7]'
                  : theme === 'light'
                  ? 'text-[#b45309]'
                  : 'text-[#e58e26]'
              }`}
            >
              {disciplineScore >= 70 ? 'Qualifying ✓' : 'Needs Action'}
            </span>
          </div>
        </div>

        {/* User Profile at bottom */}
        <div
          className={`p-3 border-t ${
            theme === 'light'
              ? 'border-[#e0e0e0] bg-[#f5f5f5]'
              : 'border-[#2d2e33] bg-[#1a1a1c]'
          }`}
        >
          <button
            id="user-profile-settings-btn"
            onClick={() => {
              onSelectScreen('settings');
              onCloseMobile();
            }}
            className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors text-left group ${
              theme === 'light' ? 'hover:bg-[#ebebeb]' : 'hover:bg-[#252528]'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm font-semibold group-hover:border-[#7c6af7] ${
                theme === 'light'
                  ? 'bg-[#e8e8ea] border-[#d0d0d0] text-[#111111]'
                  : 'bg-[#2c2d36] border-[#3e404c] text-white'
              }`}
            >
              {userSettings.name
                ? userSettings.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-xs font-semibold truncate ${
                  theme === 'light' ? 'text-[#111111]' : 'text-white'
                }`}
              >
                {userSettings.name || 'New Member'}
              </div>
              <div
                className={`text-[11px] flex items-center gap-1 ${
                  theme === 'light' ? 'text-[#555555]' : 'text-[#8e8ea0]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7]"></span>
                <span>Active Track</span>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-[18px] ${
                theme === 'light'
                  ? 'text-[#444444] group-hover:text-[#111111]'
                  : 'text-[#6c6d7a] group-hover:text-white'
              }`}
            >
              settings
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
