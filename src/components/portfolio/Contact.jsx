import { profile, referees } from '../../data/resume.js'
import Icon from './Icon.jsx'
import Section from './Section.jsx'
import ResumeButton from './ResumeButton.jsx'

export default function Contact() {
  return (
    <Section id="contact" title="Contact" accent="teal">
      <div className="contact-card">
        <p className="contact-intro">
          The best way to reach me is by email. I’m based in {profile.location}.
        </p>

        <ul className="contact-list">
          <li>
            <span className="contact-label">
              <Icon name="mail" size={18} /> Email
            </span>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
          <li>
            <span className="contact-label">
              <Icon name="linkedin" size={18} /> LinkedIn
            </span>
            {profile.linkedin ? (
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                View profile ↗
              </a>
            ) : (
              <span className="muted">Coming soon</span>
            )}
          </li>
          <li>
            <span className="contact-label">
              <Icon name="users" size={18} /> Referees
            </span>
            <span>{referees}</span>
          </li>
        </ul>

        <ResumeButton />
      </div>
    </Section>
  )
}
