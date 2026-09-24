import { AppState, DayRecord, Task, UserSettings } from './types';

const STORAGE_KEY = 'discipline_ai_state_v4';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateStringFromOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDateLabel(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function calculateDisciplineScore(tasks: Task[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
}

function generateInitialHistory(): Record<string, DayRecord> {
  return {};
}

const DEFAULT_TODAY_TASKS: Task[] = [];

const DEFAULT_SETTINGS: UserSettings = {
  name: '',
  geminiApiKey: '',
  soundEnabled: true,
  autoDailyReport: true,
  notificationsEnabled: true,
  wakeTime: '06:00 AM',
  onboardingCompleted: false,
};

function buildWelcomeMessage(): AppState['messages'] {
  return [
    {
      id: 'welcome-1',
      sender: 'coach',
      text: 'Welcome to DisciplineAI. Add your first task to get started. Hit the + Add Task button to build your daily routine.',
      timestamp: '00:00 AM',
    },
  ];
}

/**
 * Heuristic for detecting the fake seeded demo tasks that shipped in older
 * builds of the app (e.g. "Morning Run", "Deep Work Block", "Cold Shower").
 */
function isSeededTaskName(name: string): boolean {
  const n = ` ${(name || '').toLowerCase()} `;
  return /\brun\b/.test(n) || /\bdeep work\b/.test(n) || /\bcold shower\b/.test(n);
}

/**
 * If the saved state contains seeded demo data (history entries flagged as
 * dailyReportSent whose tasks match seeded names), wipe the contaminated
 * history/tasks/streaks while preserving the user's identity (name +
 * Gemini/Groq API key) and other preferences.
 */
function purgeSeededSavedState(parsed: AppState): AppState {
  if (!parsed || typeof parsed !== 'object') return parsed;

  const history = parsed.history || {};
  const seededEntries = Object.values(history).filter((record) => {
    if (!record || record.dailyReportSent !== true) return false;
    const recordTasks = Array.isArray(record.tasks) ? record.tasks : [];
    return recordTasks.some((t) => t && isSeededTaskName(t.name));
  });

  if (seededEntries.length > 0) {
    const prev: UserSettings = parsed.userSettings || { name: '', geminiApiKey: '', soundEnabled: true, autoDailyReport: true, notificationsEnabled: true, wakeTime: '06:00 AM' };
    parsed.history = {};
    parsed.tasks = [];
    parsed.messages = [];
    parsed.currentStreak = 0;
    parsed.longestStreak = 0;
    parsed.userSettings = {
      ...DEFAULT_SETTINGS,
      name: prev.name || '',
      geminiApiKey: prev.geminiApiKey || '',
      soundEnabled: prev.soundEnabled ?? true,
      autoDailyReport: prev.autoDailyReport ?? true,
      notificationsEnabled: prev.notificationsEnabled ?? true,
      wakeTime: prev.wakeTime || DEFAULT_SETTINGS.wakeTime,
      onboardingCompleted: prev.onboardingCompleted ?? (prev.name ? prev.name.trim().length > 0 : false),
    };
  }

  return parsed;
}

export function calculateStreaks(history: Record<string, DayRecord>, todayScore: number): { currentStreak: number; longestStreak: number } {
  // Sort dates chronologically
  const dates = Object.keys(history).sort();
  
  // Calculate historical streaks
  let longest = 0;
  let running = 0;

  // Check past days in order
  for (const date of dates) {
    if (history[date].qualifiedStreak) {
      running += 1;
      if (running > longest) longest = running;
    } else {
      running = 0;
    }
  }

  // Today streak logic: streak continues if today is >= 70%, or holds prior streak until day finishes
  let currentStreak = 0;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // Walk backwards from yesterday
  let checkDate = new Date(yesterday);
  while (true) {
    const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    const record = history[dStr];
    if (record && record.qualifiedStreak) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // If today already meets 70%, add 1
  if (todayScore >= 70) {
    currentStreak += 1;
  }

  if (currentStreak > longest) {
    longest = currentStreak;
  }

  return {
    currentStreak: Math.max(currentStreak, 0),
    longestStreak: Math.max(longest, 0),
  };
}

export function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = purgeSeededSavedState(JSON.parse(raw) as AppState);
      if (!parsed.userSettings || typeof parsed.userSettings !== 'object') parsed.userSettings = { ...DEFAULT_SETTINGS };
      if (!Array.isArray(parsed.messages)) parsed.messages = [];
      if (!parsed.history || typeof parsed.history !== 'object') parsed.history = {};
      if (!Array.isArray(parsed.tasks)) parsed.tasks = [];

      const today = getTodayDateString();
      const todayRecord = parsed.history[today];

      if (!todayRecord) {
        // New day (or first run with prior tasks): snapshot the previous day's
        // completion state into history, then start today fresh from the same
        // routine template (all tasks reset to unchecked).
        if (parsed.tasks.length > 0) {
          const yesterday = getDateStringFromOffset(-1);
          if (!parsed.history[yesterday]) {
            const rolloverScore = calculateDisciplineScore(parsed.tasks);
            parsed.history[yesterday] = {
              dateStr: yesterday,
              tasks: parsed.tasks,
              disciplineScore: rolloverScore,
              qualifiedStreak: rolloverScore >= 70,
            };
          }
          parsed.tasks = parsed.tasks.map((task) => ({
            ...task,
            completed: false,
            missed: undefined,
            completedAt: undefined,
          }));
        }
        parsed.history[today] = {
          dateStr: today,
          tasks: parsed.tasks,
          disciplineScore: 0,
          qualifiedStreak: false,
        };
      }

      // Re-sync streaks so they can never drift from the stored history.
      const streaks = calculateStreaks(parsed.history, calculateDisciplineScore(parsed.tasks));
      parsed.currentStreak = streaks.currentStreak;
      parsed.longestStreak = streaks.longestStreak;

      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse saved state, initializing defaults', e);
  }

  // Brand new user — completely empty slate, no fake seeded history.
  return {
    userSettings: { ...DEFAULT_SETTINGS },
    tasks: DEFAULT_TODAY_TASKS,
    history: generateInitialHistory(),
    messages: buildWelcomeMessage(),
    currentStreak: 0,
    longestStreak: 0,
  };
}

export function saveStateToStorage(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

/**
 * Erases discipline data (tasks, history, streaks, chat) but preserves the
 * user's name/API key/preferences so they don't have to re-enter them.
 */
export function resetAllStorageData(currentSettings: UserSettings): AppState {
  localStorage.removeItem(STORAGE_KEY);
  const fresh = loadInitialState();
  fresh.userSettings = {
    ...fresh.userSettings,
    ...currentSettings,
    onboardingCompleted: true,
  };
  return fresh;
}
