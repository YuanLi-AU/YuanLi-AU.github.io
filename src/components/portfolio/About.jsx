import { useLayoutEffect } from 'react'
import { about } from '../../data/resume.js'
import { MAP_OUTLINES } from './mapOutlines.js'
import Section from './Section.jsx'
import useReveal from './useReveal.js'

// Wide screens: the two maps sit side by side and each text is set line by
// line inside its country outline (rows from mapOutlines.js, words measured
// in the visitor's real font); each heading sits above its map. The real p
// stays in the page for screen readers and search engines; the drawn lines
// are aria-hidden.
// Narrow screens, or if anything does not fit: map on top, full text below.
const WIDE = '(min-width: 1200px)'

// Row set for the current viewport (largest map size that fits)
const sizeFor = (map) => map.lines.filter((size) => window.innerWidth >= size.minWidth).at(-1)

// Greedy line filling: returns the lines, or null if the words run out of
// rows. A row too narrow for the next word is skipped (left empty).
function fill(words, measure, slots) {
  const lines = []
  let i = 0
  for (const slot of slots) {
    if (i >= words.length) break
    if (measure(words[i]) > slot.width) continue
    let text = words[i++]
    while (i < words.length && measure(`${text} ${words[i]}`) <= slot.width) text += ` ${words[i++]}`
    lines.push({ ...slot, text })
  }
  return i >= words.length ? lines : null
}

function layoutBlock(block) {
  const size = sizeFor(MAP_OUTLINES[block.dataset.map])
  if (!size) return false
  const { rows, lineHeight } = size
  block.style.setProperty('--map-w', `${size.width}px`)
  block.style.setProperty('--map-h', `${size.height}px`)
  const layer = block.querySelector('.about-lines')
  const words = block.querySelector('p').textContent.split(' ')

  // Measure in the same class (font, size) as the drawn lines
  const probe = document.createElement('span')
  probe.className = 'about-line'
  probe.style.visibility = 'hidden'
  layer.append(probe)
  const measure = (text) => {
    probe.textContent = text
    return probe.getBoundingClientRect().width
  }

  const slots = rows.flatMap((r, row) => (r ? [{ row, left: r[0], width: r[1] - r[0] }] : []))
  const fits = []
  for (let start = 0; start < slots.length; start++) {
    const lines = fill(words, measure, slots.slice(start))
    if (lines) fits.push(lines)
  }
  layer.replaceChildren()
  if (!fits.length) return false

  // Keep reading order natural: each line should overlap the one above it by
  // at least half its width (no jumps between distant parts of the country).
  // Of those layouts, use the middle start row (text sits centrally).
  const overlaps = (a, b) =>
    Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left) >= Math.min(a.width, b.width) / 2
  const flowing = fits.filter((lines) => lines.every((line, i) => i === 0 || overlaps(lines[i - 1], line)))
  const pool = flowing.length ? flowing : fits
  for (const line of pool[Math.floor((pool.length - 1) / 2)]) {
    const el = document.createElement('span')
    el.className = 'about-line'
    el.textContent = line.text
    el.style.left = `${line.left}px`
    el.style.top = `${line.row * lineHeight}px`
    layer.append(el)
  }
  return true
}

export default function About() {
  const mapsRef = useReveal('.about-block')

  useLayoutEffect(() => {
    const root = mapsRef.current
    const wide = window.matchMedia(WIDE)
    const update = () => {
      const blocks = [...root.querySelectorAll('.about-block')]
      root.classList.toggle('is-inmap', wide.matches)
      const ok = wide.matches && blocks.every(layoutBlock)
      if (!ok) {
        root.classList.remove('is-inmap')
        blocks.forEach((b) => b.querySelector('.about-lines').replaceChildren())
      }
    }
    // Re-layout when the viewport crosses a map-size breakpoint
    const sizes = [...new Set(Object.values(MAP_OUTLINES).flatMap((m) => m.lines.map((l) => l.minWidth)))]
    const queries = sizes.map((w) => window.matchMedia(`(min-width: ${w}px)`))
    update()
    queries.forEach((q) => q.addEventListener('change', update))
    document.fonts?.ready.then(update)
    return () => queries.forEach((q) => q.removeEventListener('change', update))
  }, [mapsRef])

  return (
    <Section id="about" title="About Me" accent="teal">
      <div className="about-maps" ref={mapsRef}>
        {about.map((block) => {
          const map = MAP_OUTLINES[block.map]
          return (
            <article
              key={block.heading}
              data-map={block.map}
              className={`about-block about-${block.map} accent-${block.accent}`}
              style={{
              }}
            >
              <h3>{block.heading}</h3>
              <div className="about-frame">
                {/* Decorative outline; drawn once when it comes into view */}
                <svg className="about-map" viewBox={map.viewBox} aria-hidden="true" focusable="false">
                  <path d={map.d} pathLength="1" />
                </svg>
                <p>{block.text}</p>
                {/* Wide screens: the same text, drawn line by line */}
                <div className="about-lines" aria-hidden="true" />
              </div>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
