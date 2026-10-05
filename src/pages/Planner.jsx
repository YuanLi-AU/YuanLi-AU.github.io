import useAuthUser from '../components/planner/useAuthUser.js'
import UnlockScreen from '../components/planner/UnlockScreen.jsx'
import PlannerHome from '../components/planner/PlannerHome.jsx'
import '../components/planner/planner.css'

// Private Planner. Identity always comes from Firebase Auth — this screen
// switch is UI only; the data itself will be protected by Firestore rules.
export default function Planner() {
  const user = useAuthUser()

  if (user === undefined) {
    // Restoring a saved session: show a quiet state instead of flashing Unlock.
    return (
      <main className="pl-loading" aria-busy="true">
        <span className="pl-spinner" aria-label="Loading" />
      </main>
    )
  }

  return user ? <PlannerHome /> : <UnlockScreen />
}
