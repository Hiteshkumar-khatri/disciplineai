import { Task } from './types';

const SYSTEM_PROMPT = `You are a strict but supportive discipline coach. Keep responses under 3 sentences. Be direct, no fluff. Focus on action not motivation.`;

export async function askGeminiCoach(
  userQuery: string,
  apiKey: string,
  contextData?: {
    userName?: string;
    disciplineScore?: number;
    completedCount?: number;
    totalTasks?: number;
    nextTask?: Task | null;
  }
): Promise<string> {
  const effectiveKey = apiKey?.trim() || '';

  const contextNote = contextData
    ? `[User: ${contextData.userName || 'User'}, Score: ${contextData.disciplineScore ?? 0}%, Tasks: ${contextData.completedCount ?? 0}/${contextData.totalTasks ?? 0}${contextData.nextTask ? `, Next: "${contextData.nextTask.name}" at ${contextData.nextTask.scheduledTime}` : ''}]`
    : '';

  if (effectiveKey.length > 5) {
    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveKey}`
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: `${contextNote}\n\nUser: ${userQuery}` }
            ],
            temperature: 0.6,
            max_tokens: 180
          })
        }
      );
      const rawText = await response.text();
      const data = JSON.parse(rawText);
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } catch {
      // Network/API failure — fall through to the local coach responses below.
    }
  }

  return getSimulatedCoachResponse(userQuery, contextData);
}

export function generateTaskCompletedCoachMessage(
  task: Task,
  nextTask: Task | null,
  currentScore: number
): string {
  const praises = [
    `Done. One brick laid.`,
    `Standard executed. No excuses allowed.`,
    `Good. Consistency beats talent every single day.`,
    `Checkmark secured. Don't slow down now.`,
  ];
  const chosenPraise = praises[Math.floor(Math.random() * praises.length)];

  if (nextTask) {
    return `${chosenPraise} Discipline score is now ${currentScore}%. Next target: "${nextTask.name}" at ${nextTask.scheduledTime}. Stay locked in.`;
  } else {
    return `${chosenPraise} Discipline score reached ${currentScore}%. All planned objectives for today are finished. Review your day and prepare tomorrow.`;
  }
}

export function generateTaskMissedCoachMessage(task: Task, currentScore: number): string {
  return `You slipped on "${task.name}". Current discipline score dropped to ${currentScore}%. Acknowledge the failure, eliminate the friction, and execute the very next block without negotiation.`;
}

export function generate1159PMDailyReport(
  userName: string,
  score: number,
  tasks: Task[],
  streak: number
): string {
  const completed = tasks.filter((t) => t.completed).length;
  const status = score >= 70 ? 'STREAK DEFENDED' : 'STREAK BROKEN / BELOW THRESHOLD';
  
  return `DAILY DISCIPLINE AUDIT (11:59 PM):
• Score: ${score}% (${completed}/${tasks.length} tasks completed)
• Status: ${status} (Current Streak: ${streak} days)
${score >= 70 ? 'You did what needed to be done. Rest now, wake up hungry tomorrow.' : 'Unacceptable drift today. Identify why you postponed execution and reset immediately for tomorrow.'}`;
}

function getSimulatedCoachResponse(
  query: string,
  contextData?: {
    userName?: string;
    disciplineScore?: number;
    completedCount?: number;
    totalTasks?: number;
    nextTask?: Task | null;
  }
): string {
  const q = query.toLowerCase();

  if (q.includes('lazy') || q.includes('tired') || q.includes('don\'t want to') || q.includes('procrastinat')) {
    return "Action precedes motivation, not the other way around. Stand up, close social media, and do the first 5 minutes of your next task right now.";
  }

  if (q.includes('plan tomorrow') || q.includes('tomorrow')) {
    return "Define your top 3 non-negotiables before you sleep tonight. Schedule exact time blocks and prepare your environment so morning execution is effortless.";
  }

  if (q.includes('why am i failing') || q.includes('failing') || q.includes('fail')) {
    return "You're failing because you negotiate with your impulses instead of obeying your schedule. Cut your task size in half, remove distractions, and stick to the clock.";
  }

  if (q.includes('motivate') || q.includes('inspire') || q.includes('boost')) {
    return "Motivation is fickle; discipline is the only reliable currency. Your future self is either thanking you for your restraint today or paying for your excuses.";
  }

  if (q.includes('check in') || q.includes('status') || q.includes('how am i doing')) {
    const score = contextData?.disciplineScore ?? 0;
    if (score >= 70) {
      return `Discipline score is ${score}%, above your 70% threshold. Do not get comfortable—finish every remaining commitment on your board.`;
    } else {
      return `Discipline score is lagging at ${score}%. You need ${70 - score}% more to maintain streak qualification. Execute your next task immediately.`;
    }
  }

  return "Focus on what is in front of you. Stop overthinking and execute the task you have scheduled right now.";
}