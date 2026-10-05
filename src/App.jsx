import { Routes, Route } from 'react-router'
import Home from './pages/Home.jsx'
import Planner from './pages/Planner.jsx'
import NotFound from './pages/NotFound.jsx'

// Every top-level path here (except "*") needs a matching HTML copy in
// scripts/copy-spa-html.js so GitHub Pages can serve it on refresh.
export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="planner" element={<Planner />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
