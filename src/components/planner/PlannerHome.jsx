import { useState } from 'react'
import { Link } from 'react-router'
import { lock } from '../../lib/firebase.js'
import { formatLongDate, toDateKey } from '../../lib/dates.js'
import BrandMark from '../BrandMark.jsx'
import CompletedHistory from './CompletedHistory.jsx'
import DailyPlanner from './DailyPlanner.jsx'
import ImportantDate from './ImportantDate.jsx'
import PlanTable from './PlanTable.jsx'

// Signed-in view.
export default function PlannerHome() {
  const [today] = useState(() => formatLongDate(toDateKey()))
  const [flushers] = useState(() => new Set()) // each table registers its save-now function
  const [locking, setLocking] = useState(false)

  // Save pending edits in every table before signing out (give up after 3s if offline).
  async function handleLock() {
    setLocking(true)
    const wait = new Promise((resolve) => setTimeout(resolve, 3000))
    await Promise.race([Promise.all([...flushers].map((flush) => flush())), wait])
    await lock()
  }

  return (
    <main className="pl-page">
      {/* Site identity bar: same YL brand as the Portfolio */}
      <nav className="pl-topbar" aria-label="Site">
        <span className="pl-brand">
          <BrandMark />
          <span>
            <span className="pl-hide-sm">Personal </span>Planner
          </span>
        </span>
        <div className="pl-topbar-actions">
          <Link to="/" className="pl-link pl-site-link">
            Portfolio
          </Link>
          <button type="button" className="pl-btn" onClick={handleLock} disabled={locking}>
            Lock
          </button>
        </div>
      </nav>

      <header className="pl-header">
        <div>
          <h1>Hi, Yuan</h1>
          <p className="pl-date">{today}</p>
          <ImportantDate />
        </div>
      </header>

      <DailyPlanner flushers={flushers} />
      <PlanTable planId="midTerm" title="Mid-term Plan" flushers={flushers} />
      <PlanTable planId="longTerm" title="Long-term Plan" flushers={flushers} />
      <CompletedHistory flushers={flushers} />
    </main>
  )
}
