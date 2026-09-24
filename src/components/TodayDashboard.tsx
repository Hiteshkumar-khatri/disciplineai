import React, { useState } from 'react';
import { DayRecord, Task, UserSettings } from '../types';

interface TodayDashboardProps {
  userSettings: UserSettings;
  tasks: Task[];
  history: Record<string, DayRecord>;
  disciplineScore: number;
  currentStreak: number;
  onToggleTask: (taskId: string) => void;
  onMarkTaskMissed: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  userSettings,
  tasks,
  history,
  disciplineScore,
  currentStreak,
  onToggleTask,
  onMarkTaskMissed,
  onAddTask,
  onDeleteTask,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('02:00 PM');
  const [newTaskDuration, setNewTaskDuration] = useState('30 min');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('Deep Work');

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  // Build the last 7 days for the 7-day streak calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isToday = i === 6;
    const record = history[dateStr];
    const score = isToday ? disciplineScore : record?.disciplineScore ?? 0;
    const qualified = score >= 70;
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();

    return {
      dateStr,
      dayName,
      dayNum,
      isToday,
      hasRecord: isToday ? true : !!record,
      score,
      qualified,
    };
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    onAddTask({
      name: newTaskName.trim(),
      scheduledTime: newTaskTime,
      duration: newTaskDuration,
      category: newTaskCategory,
    });

    setNewTaskName('');
    setIsAddModalOpen(false);
  };

  const categoryColor = (cat: Task['category']) => {
    switch (cat) {
      case 'Deep Work':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Fitness':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Health':
        return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
      case 'Reading':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Mindset':
        return 'bg-purple-500/15 text-[#a294fc] border-purple-500/30';
      default:
        return 'bg-zinc-700/30 text-zinc-300 border-zinc-600/30';
    }
  };

  return (
    <div id="today-dashboard" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2d2e33]">
        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{getGreeting()},</span>
            <span className="text-[#7c6af7]">{userSettings.name || 'friend'}</span>
          </div>
          <p className="text-sm text-[#8e8ea0] mt-1">
            Zero excuses. Execute the commitments below to lock in your streak qualification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-add-task-modal-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#7c6af7] hover:bg-[#6c58ef] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Row: Score Card & 7-Day Streak Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Score Card (0-100) with real-time updates */}
        <div
          id="discipline-score-card"
          className="md:col-span-5 p-5 rounded-xl bg-[#202023] border border-[#2e2f34] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8ea0]">
              Discipline Score
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                disciplineScore >= 70
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {disciplineScore >= 70 ? 'Target Met (≥70%)' : 'Needs Execution'}
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tight text-white">
              {disciplineScore}
            </span>
            <span className="text-lg text-[#8e8ea0] font-medium">/ 100</span>
          </div>

          {/* Progress Bar showing tasks completed vs total */}
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8e8ea0]">
                Progress: <strong className="text-white">{completedCount}</strong> of{' '}
                <strong className="text-white">{totalCount}</strong> completed
              </span>
              <span className="font-mono text-xs font-semibold text-[#7c6af7]">
                {disciplineScore}%
              </span>
            </div>
            <div className="progress-bar-track w-full bg-[#171718] rounded-full h-2.5 overflow-hidden p-0.5 border border-[#2b2c31]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  disciplineScore >= 70 ? 'bg-[#7c6af7]' : 'bg-[#e58e26]'
                }`}
                style={{ width: `${Math.min(disciplineScore, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#6f707f]">
              Formula: (Completed Tasks / Total Tasks) × 100. Updates in real-time.
            </p>
          </div>
        </div>

        {/* 7-Day Streak Calendar */}
        <div
          id="streak-calendar-card"
          className="md:col-span-7 p-5 rounded-xl bg-[#202023] border border-[#2e2f34] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8ea0]">
                7-Day Streak Calendar
              </span>
              <div className="text-xs text-[#6e707e] mt-0.5">
                Qualified days require score ≥ 70%
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#e58e26] bg-[#29241b] border border-[#443825] px-2.5 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[16px] text-[#e58e26]">
                local_fire_department
              </span>
              <span>{currentStreak} Day Streak</span>
            </div>
          </div>

          {/* 7 Squares */}
          <div className="grid grid-cols-7 gap-2.5 my-2">
            {last7Days.map((day) => {
              return (
                <div
                  key={day.dateStr}
                  className={`streak-day-container flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
                    day.isToday
                      ? 'border-[#7c6af7] bg-[#272633]'
                      : day.qualified
                      ? 'border-[#3f3a5f] bg-[#232130]'
                      : 'border-[#2d2e34] bg-[#1a1a1c]'
                  }`}
                >
                  <span className="streak-day-name text-[10px] font-medium text-[#8e8ea0] uppercase">
                    {day.dayName}
                  </span>
                  <span className="streak-day-num text-xs font-bold text-white mt-0.5">{day.dayNum}</span>

                  <div
                    className={`streak-day-square w-7 h-7 mt-1.5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                      day.qualified
                        ? 'streak-filled-square bg-[#7c6af7] text-white shadow-xs'
                        : day.score > 0
                        ? 'streak-empty-square bg-[#3b3427] text-[#e58e26] border border-[#52442d]'
                        : 'streak-empty-square bg-[#232326] text-[#555663] border border-transparent'
                    }`}
                  >
                    {day.qualified ? (
                      <span className="material-symbols-outlined text-[15px] text-white">check</span>
                    ) : day.hasRecord ? (
                      `${day.score}%`
                    ) : (
                      <span className="text-[10px]">·</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6e707e] pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#7c6af7]" />
              <span>Streak Qualified (≥70%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#3b3427] border border-[#52442d]" />
              <span>Below Threshold</span>
            </span>
          </div>
        </div>
      </div>

      {/* Task Checklist Section */}
      <div className="p-5 rounded-xl bg-[#202023] border border-[#2e2f34] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Today's Non-Negotiable Protocol</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#29292e] text-[#8e8ea0] font-normal">
                {completedCount}/{totalCount} Completed
              </span>
            </h2>
            <p className="text-xs text-[#8e8ea0] mt-0.5">
              Checking tasks immediately alerts your AI Coach and recalibrates your score.
            </p>
          </div>
          <button
            id="checklist-add-task-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs text-[#7c6af7] hover:text-[#9788fa] font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>New Task</span>
          </button>
        </div>

        {/* Task List Items */}
        <div className="space-y-2.5">
          {tasks.length === 0 ? (
            <div id="tasks-empty-state" className="text-center py-14 border-2 border-dashed border-[#34353c] rounded-xl bg-[#1e1e20]">
              <span className="material-symbols-outlined text-5xl text-[#636470]">checklist</span>
              <p className="mt-3 text-base font-semibold text-[#b8bac7]">
                No tasks yet. Click + Add Task to build your daily routine.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7c6af7] hover:bg-[#6c58ef] text-white text-sm font-bold shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Add Task</span>
              </button>
            </div>
          ) : (
            tasks.map((task) => {
              return (
                <div
                  key={task.id}
                  id={`task-card-${task.id}`}
                  className={`task-item-card group flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-[#1c1c1f] border-[#29292d] opacity-75'
                      : task.missed
                      ? 'bg-[#231d1d] border-[#442b2b]'
                      : 'bg-[#252529] border-[#33343c] hover:border-[#43444f]'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    {/* Custom Checkbox */}
                    <button
                      id={`task-toggle-${task.id}`}
                      onClick={() => onToggleTask(task.id)}
                      className={`task-item-checkbox w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-[#7c6af7] border-[#7c6af7] text-white'
                          : 'border-[#4e505c] hover:border-[#7c6af7] bg-[#1e1e20]'
                      }`}
                      aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.completed && (
                        <span className="material-symbols-outlined text-[14px] text-white">check</span>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div
                        className={`task-item-name text-sm font-medium transition-colors truncate ${
                          task.completed
                            ? 'line-through text-[#717280]'
                            : task.missed
                            ? 'text-rose-300'
                            : 'text-white'
                        }`}
                      >
                        {task.name}
                      </div>

                      {/* Details row: time, duration, category */}
                      <div className="task-item-meta flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#8e8ea0]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">schedule</span>
                          {task.scheduledTime}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">timelapse</span>
                          {task.duration}
                        </span>
                        <span>•</span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${categoryColor(
                            task.category
                          )}`}
                        >
                          {task.category}
                        </span>
                        {task.completed && task.completedAt && (
                          <span className="text-emerald-400 text-[10px] font-mono">
                            ✓ Done at {task.completedAt}
                          </span>
                        )}
                        {task.missed && (
                          <span className="text-rose-400 text-[10px] font-mono">
                            ⚠️ Missed / Reset
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (mark missed, delete) */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity ml-2">
                    {!task.completed && (
                      <button
                        id={`task-miss-btn-${task.id}`}
                        onClick={() => onMarkTaskMissed(task.id)}
                        title="Mark as missed (notifies coach)"
                        className="task-action-btn p-1.5 rounded-md hover:bg-[#342424] text-[#8e8ea0] hover:text-rose-400 transition-colors text-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">event_busy</span>
                      </button>
                    )}
                    <button
                      id={`task-delete-btn-${task.id}`}
                      onClick={() => onDeleteTask(task.id)}
                      title="Delete task"
                      className="task-action-btn p-1.5 rounded-md hover:bg-[#2f3036] text-[#767784] hover:text-[#e4e5ee] transition-colors text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div
          id="add-task-modal-backdrop"
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            id="add-task-modal"
            className="bg-[#212124] border border-[#33343c] rounded-xl w-full max-w-md p-5 space-y-4 shadow-xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2d2e35]">
              <div className="text-base font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c6af7]">add_task</span>
                <span>Schedule New Discipline Task</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8e8ea0] hover:text-white p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a0a2b2] font-semibold mb-1">Task Name</label>
                <input
                  type="text"
                  required
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="e.g. Deep Work: Code Architecture or 30m Run"
                  className="w-full bg-[#18181a] border border-[#383944] rounded-lg px-3 py-2.5 text-white placeholder-[#686976] focus:border-[#7c6af7] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a0a2b2] font-semibold mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    placeholder="e.g. 02:00 PM"
                    className="w-full bg-[#18181a] border border-[#383944] rounded-lg px-3 py-2.5 text-white placeholder-[#686976] focus:border-[#7c6af7] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#a0a2b2] font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(e.target.value)}
                    placeholder="e.g. 45 min"
                    className="w-full bg-[#18181a] border border-[#383944] rounded-lg px-3 py-2.5 text-white placeholder-[#686976] focus:border-[#7c6af7] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a0a2b2] font-semibold mb-1">Category</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as Task['category'])}
                  className="w-full bg-[#18181a] border border-[#383944] rounded-lg px-3 py-2.5 text-white focus:border-[#7c6af7] focus:outline-hidden"
                >
                  <option value="Deep Work">Deep Work</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Health">Health</option>
                  <option value="Reading">Reading</option>
                  <option value="Mindset">Mindset</option>
                  <option value="Habit">Habit</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2d2e35]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-[#2a2b30] hover:bg-[#35363d] text-[#b0b2c2] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#7c6af7] hover:bg-[#6c58ef] text-white font-bold transition-colors shadow-xs"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
