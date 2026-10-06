// Planner data access (Firestore). Schema:
//
//   users/{uid}/plans/daily                    THE active Daily list
//     items:     [{ id, time, task, notes }]   // time may be ""; notes are
//                                              // no longer shown or asked for,
//                                              // but older values are kept
//     updatedAt: server timestamp
//   A task stays here until it is completed (→ completedHistory) or deleted
//   (→ recycleBin). No dates, no rollover, no expiry.
//
//   users/{uid}/plans/{midTerm | longTerm}     active mid/long-term plans
//     items:     [{ id, targetDate, task, notes }]   // targetDate may be ""
//     updatedAt: server timestamp
//
//   users/{uid}/dailyPlans/{YYYY-MM-DD}       LEGACY one-list-per-day Daily
//     data; only read once, by the one-time migration below.
//
//   users/{uid}/completedHistory/{itemId}     one doc per completed row
//     id, type ("daily" | "mid-term" | "long-term"), task, notes,
//     originalDate (daily: the day it was completed; otherwise null),
//     time (daily) or targetDate (mid/long), completedAt: server timestamp
//
//   users/{uid}/recycleBin/{itemId}           one doc per deleted row
//     id, type, task, originalDate (daily) or null, time (daily) or
//     targetDate (mid/long), notes (only if an older row had one),
//     deletedAt: server timestamp
//
//   users/{uid}/settings/planner
//     importantDateLabel, importantDate, updatedAt,
//     dailyMigrated: true once the legacy Daily data has been moved
//
// The uid always comes from the signed-in Firebase user; firestore.rules
// decide whether that uid is allowed. Nothing else (email, password) is stored.
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { addDays, toDateKey } from './dates.js'
import { auth, db } from './firebase.js'

function userPath() {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Planner data requires a signed-in user.')
  return ['users', uid]
}

const userDoc = (...path) => doc(db, ...userPath(), ...path)
const dailyPlanRef = (dateKey) => userDoc('dailyPlans', dateKey)
const planRef = (planId) => userDoc('plans', planId)
const historyRef = (itemId) => userDoc('completedHistory', itemId)
const binRef = (itemId) => userDoc('recycleBin', itemId)
const settingsRef = () => userDoc('settings', 'planner')

// Keep only the current fields. Older test data may still contain
// `priority` / `done`; they are ignored here and dropped on the next save.
const normalize = (items) =>
  items.map(({ id, time = '', task = '', notes = '' }) => ({ id, time, task, notes }))
const normalizePlan = (items) =>
  items.map(({ id, targetDate = '', task = '', notes = '' }) => ({ id, targetDate, task, notes }))

// `index` puts a row back where it was (Undo); without one it goes last.
export function insertAt(list, row, index) {
  if (!Number.isInteger(index) || index < 0 || index > list.length) return [...list, row]
  return [...list.slice(0, index), row, ...list.slice(index)]
}

const itemsOf = (snap) => (snap.exists() ? normalize(snap.data().items ?? []) : [])
const planItemsOf = (snap) => (snap.exists() ? normalizePlan(snap.data().items ?? []) : [])
const settingsOf = (snap) => (snap.exists() ? snap.data() : null)

// Writes a row to history (completed) or the Recycle Bin (deleted) and the
// source list without it, in one transaction — both happen or neither does,
// so completing or deleting can't lose a row.
function removeInto(targetRef, stampField, sourceRef, sourceData, entry) {
  return runTransaction(db, async (tx) => {
    tx.set(targetRef, { ...entry, [stampField]: serverTimestamp() })
    tx.set(sourceRef, { ...sourceData, updatedAt: serverTimestamp() })
  })
}

const completeInto = (sourceRef, sourceData, entry) =>
  removeInto(historyRef(entry.id), 'completedAt', sourceRef, sourceData, entry)
const binInto = (sourceRef, sourceData, entry) =>
  removeInto(binRef(entry.id), 'deletedAt', sourceRef, sourceData, entry)

// Old notes are only kept when there is one, so new entries stay minimal.
const notesOf = (item) => (item.notes ? { notes: item.notes } : {})

const dailyEntry = (dateKey, item) => ({
  id: item.id,
  type: 'daily',
  task: item.task,
  ...notesOf(item),
  time: item.time,
  originalDate: dateKey,
})

// ---------- Daily plan (plans/daily) ----------

const DAILY = 'daily' // plan id of the one active Daily list (also its list key)
const dailyRef = () => planRef(DAILY)

export function createItem() {
  return { id: crypto.randomUUID(), time: '', task: '', notes: '' }
}

// Live updates across devices. Returns the unsubscribe function. (The key
// argument is the list key from useSyncedItems; Daily has only one list.)
export function subscribeDaily(_key, onItems, onError) {
  return onSnapshot(dailyRef(), (snap) => onItems(itemsOf(snap)), onError)
}

// Saves the whole list (last write wins — fine for a single user).
export function saveDaily(_key, items) {
  return setDoc(dailyRef(), { items: normalize(items), updatedAt: serverTimestamp() })
}

// History / bin entries keep the same shape as before: originalDate is the
// day the task was completed / deleted.
export function completeDailyItem(item, remaining) {
  return completeInto(dailyRef(), { items: normalize(remaining) }, dailyEntry(toDateKey(), item))
}

// Delete = move to the Recycle Bin (nothing is permanently deleted here).
export function binDailyItem(item, remaining) {
  return binInto(dailyRef(), { items: normalize(remaining) }, dailyEntry(toDateKey(), item))
}

// ---------- One-time migration of the legacy per-day Daily data ----------
// Moves the unfinished tasks of the old dailyPlans/{date} documents into
// plans/daily, ONCE. Only these explicit days are read — today−6 … today,
// plus today+1 (the old "Move to tomorrow") — at most 8 single-document
// reads; no collection query, no list permission. Older legacy days are left
// untouched (not migrated, not read).
//
// One transaction: the active list gets the tasks (after any it already
// has, oldest day first, each day's order kept, no duplicate ids), the
// migrated days are emptied, and settings/planner.dailyMigrated = true —
// all or nothing. On failure nothing changes and the next open retries.
// A device that has seen the flag remembers it locally, so later opens
// don't even read settings for it.
const MIGRATED_KEY = 'planner.dailyMigrated'
const LEGACY_DAYS_BACK = 6
const LEGACY_DAYS_AHEAD = 1

function migratedHere() {
  try {
    return localStorage.getItem(MIGRATED_KEY) === auth.currentUser?.uid
  } catch {
    return false
  }
}

function rememberMigrated() {
  try {
    localStorage.setItem(MIGRATED_KEY, auth.currentUser?.uid ?? '')
  } catch {
    // private mode etc.: we'll just check settings again next time
  }
}

let migrating = null // the running migration, shared by overlapping calls

export function migrateLegacyDaily(todayKey = toDateKey()) {
  if (migratedHere()) return Promise.resolve({ destination: null, key: DAILY, rows: [] })
  migrating ??= runMigration(todayKey).finally(() => {
    migrating = null
  })
  return migrating
}

async function runMigration(todayKey) {
  const days = []
  for (let d = -LEGACY_DAYS_BACK; d <= LEGACY_DAYS_AHEAD; d += 1) days.push(addDays(todayKey, d))

  const rows = await runTransaction(db, async (tx) => {
    const settingsSnap = await tx.get(settingsRef())
    if (settingsSnap.exists() && settingsSnap.data().dailyMigrated === true) return null
    const active = itemsOf(await tx.get(dailyRef()))
    const legacy = []
    for (const key of days) legacy.push([key, itemsOf(await tx.get(dailyPlanRef(key)))])

    const seen = new Set(active.map((item) => item.id))
    const moved = []
    for (const [, items] of legacy) {
      for (const item of items) {
        if (seen.has(item.id)) continue
        seen.add(item.id)
        moved.push(item)
      }
    }
    for (const [key, items] of legacy) {
      if (items.length === 0) continue
      tx.set(dailyPlanRef(key), { date: key, items: [], updatedAt: serverTimestamp() })
    }
    if (moved.length > 0) {
      tx.set(dailyRef(), { items: normalize([...active, ...moved]), updatedAt: serverTimestamp() })
    }
    tx.set(settingsRef(), { dailyMigrated: true }, { merge: true })
    return moved
  })
  rememberMigrated()
  // Same shape as a restore result, so the Daily list can take the rows in.
  return { destination: rows?.length ? 'daily' : null, key: DAILY, rows: rows ?? [] }
}

// ---------- Mid-term / long-term plans ----------

export const PLAN_TYPES = { midTerm: 'mid-term', longTerm: 'long-term' }

export function createPlanItem() {
  return { id: crypto.randomUUID(), targetDate: '', task: '', notes: '' }
}

export function subscribePlan(planId, onItems, onError) {
  return onSnapshot(planRef(planId), (snap) => onItems(planItemsOf(snap)), onError)
}

export function savePlan(planId, items) {
  return setDoc(planRef(planId), { items: normalizePlan(items), updatedAt: serverTimestamp() })
}

const planEntry = (planId, item) => ({
  id: item.id,
  type: PLAN_TYPES[planId],
  task: item.task,
  ...notesOf(item),
  targetDate: item.targetDate,
  originalDate: null,
})

export function completePlanItem(planId, item, remaining) {
  return completeInto(planRef(planId), { items: normalizePlan(remaining) }, planEntry(planId, item))
}

export function binPlanItem(planId, item, remaining) {
  return binInto(planRef(planId), { items: normalizePlan(remaining) }, planEntry(planId, item))
}

// ---------- Restore (from history or the Recycle Bin) ----------

const PLAN_IDS = { daily: DAILY, 'mid-term': 'midTerm', 'long-term': 'longTerm' }

// Puts a completed / deleted row back into its active list and removes the
// history / bin record, in one transaction (both or neither — a failure
// leaves the record intact and the active list unchanged). Daily rows go back
// to the active Daily list (plans/daily). If the active list already has a row with
// the same id, it is not added again; the record is still removed, so
// nothing is duplicated. `index` (Undo only) puts the row back at its old
// position; otherwise it is added last.
function restoreEntry(entryRef, index) {
  return runTransaction(db, async (tx) => {
    const entrySnap = await tx.get(entryRef)
    if (!entrySnap.exists()) return { destination: null } // already restored elsewhere
    const entry = entrySnap.data()

    const isDaily = entry.type === 'daily'
    const planId = PLAN_IDS[entry.type]
    if (!planId) throw new Error(`Unknown entry type: ${entry.type}`)

    const targetRef = planRef(planId)
    const targetSnap = await tx.get(targetRef)
    const items = isDaily ? itemsOf(targetSnap) : planItemsOf(targetSnap)
    const row = isDaily
      ? { id: entry.id, time: entry.time ?? '', task: entry.task, notes: entry.notes ?? '' }
      : {
          id: entry.id,
          targetDate: entry.targetDate ?? '',
          task: entry.task,
          notes: entry.notes ?? '',
        }

    if (!items.some((item) => item.id === entry.id)) {
      const next = insertAt(items, row, index)
      tx.set(targetRef, {
        items: isDaily ? normalize(next) : normalizePlan(next),
        updatedAt: serverTimestamp(),
      })
    }
    tx.delete(entryRef)
    // `key` matches the list's useSyncedItems key (the plan id).
    return { destination: planId, key: planId, row, index }
  })
}

// Completed History ↩ Restore (and Undo complete).
export function restoreHistoryItem(itemId, index) {
  return restoreEntry(historyRef(itemId), index)
}

// Recycle Bin Restore (and Undo delete).
export function restoreBinItem(itemId, index) {
  return restoreEntry(binRef(itemId), index)
}

// ---------- Completed history ----------

// Most recent completions first. `completedAt` is estimated locally until the
// server confirms it, so a just-completed row shows at the top immediately.
export function subscribeHistory(onEntries, onError, max = 50) {
  const q = query(
    collection(db, ...userPath(), 'completedHistory'),
    orderBy('completedAt', 'desc'),
    limit(max),
  )
  return onSnapshot(
    q,
    (snap) => onEntries(snap.docs.map((d) => d.data({ serverTimestamps: 'estimate' }))),
    onError,
  )
}

// ---------- Recycle Bin ----------

// Most recently deleted first (same estimate trick as history).
export function subscribeBin(onEntries, onError, max = 50) {
  const q = query(
    collection(db, ...userPath(), 'recycleBin'),
    orderBy('deletedAt', 'desc'),
    limit(max),
  )
  return onSnapshot(
    q,
    (snap) => onEntries(snap.docs.map((d) => d.data({ serverTimestamps: 'estimate' }))),
    onError,
  )
}

// The only permanent delete in the Planner (after the user confirms).
export function deleteBinItem(itemId) {
  return deleteDoc(binRef(itemId))
}

// ---------- Settings (important date countdown) ----------

export async function getPlannerSettings() {
  return settingsOf(await getDoc(settingsRef()))
}

export function subscribePlannerSettings(onSettings, onError) {
  return onSnapshot(settingsRef(), (snap) => onSettings(settingsOf(snap)), onError)
}

export function savePlannerSettings({ importantDateLabel, importantDate }) {
  return setDoc(
    settingsRef(),
    { importantDateLabel, importantDate, updatedAt: serverTimestamp() },
    { merge: true },
  )
}
