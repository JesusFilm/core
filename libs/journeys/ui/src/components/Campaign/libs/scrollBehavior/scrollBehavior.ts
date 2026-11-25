/**
 * How a scripted scroll moves: smoothly, unless the visitor asks for reduced
 * motion, when it jumps (`auto`). The CSS twin is the page's
 * `scroll-behavior: smooth` under `prefers-reduced-motion: no-preference`.
 */
export function scrollBehavior(): ScrollBehavior {
  if (typeof window.matchMedia !== 'function') return 'smooth'
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
}
