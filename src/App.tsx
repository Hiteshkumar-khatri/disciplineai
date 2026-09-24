import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, ChatMessage, Task, UserSettings } from './types';
import {
  calculateDisciplineScore,
  calculateStreaks,
  getTodayDateString,
  loadInitialState,
  resetAllStorageData,
  saveStateToStorage,
} from './storage';
import {
  askGeminiCoach,
  generate1159PMDailyReport,
  generateTaskCompletedCoachMessage,
  generateTaskMissedCoachMessage,
} from './geminiService';
import { Sidebar } from './components/Sidebar';
import { TodayDashboard } from './components/TodayDashboard';
import { AICoachPanel } from './components/AICoachPanel';
import { ReportsScreen } from './components/ReportsScreen';
import { StreaksScreen } from './components/StreaksScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { OnboardingScreen } from './components/OnboardingScreen';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadInitialState());
  const [currentScreen, setCurrentScreen] = useState<'today' | 'reports' | 'streaks' | 'settings'>('today');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isCoachOpenMobile, setIsCoachOpenMobile] = useState(false);

  // True when running inside the installed PWA (Android "Install app" / iOS home screen).
  const isStandaloneApp =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;

  // Theme state: 'dark' | 'light' with localStorage persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('discipline_ai_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  // Apply theme class to <html> element and persist to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    try {
      localStorage.setItem('discipline_ai_theme', theme);
    } catch {}
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveStateToStorage(appState);
  }, [appState]);

  // Real-time discipline score calculation: (completed / total) * 100
  const todayScore = useMemo(() => {
    return calculateDisciplineScore(appState.tasks);
  }, [appState.tasks]);

  // Keep streaks synchronized with today's real-time score
  const { currentStreak, longestStreak } = useMemo(() => {
    return calculateStreaks(appState.history, todayScore);
  }, [appState.history, todayScore]);

  // Audio feedback synthesis using Web Audio API
  const playChime = useCallback(() => {
    if (!appState.userSettings.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1); // G5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // Audio context might be restricted
    }
  }, [appState.userSettings.soundEnabled]);

  // Automated 11:59 PM checker
  useEffect(() => {
    const checkMidnightAudit = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Check if it's 23:59
      if (hours === 23 && minutes === 59 && appState.userSettings.autoDailyReport) {
        const todayStr = getTodayDateString();
        const record = appState.history[todayStr];
        if (!record || !record.dailyReportSent) {
          trigger1159PMDailyReport();
        }
      }
    };

    const intervalId = setInterval(checkMidnightAudit, 30000); // check every 30s
    return () => clearInterval(intervalId);
  }, [appState.userSettings.autoDailyReport, appState.history, appState.tasks, todayScore, currentStreak]);

  // Handle task check/uncheck
  const handleToggleTask = (taskId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let justCompletedTask: Task | null = null;
    let nextPendingTask: Task | null = null;

    const updatedTasks = appState.tasks.map((task) => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        const updated: Task = {
          ...task,
          completed: newCompleted,
          missed: false,
          completedAt: newCompleted ? nowTime : undefined,
        };
        if (newCompleted) justCompletedTask = updated;
        return updated;
      }
      return task;
    });

    // Find next pending task
    nextPendingTask = updatedTasks.find((t) => !t.completed && t.id !== taskId) || null;

    const newScore = calculateDisciplineScore(updatedTasks);
    const todayStr = getTodayDateString();

    const updatedHistory = {
      ...appState.history,
      [todayStr]: {
        dateStr: todayStr,
        tasks: updatedTasks,
        disciplineScore: newScore,
        qualifiedStreak: newScore >= 70,
        dailyReportSent: appState.history[todayStr]?.dailyReportSent,
      },
    };

    const newStreaks = calculateStreaks(updatedHistory, newScore);

    // If task was just checked complete
    let newMessages = appState.messages;
    if (justCompletedTask) {
      playChime();
      if (appState.userSettings.notificationsEnabled) {
        const coachMessageText = generateTaskCompletedCoachMessage(
          justCompletedTask,
          nextPendingTask,
          newScore
        );
        const coachMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'coach',
          text: coachMessageText,
          timestamp: nowTime,
        };
        newMessages = [...newMessages, coachMsg];
      }
    }

    setAppState((prev) => ({
      ...prev,
      tasks: updatedTasks,
      history: updatedHistory,
      messages: newMessages,
      currentStreak: newStreaks.currentStreak,
      longestStreak: newStreaks.longestStreak,
    }));
  };

  // Handle marking a task missed
  const handleMarkTaskMissed = (taskId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let targetTask: Task | null = null;

    const updatedTasks = appState.tasks.map((task) => {
      if (task.id === taskId) {
        targetTask = { ...task, missed: true, completed: false };
        return targetTask;
      }
      return task;
    });

    const newScore = calculateDisciplineScore(updatedTasks);
    const todayStr = getTodayDateString();

    const updatedHistory = {
      ...appState.history,
      [todayStr]: {
        dateStr: todayStr,
        tasks: updatedTasks,
        disciplineScore: newScore,
        qualifiedStreak: newScore >= 70,
        dailyReportSent: appState.history[todayStr]?.dailyReportSent,
      },
    };

    const newStreaks = calculateStreaks(updatedHistory, newScore);

    let newMessages = appState.messages;
    if (targetTask && appState.userSettings.notificationsEnabled) {
      const recoveryText = generateTaskMissedCoachMessage(targetTask, newScore);
      newMessages = [
        ...newMessages,
        {
          id: `msg-${Date.now()}`,
          sender: 'coach',
          text: recoveryText,
          timestamp: nowTime,
        },
      ];
    }

    setAppState((prev) => ({
      ...prev,
      tasks: updatedTasks,
      history: updatedHistory,
      messages: newMessages,
      currentStreak: newStreaks.currentStreak,
      longestStreak: newStreaks.longestStreak,
    }));
  };

  // Add new task
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const todayStr = getTodayDateString();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
      createdAt: todayStr,
    };

    const updatedTasks = [...appState.tasks, newTask];
    const newScore = calculateDisciplineScore(updatedTasks);
    const updatedHistory = {
      ...appState.history,
      [todayStr]: {
        dateStr: todayStr,
        tasks: updatedTasks,
        disciplineScore: newScore,
        qualifiedStreak: newScore >= 70,
      },
    };

    setAppState((prev) => ({
      ...prev,
      tasks: updatedTasks,
      history: updatedHistory,
    }));
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const todayStr = getTodayDateString();
    const updatedTasks = appState.tasks.filter((t) => t.id !== taskId);
    const newScore = calculateDisciplineScore(updatedTasks);
    const updatedHistory = {
      ...appState.history,
      [todayStr]: {
        dateStr: todayStr,
        tasks: updatedTasks,
        disciplineScore: newScore,
        qualifiedStreak: newScore >= 70,
      },
    };

    setAppState((prev) => ({
      ...prev,
      tasks: updatedTasks,
      history: updatedHistory,
    }));
  };

  // Send message in Coach Chat
  const handleSendMessage = async (userText: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: nowTime,
    };

    const nextPending = appState.tasks.find((t) => !t.completed) || null;
    const completedCount = appState.tasks.filter((t) => t.completed).length;

    // Immediately post user message to state
    setAppState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg],
    }));

    // Call Groq (or fall back to the built-in local coach engine)
    const coachResponseText = await askGeminiCoach(
      userText,
      appState.userSettings.geminiApiKey,
      {
        userName: appState.userSettings.name,
        disciplineScore: todayScore,
        completedCount,
        totalTasks: appState.tasks.length,
        nextTask: nextPending,
      }
    );

    const coachMsg: ChatMessage = {
      id: `msg-coach-${Date.now()}`,
      sender: 'coach',
      text: coachResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAppState((prev) => ({
      ...prev,
      messages: [...prev.messages, coachMsg],
    }));
  };

  // Trigger 11:59 PM Daily Report
  const trigger1159PMDailyReport = useCallback(() => {
    const todayStr = getTodayDateString();
    const reportText = generate1159PMDailyReport(
      appState.userSettings.name,
      todayScore,
      appState.tasks,
      currentStreak
    );

    const reportMsg: ChatMessage = {
      id: `report-${Date.now()}`,
      sender: 'system',
      text: reportText,
      timestamp: '11:59 PM',
    };

    const updatedHistory = {
      ...appState.history,
      [todayStr]: {
        ...(appState.history[todayStr] || {
          dateStr: todayStr,
          tasks: appState.tasks,
          disciplineScore: todayScore,
          qualifiedStreak: todayScore >= 70,
        }),
        dailyReportSent: true,
      },
    };

    setAppState((prev) => ({
      ...prev,
      history: updatedHistory,
      messages: [...prev.messages, reportMsg],
    }));

    // On mobile, also hint the user to view the coach panel
    if (window.innerWidth < 1024) {
      setIsCoachOpenMobile(true);
    }
  }, [appState.userSettings.name, todayScore, appState.tasks, currentStreak, appState.history]);

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setAppState((prev) => ({
      ...prev,
      userSettings: {
        ...prev.userSettings,
        ...newSettings,
      },
    }));
  };

  // Reset all data
  const handleResetData = () => {
    const freshState = resetAllStorageData(appState.userSettings);
    setAppState(freshState);
    setCurrentScreen('today');
  };

  // First-launch onboarding: show before the dashboard whenever the user has
  // never completed (or deliberately skipped) the welcome flow.
  const needsOnboarding =
    !appState.userSettings.onboardingCompleted &&
    (appState.userSettings.name || '').trim() === '';

  if (needsOnboarding) {
    return (
      <div id="discipline-app-root" className="min-h-screen w-screen bg-[#171717] text-[#ececec] overflow-hidden font-sans">
        <OnboardingScreen
          theme={theme}
          onComplete={(partialSettings) => {
            setAppState((prev) => ({
              ...prev,
              userSettings: {
                ...prev.userSettings,
                ...partialSettings,
                onboardingCompleted: true,
              },
            }));
            setCurrentScreen('today');
          }}
        />
      </div>
    );
  }

  return (
    <div id="discipline-app-root" className="flex h-screen w-screen bg-[#171717] text-[#ececec] overflow-hidden font-sans">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        userSettings={appState.userSettings}
        currentStreak={currentStreak}
        disciplineScore={todayScore}
        isOpenOnMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Main Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#171717]">
        {/* Mobile Top App Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1e1e20] border-b border-[#2d2e33] z-30">
          <div className="flex items-center space-x-2">
            <button
              id="open-sidebar-mobile-btn"
              onClick={() => setIsSidebarOpenMobile(true)}
              className="p-1.5 rounded-lg text-[#9ca3af] hover:text-white hover:bg-[#28292d]"
              aria-label="Open navigation menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7c6af7]" />
              <span className="font-bold text-sm tracking-tight text-white capitalize">
                {currentScreen}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mobile Theme Toggle Button */}
            <button
              id="mobile-theme-toggle-btn"
              onClick={handleToggleTheme}
              className="p-1.5 rounded-lg text-[#9ca3af] hover:text-white hover:bg-[#28292d] transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  theme === 'light' ? 'text-amber-500 fill' : 'text-[#7c6af7]'
                }`}
              >
                {theme === 'light' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <div className="text-xs px-2 py-0.5 rounded-md bg-[#28292e] text-[#b4b7c6] border border-[#373841] font-mono">
              Score: <strong className="text-white">{todayScore}%</strong>
            </div>
            {!isStandaloneApp && (
              <a
                href="./install/"
                target="_blank"
                rel="noopener"
                className="px-2.5 py-1.5 rounded-lg bg-[#202023] border border-[#2e2f34] text-[#b4b7c6] text-xs font-semibold flex items-center gap-1 transition-colors active:scale-95"
                title="Download DisciplineAI as an app"
                aria-label="Install DisciplineAI as an app"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>App</span>
              </a>
            )}
            <button
              id="open-coach-mobile-btn"
              onClick={() => setIsCoachOpenMobile(!isCoachOpenMobile)}
              className="px-2.5 py-1.5 rounded-lg bg-[#7c6af7] text-white text-xs font-semibold flex items-center gap-1"
              aria-label="Toggle AI Coach"
            >
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>Coach</span>
            </button>
          </div>
        </header>

        {/* Content Container (Scrollable) */}
        <main className="flex-1 overflow-y-auto">
          {currentScreen === 'today' && (
            <TodayDashboard
              userSettings={appState.userSettings}
              tasks={appState.tasks}
              history={appState.history}
              disciplineScore={todayScore}
              currentStreak={currentStreak}
              onToggleTask={handleToggleTask}
              onMarkTaskMissed={handleMarkTaskMissed}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {currentScreen === 'reports' && (
            <ReportsScreen
              history={appState.history}
              todayScore={todayScore}
              todayTasks={appState.tasks}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />
          )}

          {currentScreen === 'streaks' && (
            <StreaksScreen
              history={appState.history}
              todayScore={todayScore}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              userSettings={appState.userSettings}
              onUpdateSettings={handleUpdateSettings}
              onResetData={handleResetData}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          )}
        </main>
      </div>

      {/* 3. Right Side AI Chat Panel */}
      <AICoachPanel
        messages={appState.messages}
        onSendMessage={handleSendMessage}
        userSettings={appState.userSettings}
        tasks={appState.tasks}
        disciplineScore={todayScore}
        currentStreak={currentStreak}
        onOpenSettings={() => {
          setCurrentScreen('settings');
          setIsCoachOpenMobile(false);
        }}
        isOpenMobile={isCoachOpenMobile}
        onCloseMobile={() => setIsCoachOpenMobile(false)}
      />
    </div>
  );
}
