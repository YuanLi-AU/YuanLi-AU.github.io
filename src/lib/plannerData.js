// Planner data access (Firestore). Schema:
//
//   users/{uid}/dailyPlans/{YYYY-MM-DD}
//     date:      "2026-10-06"
//     items:     [{ id, time, task, done, notes }]   // time may be ""
//     updatedAt: server timestamp
//
//   users/{uid}/settings/planner
//     importantDateLabel: "Graduation"
//     importantDate:      "2026-11-30"
//     updatedAt:          server timestamp
//
// The uid always comes from the signed-in Firebase user; firestore.rules
// decide whether that uid is allowed. Nothing else (email, password) is stored.
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase.js'

function userDoc(...path) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Planner data requires a signed-in user.')
  return doc(db, 'users', uid, ...path)
}

const dailyPlanRef = (dateKey) => userDoc('dailyPlans', dateKey)
const settingsRef = () => userDoc('settings', 'planner')

const itemsOf = (snap) => (snap.exists() ? (snap.data().items ?? []) : [])
const settingsOf = (snap) => (snap.exists() ? snap.data() : null)

// ---------- Daily plan ----------

export function createItem() {
  return { id: crypto.randomUUID(), time: '', task: '', done: false, notes: '' }
}

export async function getDailyPlan(dateKey) {
  return itemsOf(await getDoc(dailyPlanRef(dateKey)))
}

// Live updates across devices. Returns the unsubscribe function.
export function subscribeDailyPlan(dateKey, onItems, onError) {
  return onSnapshot(dailyPlanRef(dateKey), (snap) => onItems(itemsOf(snap)), onError)
}

// Saves the whole day's list (last write wins — fine for a single user).
export function saveDailyPlan(dateKey, items) {
  return setDoc(dailyPlanRef(dateKey), { date: dateKey, items, updatedAt: serverTimestamp() })
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
