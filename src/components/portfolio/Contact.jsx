import { useLayoutEffect } from 'react'
import { profile, referees } from '../../data/resume.js'
import Icon from './Icon.jsx'
import { MAP_OUTLINES } from './mapOutlines.js'
import Section from './Section.jsx'
import ResumeButton from './ResumeButton.jsx'
import useReveal from './useReveal.js'

const map = MAP_OUTLINES.australia
const { contact } = map
const [boxLeft, boxTop, boxWidth, boxHeight] = contact.box
const [resumeLeft, resumeTop, resumeWidth, resumeHeight] = contact.resume

// Wide screens: the contact details sit inside the Australia outline, in a
// box computed from the outline (mapOutlines.js), with the Resume button on
// its own in the south-east — only if the map fits the column and both really
// fit their boxes in the visitor's font. Otherwise the outline is shown on
// its own, with the details and then the Resume button below it.
export default function Contact() {
  const rootRef = useReveal('.contact-map')

  useLayoutEffect(() => {
    const root = rootRef.current
    const details = root.querySelector('.contact-details')
    const resume = root.querySelector('.contact-resume')
    // Width available to the map: the section's content column
    const column = root.parentElement
    const update = () => {
      if (column.clientWidth < contact.width) {
        root.classList.remove('is-inmap')
        return
      }
      root.classList.add('is-inmap')
      const fits =
        details.scrollHeight <= boxHeight &&
        details.scrollWidth <= boxWidth &&
        resume.scrollWidth <= resumeWidth &&
        resume.scrollHeight <= resumeHeight
      root.classList.toggle('is-inmap', fits)
    }
    update()
    let width = column.clientWidth
    const observer = new ResizeObserver(() => {
      if (column.clientWidth !== width) {
        width = column.clientWidth
        update()
      }
    })
    observer.observe(column)
    document.fonts?.ready.then(update)
    return () => observer.disconnect()
  }, [rootRef])

  return (
    <Section id="contact" title="Contact" accent="teal">
      <div
        className="contact-wrap accent-teal"
        ref={rootRef}
        style={{
          '--map-w': `${contact.width}px`,
          '--map-h': `${contact.height}px`,
          '--box-l': `${boxLeft}px`,
          '--box-t': `${boxTop}px`,
          '--box-w': `${boxWidth}px`,
          '--box-h': `${boxHeight}px`,
          '--resume-l': `${resumeLeft}px`,
          '--resume-t': `${resumeTop}px`,
        }}
      >
        <div className="contact-map">
          {/* Decorative outline; drawn once when it comes into view */}
          <svg className="contact-map-svg" viewBox={map.viewBox} aria-hidden="true" focusable="false">
            <path d={map.d} pathLength="1" />
          </svg>
        </div>

        <div className="contact-details">
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
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn profile ↗
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
        </div>

        <div className="contact-resume">
          <ResumeButton />
        </div>
      </div>
    </Section>
  )
}
