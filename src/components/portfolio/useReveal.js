import { useEffect, useRef } from 'react'

// Adds `is-visible` to each child matching `selector` once it scrolls into
// view (one time). The hidden start state only applies while the container
// has `reveal-on`, which is added here — so content is always visible
// without JS, without IntersectionObserver, and with reduced motion.
export default function useReveal(selector) {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    const items = [...root.querySelectorAll(selector)]
    const show = (el) => el.classList.add('is-visible')
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(show)
      return undefined
    }

    root.classList.add('reveal-on')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target)
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [selector])

  return ref
}
