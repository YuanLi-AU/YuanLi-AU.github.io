import { useState } from 'react'
import { Link } from 'react-router'
import { profile } from '../../data/resume.js'
import Icon from './Icon.jsx'

const LINKS = [
  ['about', 'About'],
  ['projects', 'Projects'],
  ['experience', 'Experience'],
  ['skills', 'Skills'],
  ['education', 'Education'],
  ['contact', 'Contact'],
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#top" className="nav-brand" onClick={close}>
          {profile.name}
        </a>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <nav id="nav-menu" className={open ? 'nav-menu open' : 'nav-menu'}>
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={close}>
              {label}
            </a>
          ))}
          {/* Low-key entry to the private planner */}
          <Link to="/planner" className="nav-signin">
            <Icon name="lock" size={15} /> Sign in
          </Link>
        </nav>
      </div>
    </header>
  )
}
