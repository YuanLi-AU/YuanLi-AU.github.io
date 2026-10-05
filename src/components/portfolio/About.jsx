import { about } from '../../data/resume.js'
import Section from './Section.jsx'

export default function About() {
  return (
    <Section id="about" title="About Me" accent="teal">
      <div className="about-grid">
        {about.map((block) => (
          <div key={block.heading} className={`about-block accent-${block.accent}`}>
            <h3>{block.heading}</h3>
            <p>{block.text}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
