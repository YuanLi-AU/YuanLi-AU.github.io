import { useState } from 'react'
import { Link } from 'react-router'
import { lock } from '../../lib/firebase.js'
import { formatLongDate, lunarDate } from '../../lib/dates.js'
import BrandMark from '../BrandMark.jsx'
import CompletedHistory from './CompletedHistory.jsx'
import DailyPlanner from './DailyPlanner.jsx'
import ImportantDate from './ImportantDate.jsx'
import PlanTable from './PlanTable.jsx'
import RecycleBin from './RecycleBin.jsx'
import useTodayKey from './useTodayKey.js'

// Planner tabs. Daily / Mid-term / Long-term stay mounted while hidden
// (their live data, pending edits and Restore hand-off keep working); the
// Recycle Bin only loads while its tab is open. Each tab shows its English
// name (" Plan" hidden on phones) with the Chinese name on a second line.
const TABS = [
  { id: 'daily', label: 'Daily', rest: ' Plan', zh: '每日计划' },
  { id: 'midTerm', label: 'Mid-term', rest: ' Plan', zh: '中期计划' },
  { id: 'longTerm', label: 'Long-term', rest: ' Plan', zh: '长期计划' },
  { id: 'bin', label: 'Recycle Bin', rest: '', zh: '回收站' },
]

function PlannerTabs({ tab, onChange }) {
  // ← / → move between tabs (standard tablist keyboard behaviour)
  function onKeyDown(e) {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    // move from the tab that has focus (may differ from the selected one)
    const focused = TABS.findIndex((t) => `pl-tab-${t.id}` === e.target.id)
    const index = focused >= 0 ? focused : TABS.findIndex((t) => t.id === tab)
    const next = TABS[(index + step + TABS.length) % TABS.length]
    onChange(next.id)
    document.getElementById(`pl-tab-${next.id}`)?.focus()
  }

  return (
    <div className="pl-tabs" role="tablist" aria-label="Planner sections" onKeyDown={onKeyDown}>
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          id={`pl-tab-${t.id}`}
          className={`pl-tab pl-tab-${t.id}`}
          aria-selected={tab === t.id}
          aria-controls={`pl-panel-${t.id}`}
          tabIndex={tab === t.id ? 0 : -1}
          onClick={() => onChange(t.id)}
        >
          <span className="pl-tab-dot" aria-hidden="true" />
          <span className="pl-tab-text">
            <span>
              {t.label}
              {t.rest && <span className="pl-hide-sm">{t.rest}</span>}
            </span>
            <span className="pl-tab-zh" lang="zh-Hans">
              {t.zh}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}

function Panel({ id, tab, children }) {
  return (
    <div
      role="tabpanel"
      id={`pl-panel-${id}`}
      aria-labelledby={`pl-tab-${id}`}
      className="pl-panel"
      hidden={tab !== id}
    >
      {children}
    </div>
  )
}

// Signed-in view.
export default function PlannerHome() {
  const [tab, setTab] = useState('daily')
  const todayKey = useTodayKey() // header date follows the calendar day
  const lunar = lunarDate(todayKey)
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

      {/* Desktop: greeting + date on the left, countdown on the right */}
      <header className="pl-header">
        <div className="pl-greeting">
          <h1>Hi, Yuan</h1>
          <p className="pl-date">
            {formatLongDate(todayKey)}
            {lunar && (
              <span className="pl-lunar" lang="zh-Hans">
                {' '}
                · {lunar}
              </span>
            )}
          </p>
        </div>
        <ImportantDate />
      </header>

      <PlannerTabs tab={tab} onChange={setTab} />

      <Panel id="daily" tab={tab}>
        <DailyPlanner flushers={flushers} />
        <CompletedHistory flushers={flushers} />
      </Panel>
      <Panel id="midTerm" tab={tab}>
        <PlanTable planId="midTerm" title="Mid-term Plan" flushers={flushers} />
      </Panel>
      <Panel id="longTerm" tab={tab}>
        <PlanTable planId="longTerm" title="Long-term Plan" flushers={flushers} />
      </Panel>
      <Panel id="bin" tab={tab}>
        {tab === 'bin' && <RecycleBin flushers={flushers} />}
      </Panel>
    </main>
  )
}
