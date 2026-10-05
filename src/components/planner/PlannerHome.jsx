import { useState } from 'react'
import { lock } from '../../lib/firebase.js'

// "Tuesday, 6 October 2026"
function formatToday(date) {
  const weekday = date.toLocaleDateString('en-AU', { weekday: 'long' })
  const rest = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${weekday}, ${rest}`
}

// Signed-in view. Countdown and Daily Plan data come in later phases.
export default function PlannerHome() {
  const [today] = useState(() => formatToday(new Date()))

  return (
    <main className="pl-page">
      <header className="pl-header">
        <div>
          <h1>Hi, Yuan</h1>
          <p className="pl-date">{today}</p>
        </div>
        <button type="button" className="pl-btn" onClick={() => lock()}>
          Lock
        </button>
      </header>

      <section className="pl-section" aria-labelledby="pl-daily-title">
        <h2 id="pl-daily-title">Daily Plan</h2>
        <div className="pl-placeholder">Your daily plan will appear here.</div>
      </section>
    </main>
  )
}
