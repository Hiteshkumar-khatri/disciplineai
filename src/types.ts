export interface Task {
  id: string;
  name: string;
  scheduledTime: string; // e.g. "07:00" or "07:00 AM"
  duration: string; // e.g. "30 min"
  category: 'Deep Work' | 'Fitness' | 'Health' | 'Reading' | 'Mindset' | 'Habit';
  completed: boolean;
  missed?: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface DayRecord {
  dateStr: string; // "YYYY-MM-DD"
  tasks: Task[];
  disciplineScore: number; // 0-100
  qualifiedStreak: boolean; // score >= 70%
  dailyReportSent?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach' | 'system';
  text: string;
  timestamp: string;
  actionableContext?: string;
}

export interface UserSettings {
  name: string;
  geminiApiKey: string;
  soundEnabled: boolean;
  autoDailyReport: boolean;
  notificationsEnabled: boolean;
  wakeTime: string;
  /** Set once the user has completed (or skipped) the first-launch onboarding flow. */
  onboardingCompleted?: boolean;
}

export interface AppState {
  userSettings: UserSettings;
  tasks: Task[];
  history: Record<string, DayRecord>; // keyed by YYYY-MM-DD
  messages: ChatMessage[];
  currentStreak: number;
  longestStreak: number;
}
