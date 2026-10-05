import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'

// Loaded on demand so the public Portfolio never downloads Firebase.
const Planner = lazy(() => import('./pages/Planner.jsx'))

// Every top-level path here (except "*") needs a matching HTML copy in
// scripts/copy-spa-html.js so GitHub Pages can serve it on refresh.
export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route
        path="planner"
        element={
          <Suspense fallback={null}>
            <Planner />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
