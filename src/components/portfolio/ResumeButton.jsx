import { profile } from '../../data/resume.js'
import Icon from './Icon.jsx'

// Opens the public resume (public/resume/) in a new tab; disabled while
// profile.resumeUrl is empty. Never link the private PDF.
export default function ResumeButton() {
  if (!profile.resumeUrl) {
    return (
      <button type="button" className="btn btn-soft" disabled title="Public resume coming soon">
        <Icon name="document" size={18} /> Resume <span className="btn-note">Coming soon</span>
      </button>
    )
  }

  return (
    <a href={profile.resumeUrl} className="btn btn-soft" target="_blank" rel="noopener noreferrer">
      <Icon name="document" size={18} /> Resume
    </a>
  )
}
