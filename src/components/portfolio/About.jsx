import { useLayoutEffect } from 'react'
import { about } from '../../data/resume.js'
import { MAP_OUTLINES } from './mapOutlines.js'
import Section from './Section.jsx'
import useReveal from './useReveal.js'

// Wide screens: the two maps sit side by side and each text is set line by
// line inside its country outline (rows from mapOutlines.js, words measured
// in the visitor's real font). The real h3 / p stay in the page for screen
// readers and search engines; the drawn lines are aria-hidden.
// Narrow screens, or if anything does not fit: map on top, full text below.
const WIDE = '(min-width: 1200px)'

// Row set for the current viewport (largest map size that fits)
const sizeFor = (map) => map.lines.filter((size) => window.innerWidth >= size.minWidth).at(-1)

// Greedy line filling: returns the lines, or null if the words run out of
// rows. A row too narrow for the next word is skipped (left empty), unless
// `strict` (the heading must use consecutive rows).
function fill(words, measure, slots, strict = false) {
  const lines = []
  let i = 0
  for (const slot of slots) {
    if (i >= words.length) break
    if (measure(words[i]) > slot.width) {
      if (strict) return null
      continue
    }
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
  const heading = block.querySelector('h3').textContent.split(' ')
  const words = block.querySelector('p').textContent.split(' ')

  // Measure in the same classes (font, size, letter-spacing) as the drawn lines
  const probe = (cls) => {
    const el = document.createElement('span')
    el.className = `about-line ${cls}`
    el.style.visibility = 'hidden'
    layer.append(el)
    return (text) => {
      el.textContent = text
      return el.getBoundingClientRect().width
    }
  }
  const measureHead = probe('about-line-head')
  const measureText = probe('about-line-text')

  const slots = rows.flatMap((r, row) => (r ? [{ row, left: r[0], width: r[1] - r[0] }] : []))
  const fits = []
  for (let start = 0; start < slots.length; start++) {
    // Heading: one line, or two lines in the same part of the country
    const head = fill(heading, measureHead, slots.slice(start, start + 2), true)
    if (!head) continue
    if (head.length === 2 && (head[1].row !== head[0].row + 1 || Math.abs(head[1].left - head[0].left) > 80)) continue
    const text = fill(words, measureText, slots.slice(start + head.length))
    if (text) fits.push({ head, text })
  }
  layer.replaceChildren()
  if (!fits.length) return false

  // Prefer a one-line heading; of those positions, use the middle one
  const oneLine = fits.filter((f) => f.head.length === 1)
  const pool = oneLine.length ? oneLine : fits
  const { head, text } = pool[Math.floor((pool.length - 1) / 2)]
  for (const [lines, cls] of [
    [head, 'about-line-head'],
    [text, 'about-line-text'],
  ]) {
    for (const line of lines) {
      const el = document.createElement('span')
      el.className = `about-line ${cls}`
      el.textContent = line.text
      el.style.left = `${line.left}px`
      el.style.top = `${line.row * lineHeight}px`
      layer.append(el)
    }
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
          const [, , w, h] = map.viewBox.split(' ').map(Number)
          return (
            <article
              key={block.heading}
              data-map={block.map}
              className={`about-block about-${block.map} accent-${block.accent}`}
              style={{
                '--map-ratio': h / w,
                '--lx': map.label[0] / 100,
                '--ly': map.label[1] / 100,
              }}
            >
              <div className="about-frame">
                {/* Decorative outline; drawn once when it comes into view */}
                <svg className="about-map" viewBox={map.viewBox} aria-hidden="true" focusable="false">
                  <path d={map.d} pathLength="1" />
                </svg>
                <h3>{block.heading}</h3>
                <p>{block.text}</p>
                {/* Wide screens: the same heading and text, drawn line by line */}
                <div className="about-lines" aria-hidden="true" />
              </div>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
