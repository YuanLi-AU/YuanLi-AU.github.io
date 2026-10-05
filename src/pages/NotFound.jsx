import { Link } from 'react-router'

export default function NotFound() {
  return (
    <main className="page">
      <h1>404</h1>
      <p>This page doesn&apos;t exist.</p>
      <Link to="/">← Back to Home</Link>
    </main>
  )
}
