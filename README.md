# ⚡ DisciplineAI

**AI-powered daily discipline tracker** with an accountability coach, streak heatmaps,
and performance analytics — 100% client-side, no server required.

- Schedule daily tasks and check them off in real time
- **AI Coach** chat powered by [Groq](https://console.groq.com) (`gpt-oss-20b`) with a
  built-in offline coach that answers even without an API key
- **70% discipline threshold** protects (or breaks) your daily streak
- Streak **heatmap**, weekly charts, and monthly consistency reports
- Light / dark theme, sound feedback, auto 11:59 PM daily audit report
- All data stays in **your browser** (localStorage) — nothing is uploaded

> 🔗 **Live app:** hosted on GitHub Pages.
> 📦 **Download:** grab the offline build from the [Releases](https://github.com/Hiteshkumar-khatri/disciplineai/releases) page.

---

## Run Locally

**Prerequisite:** [Node.js](https://nodejs.org) 18+ (npm)

```bash
npm install     # install dependencies
npm run dev     # start dev server at http://localhost:3000
```

Open <http://localhost:3000>.

## Build a production bundle

```bash
npm run build   # outputs a static site into ./dist
```

The build uses relative paths, so `dist/index.html` can be opened directly from
disk or hosted on any static server / subpath.

## Using the AI Coach

1. Open the app and paste a **Groq API key** in Settings (or during onboarding).
   Get a free key at <https://console.groq.com> — looks like `gsk_...`.
2. The AI Coach calls the Groq cloud API directly from your browser.
3. No key? The built-in local coach still answers with strict, action-first advice.

> **Privacy:** your API key is stored only in your own browser's localStorage and
> sent straight to Groq. It is never uploaded anywhere else.

## Project Structure

```
src/
  App.tsx                 # Root app shell, state management, streaks logic
  geminiService.ts        # AI Coach (Groq API + local fallback)
  storage.ts              # localStorage persistence + streak calculations
  components/
    TodayDashboard.tsx    # Daily task board
    AICoachPanel.tsx      # Coach chat panel
    StreaksScreen.tsx     # Heatmap calendar
    ReportsScreen.tsx     # Analytics & consistency reports
    SettingsScreen.tsx    # Preferences & data reset
    OnboardingScreen.tsx  # First-launch welcome
```

## Tech Stack

- [React 19](https://react.dev) + [Vite 6](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Groq](https://groq.com) OpenAI-compatible API (`openai/gpt-oss-20b`)
- TypeScript

## How the Streak Works

- Discipline score = `(completed tasks / total tasks) × 100`
- A day **qualifies** when the score is **≥ 70%**
- Qualifying days extend your current streak; anything below 70% resets the chain

## License

[MIT](./LICENSE)
