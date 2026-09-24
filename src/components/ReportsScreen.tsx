import React from 'react';
import { DayRecord, Task } from '../types';

interface ReportsScreenProps {
  history: Record<string, DayRecord>;
  todayScore: number;
  todayTasks: Task[];
  currentStreak: number;
  longestStreak: number;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  history,
  todayScore,
  todayTasks,
  currentStreak,
  longestStreak,
}) => {
  // 1. Calculate Weekly discipline score chart (past 7 days Mon-Sun or last 7 days)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStats: Record<string, { totalScore: number; count: number }> = {
    Sun: { totalScore: 0, count: 0 },
    Mon: { totalScore: 0, count: 0 },
    Tue: { totalScore: 0, count: 0 },
    Wed: { totalScore: 0, count: 0 },
    Thu: { totalScore: 0, count: 0 },
    Fri: { totalScore: 0, count: 0 },
    Sat: { totalScore: 0, count: 0 },
  };

  const allRecords: DayRecord[] = Object.values(history);
  let totalTasksCompletedThisMonth = 0;
  const skippedTaskCounts: Record<string, number> = {};

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  allRecords.forEach((record) => {
    const d = new Date(record.dateStr + 'T00:00:00');
    const dayName = daysOfWeek[d.getDay()];
    if (dayStats[dayName]) {
      dayStats[dayName].totalScore += record.disciplineScore;
      dayStats[dayName].count += 1;
    }

    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      const completed = record.tasks.filter((t) => t.completed).length;
      totalTasksCompletedThisMonth += completed;
    }

    record.tasks.forEach((t) => {
      if (!t.completed || t.missed) {
        // Clean key
        const name = t.name.split(':')[0].trim();
        skippedTaskCounts[name] = (skippedTaskCounts[name] || 0) + 1;
      }
    });
  });

  // Calculate best day of the week
  let bestDayName = '—';
  let bestDayAvg = 0;
  Object.entries(dayStats).forEach(([day, stat]) => {
    const avg = stat.count > 0 ? Math.round(stat.totalScore / stat.count) : 0;
    if (avg > bestDayAvg) {
      bestDayAvg = avg;
      bestDayName = day;
    }
  });

  // Most skipped task
  let mostSkippedName = '—';
  let mostSkippedCount = 0;
  Object.entries(skippedTaskCounts).forEach(([name, count]) => {
    if (count > mostSkippedCount) {
      mostSkippedCount = count;
      mostSkippedName = name;
    }
  });

  // Last 7 days for the weekly bar chart
  const weeklyChartDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isToday = i === 6;
    const record = history[dateStr];
    const score = isToday ? todayScore : record?.disciplineScore ?? 0;
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

    return {
      dateStr,
      dayName,
      formattedDate,
      score,
      isToday,
      qualified: score >= 70,
    };
  });

  return (
    <div id="reports-screen" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-[#2d2e33]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#7c6af7] text-3xl">monitoring</span>
          <span>Discipline Reports & Analytics</span>
        </h1>
        <p className="text-sm text-[#8e8ea0] mt-1">
          Objective evaluation of your execution, friction points, and streak stability.
        </p>
      </div>

      {allRecords.length === 0 ? (
        <div id="reports-empty-state" className="text-center py-14 border-2 border-dashed border-[#34353c] rounded-xl bg-[#1e1e20]">
          <span className="material-symbols-outlined text-5xl text-[#636470]">monitoring</span>
          <p className="mt-3 text-base font-semibold text-[#b8bac7]">
            Complete tasks daily to see your performance reports here.
          </p>
        </div>
      ) : (
        <>
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#202023] border border-[#2e2f34]">
          <div className="flex items-center justify-between text-xs text-[#8e8ea0] mb-2 font-medium">
            <span>Best Day of Week</span>
            <span className="material-symbols-outlined text-[18px] text-[#7c6af7]">trophy</span>
          </div>
          <div className="text-xl font-bold text-white">{bestDayName}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
            {bestDayAvg}% Average Discipline
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#202023] border border-[#2e2f34]">
          <div className="flex items-center justify-between text-xs text-[#8e8ea0] mb-2 font-medium">
            <span>Most Skipped Task</span>
            <span className="material-symbols-outlined text-[18px] text-rose-400">warning</span>
          </div>
          <div className="text-base font-bold text-white truncate" title={mostSkippedName}>
            {mostSkippedName}
          </div>
          <div className="text-[11px] text-rose-400 mt-1 font-semibold">
            Skipped {mostSkippedCount} times total
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#202023] border border-[#2e2f34]">
          <div className="flex items-center justify-between text-xs text-[#8e8ea0] mb-2 font-medium">
            <span>Completed This Month</span>
            <span className="material-symbols-outlined text-[18px] text-blue-400">task_alt</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {totalTasksCompletedThisMonth + todayTasks.filter((t) => t.completed).length}
          </div>
          <div className="text-[11px] text-[#8e8ea0] mt-1">Verified execution blocks</div>
        </div>

        <div className="p-4 rounded-xl bg-[#202023] border border-[#2e2f34]">
          <div className="flex items-center justify-between text-xs text-[#8e8ea0] mb-2 font-medium">
            <span>Streak Benchmarks</span>
            <span className="material-symbols-outlined text-[18px] text-[#e58e26]">
              local_fire_department
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#e58e26]">{currentStreak}d</span>
            <span className="text-xs text-[#8e8ea0]">Current</span>
            <span className="text-sm font-semibold text-white ml-auto">{longestStreak}d</span>
            <span className="text-xs text-[#8e8ea0]">Record</span>
          </div>
          <div className="text-[11px] text-[#8e8ea0] mt-1">Target qualification: ≥ 70%</div>
        </div>
      </div>

      {/* Weekly Discipline Score Bar Chart */}
      <div className="p-5 rounded-xl bg-[#202023] border border-[#2e2f34] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white">Weekly Discipline Score Chart</h2>
            <p className="text-xs text-[#8e8ea0]">
              Daily score tracking with 70% threshold qualification line.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#b0b2be]">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#7c6af7]" />
              <span>Qualified (≥ 70%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#b0b2be]">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#444550]" />
              <span>Below Target</span>
            </span>
          </div>
        </div>

        {/* Custom High-Precision Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="relative h-56 flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6">
            {/* 70% Threshold Reference Line */}
            <div
              className="absolute left-0 right-0 border-b border-dashed border-[#7c6af7]/50 pointer-events-none z-10 flex items-center justify-end pr-2"
              style={{ bottom: '70%' }}
            >
              <span className="text-[10px] font-mono text-[#7c6af7] bg-[#202023] px-1 font-semibold -mb-2">
                70% STREAK THRESHOLD
              </span>
            </div>

            {/* 100% and 50% lines */}
            <div
              className="absolute left-0 right-0 border-b border-[#2d2e36] pointer-events-none"
              style={{ bottom: '100%' }}
            />
            <div
              className="absolute left-0 right-0 border-b border-[#292a31] pointer-events-none"
              style={{ bottom: '50%' }}
            />
            <div
              className="absolute left-0 right-0 border-b border-[#292a31] pointer-events-none"
              style={{ bottom: '0%' }}
            />

            {/* Bars */}
            {weeklyChartDays.map((bar) => {
              const heightPct = Math.max(bar.score, 4); // minimum 4% so bar is visible
              return (
                <div
                  key={bar.dateStr}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative z-20"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-[#141416] border border-[#3e404b] text-white text-[11px] font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none">
                    {bar.score}% ({bar.qualified ? 'Qualified' : 'Missed'})
                  </div>

                  {/* Bar fill */}
                  <div
                    className={`w-full max-w-[42px] rounded-t-md transition-all duration-300 ${
                      bar.qualified
                        ? bar.isToday
                          ? 'bg-[#7c6af7] ring-2 ring-[#a294fc]'
                          : 'bg-[#7c6af7]'
                        : 'bg-[#3c3d47]'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />

                  {/* Day Label */}
                  <div className="mt-2 text-center">
                    <div
                      className={`text-xs font-semibold ${
                        bar.isToday ? 'text-[#7c6af7]' : 'text-white'
                      }`}
                    >
                      {bar.dayName}
                    </div>
                    <div className="text-[10px] text-[#6f7180]">{bar.formattedDate}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Streak History Timeline */}
      <div className="p-5 rounded-xl bg-[#202023] border border-[#2e2f34] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c6af7]">history</span>
            <span>Streak History & Consistency Log</span>
          </h2>
          <span className="text-xs text-[#8e8ea0]">All sessions saved locally</span>
        </div>

        <div className="divide-y divide-[#2a2b30] text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-md bg-[#7c6af7]/20 border border-[#7c6af7]/40 flex items-center justify-center text-[#7c6af7]">
                <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
              </div>
              <div>
                <div className="font-semibold text-white">Active Defense Run</div>
                <div className="text-[#8e8ea0] text-[11px]">Current consecutive qualifying days</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#e58e26]">{currentStreak} Days</div>
              <div className="text-[11px] text-emerald-400 font-medium">Active & ongoing</div>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-md bg-[#2d2e36] border border-[#3b3c46] flex items-center justify-center text-[#a0a2b0]">
                <span className="material-symbols-outlined text-[16px]">military_tech</span>
              </div>
              <div>
                <div className="font-semibold text-white">All-Time Longest Streak</div>
                <div className="text-[#8e8ea0] text-[11px]">Personal discipline record</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">{longestStreak} Days</div>
              <div className="text-[11px] text-[#8e8ea0]">Verified record</div>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-md bg-[#2d2e36] border border-[#3b3c46] flex items-center justify-center text-[#a0a2b0]">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
              </div>
              <div>
                <div className="font-semibold text-white">Monthly Consistency Rate</div>
                <div className="text-[#8e8ea0] text-[11px]">Days hitting ≥ 70% threshold</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">
                {Math.round(
                  (allRecords.filter((r) => r.qualifiedStreak).length /
                    Math.max(allRecords.length, 1)) *
                    100
                )}
                %
              </div>
              <div className="text-[11px] text-emerald-400">High performance tier</div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
