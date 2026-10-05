import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../lib/firebase.js'

// Current Firebase user. `undefined` while the saved session is being
// restored, then the user object or `null`.
export default function useAuthUser() {
  const [user, setUser] = useState(undefined)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  return user
}
