// The "YL" identity mark shared by the Portfolio and the Planner — text +
// CSS only (styles in src/index.css), matching the PWA icon. Decorative:
// the visible name next to it carries the meaning for screen readers.
export default function BrandMark({ large = false }) {
  return (
    <span className={large ? 'yl-mark yl-mark-lg' : 'yl-mark'} aria-hidden="true">
      YL
    </span>
  )
}
