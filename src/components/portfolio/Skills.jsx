import { skills } from '../../data/resume.js'
import Section from './Section.jsx'
import Tags from './Tags.jsx'

export default function Skills() {
  return (
    <Section id="skills" title="Skills" accent="purple">
      <div className="skill-groups">
        {skills.map((group) => (
          <div
            key={group.group}
            className={group.studied ? 'skill-group studied' : `skill-group accent-${group.accent}`}
          >
            <h3>{group.group}</h3>
            <Tags items={group.items} muted={group.studied} />
          </div>
        ))}
      </div>
    </Section>
  )
}
