import React, { useState } from 'react';
import { DayRecord } from '../types';

interface StreaksScreenProps {
  history: Record<string, DayRecord>;
  todayScore: number;
  currentStreak: number;
  longestStreak: number;
}

export const StreaksScreen: React.FC<StreaksScreenProps> = ({
  history,
  todayScore,
  currentStreak,
  longestStreak,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    dateStr: string;
    score: number;
    tasksCount: number;
    completedCount: number;
  } | null>(null);

  // Generate a multi-month contribution heatmap (e.g. 16 weeks / ~112 days ending today)
  const totalDays = 112; // 16 weeks * 7 days
  const today = new Date();
  
  // Calculate day of week offset for the grid
  const todayDayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat

  const heatmapDays = Array.from({ length: totalDays }, (_, idx) => {
    const d = new Date(today);
    // Shift days back
    const daysAgo = totalDays - 1 - idx;
    d.setDate(today.getDate() - daysAgo);

    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isToday = daysAgo === 0;
    const record = history[dateStr];
    const score = isToday ? todayScore : (record?.disciplineScore ?? 0);
    const tasksCount = record?.tasks.length ?? 0;
    const completedCount = record?.tasks.filter((t) => t.completed).length ?? 0;

    return {
      date: d,
      dateStr,
      score,
      isToday,
      tasksCount,
      completedCount,
      qualified: score >= 70,
    };
  });

  // Calculate consistency percentage across all recorded days
  const activeRecords: DayRecord[] = Object.values(history);
  const qualifyingDaysCount = activeRecords.filter((r) => r.qualifiedStreak || r.disciplineScore >= 70).length;
  const consistencyPercentage = activeRecords.length > 0
    ? Math.round((qualifyingDaysCount / activeRecords.length) * 100)
    : 0;

  const getHeatmapColor = (score: number) => {
    if (score === 0) return 'heatmap-empty-cell bg-[#222226] border-[#2c2d33]';
    if (score < 50) return 'bg-[#3b3427] border-[#4c3f2b]'; // low
    if (score < 70) return 'bg-[#4b3c5a] border-[#5e4875]'; // near threshold
    if (score < 90) return 'heatmap-filled-cell bg-[#7c6af7] border-[#8e7ffa]'; // qualified
    return 'heatmap-filled-cell bg-[#9888fd] border-[#b4a8fe]'; // pristine 90-100%
  };

  return (
    <div id="streaks-screen" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-[#2d2e33]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#e58e26] text-3xl">local_fire_department</span>
          <span>Streaks & Heatmap Architecture</span>
        </h1>
        <p className="text-sm text-[#8e8ea0] mt-1">
          Visual contribution map of your non-negotiable execution. Only days with discipline score ≥ 70% count.
        </p>
      </div>

      {/* Streak Counters Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#202023] border border-[#2e2f34] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8e8ea0] font-medium mb-2">
            <span>Current Streak</span>
            <span className="material-symbols-outlined text-[#e58e26] text-[20px]">
              local_fire_department
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {currentStreak}
            </span>
            <span className="text-sm text-[#8e8ea0]">consecutive days</span>
          </div>
          <div className="text-[11px] text-[#7c6af7] mt-2 font-semibold">
            {todayScore >= 70 ? '✓ Today is secured' : 'Needs execution today (≥70%)'}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#202023] border border-[#2e2f34] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8e8ea0] font-medium mb-2">
            <span>Longest Streak Ever</span>
            <span className="material-symbols-outlined text-[#7c6af7] text-[20px]">
              military_tech
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {longestStreak}
            </span>
            <span className="text-sm text-[#8e8ea0]">days personal best</span>
          </div>
          <div className="text-[11px] text-[#8e8ea0] mt-2">
            Target to beat: {longestStreak + 1} days
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#202023] border border-[#2e2f34] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8e8ea0] font-medium mb-2">
            <span>Consistency Percentage</span>
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">
              percent
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {consistencyPercentage}%
            </span>
            <span className="text-sm text-[#8e8ea0]">pass rate</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 font-semibold">
            {qualifyingDaysCount} qualifying days recorded
          </div>
        </div>
      </div>

      {/* GitHub-style Heatmap */}
      <div className="p-5 rounded-xl bg-[#202023] border border-[#2e2f34] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7c6af7]">grid_view</span>
              <span>Discipline Heatmap</span>
            </h2>
            <p className="text-xs text-[#8e8ea0]">
              Past 16 weeks of daily discipline tracking. Hover over any square to view details.
            </p>
          </div>

          {activeRecords.length === 0 ? (
            <div id="heatmap-empty-state" className="text-center py-14 border-2 border-dashed border-[#34353c] rounded-xl bg-[#1e1e20]">
              <span className="material-symbols-outlined text-5xl text-[#636470]">calendar_view_month</span>
              <p className="mt-3 text-base font-semibold text-[#b8bac7]">
                Your discipline history will appear here as you complete daily tasks.
              </p>
            </div>
          ) : (
            <>
          {/* Legend */}
          <div className="flex items-center gap-1.5 text-xs text-[#8e8ea0]">
            <span className="text-[11px]">Less</span>
            <span className="w-3 h-3 rounded-xs bg-[#222226] border border-[#2c2d33]" title="0%" />
            <span className="w-3 h-3 rounded-xs bg-[#3b3427] border border-[#4c3f2b]" title="1-49%" />
            <span className="w-3 h-3 rounded-xs bg-[#4b3c5a] border border-[#5e4875]" title="50-69%" />
            <span className="w-3 h-3 rounded-xs bg-[#7c6af7] border border-[#8e7ffa]" title="70-89% (Qualified)" />
            <span className="w-3 h-3 rounded-xs bg-[#9888fd] border border-[#b4a8fe]" title="90-100%" />
            <span className="text-[11px] ml-1">More (≥70% purple)</span>
          </div>
            </>
          )}
        </div>

        {/* Heatmap Grid container with horizontal scroll on small screens */}
        <div className="overflow-x-auto pt-2 pb-2">
          <div className="min-w-[640px]">
            {/* Weekday indicators column + cells */}
            <div className="grid grid-flow-col grid-rows-7 gap-1.5">
              {heatmapDays.map((day) => {
                return (
                  <div
                    key={day.dateStr}
                    onMouseEnter={() =>
                      setHoveredCell({
                        dateStr: day.dateStr,
                        score: day.score,
                        tasksCount: day.tasksCount,
                        completedCount: day.completedCount,
                      })
                    }
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs border transition-all cursor-pointer ${getHeatmapColor(
                      day.score
                    )} ${day.isToday ? 'ring-2 ring-white ring-offset-1 ring-offset-[#202023]' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Active cell inspection card */}
        <div className="min-h-[44px] p-3 rounded-lg bg-[#18181a] border border-[#2a2b32] flex items-center justify-between text-xs">
          {hoveredCell ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">{hoveredCell.dateStr}</span>
                <span className="text-[#8e8ea0]">•</span>
                <span className="text-[#8e8ea0]">
                  {hoveredCell.completedCount}/{hoveredCell.tasksCount} tasks completed
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`font-mono font-bold ${
                    hoveredCell.score >= 70 ? 'text-[#7c6af7]' : 'text-[#e58e26]'
                  }`}
                >
                  Score: {hoveredCell.score}%
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    hoveredCell.score >= 70
                      ? 'bg-[#7c6af7]/20 text-[#7c6af7]'
                      : 'bg-[#3b3427] text-[#e58e26]'
                  }`}
                >
                  {hoveredCell.score >= 70 ? 'Streak Counted' : 'Below 70% Threshold'}
                </span>
              </div>
            </>
          ) : (
            <div className="text-[#6e707e] text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">touch_app</span>
              <span>Hover over any calendar block above to inspect daily performance metrics.</span>
            </div>
          )}
        </div>

      </div>

        {/* Operational Rule Callout */}
        <div className="p-4 rounded-lg bg-[#272633] border border-[#3e3b56] text-xs text-[#c6c3dc] space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#7c6af7] text-[18px]">verified</span>
            <span>Mathematical Streak Protection Rule</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#b0adc8]">
            Discipline score is calculated strictly as{' '}
            <code className="text-[#7c6af7] bg-[#1d1b29] px-1 py-0.5 rounded">
              (completed / total) × 100
            </code>
            . Your streak only increments on days where you achieve at least <strong>70%</strong>.
            Half-hearted days reset the chain.
          </p>
        </div>
    </div>
  );
};
