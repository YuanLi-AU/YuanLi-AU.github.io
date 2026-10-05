import { profile } from '../../data/resume.js'
import Icon from './Icon.jsx'

// Disabled until a public resume (no phone / referee details) is placed in
// public/ and profile.resumeUrl is set. Never link the private PDF.
export default function ResumeButton() {
  if (!profile.resumeUrl) {
    return (
      <button type="button" className="btn btn-soft" disabled title="Public resume coming soon">
        <Icon name="document" size={18} /> Resume <span className="btn-note">Coming soon</span>
      </button>
    )
  }

  return (
    <a href={profile.resumeUrl} className="btn btn-soft" download>
      <Icon name="document" size={18} /> Download Resume
    </a>
  )
}
