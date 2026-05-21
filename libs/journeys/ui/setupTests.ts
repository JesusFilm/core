import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'
import videojs from 'video.js'

configure({ asyncUtilTimeout: 5000 })

// jsdom does not implement HTMLMediaElement playback. video.js calls these on
// the underlying element; left unstubbed they emit "Not implemented" jsdom
// errors. Stub them as no-ops (play resolves, matching the real Promise API).
Object.defineProperties(window.HTMLMediaElement.prototype, {
  play: { configurable: true, value: () => Promise.resolve() },
  pause: { configurable: true, value: () => undefined },
  load: { configurable: true, value: () => undefined }
})

// video.js schedules animation frames; if one is still queued when jsdom tears
// the window down, `window.requestAnimationFrame` reads back undefined and
// throws. Back it with timers so it is always callable.
if (typeof window.requestAnimationFrame !== 'function') {
  window.requestAnimationFrame = (cb) =>
    setTimeout(() => cb(Date.now()), 0) as unknown as number
  window.cancelAnimationFrame = (id) => clearTimeout(id)
}

// Component specs render video.js players that are never disposed. A deferred
// `player.play()`/`pause()` stays queued in video.js's ready-queue timer and,
// under Vitest (unlike Jest, which tore down jsdom between files), fires after
// the test when the tech is already gone — throwing as an unhandled error that
// fails whichever spec happens to be running. Disposing every player after
// each test clears those tracked timers before they fire.
afterEach(() => {
  try {
    videojs.getAllPlayers().forEach((player) => player?.dispose())
  } catch {
    // Best-effort teardown — ignore players already disposed by their spec.
  }
})

vi.mock(
  'next/router',
  () => import(/* webpackChunkName: "next-router-mock" */ 'next-router-mock')
)

// Mirror jest's behaviour where babel transforms `import('./X')` to
// `Promise.resolve(require('./X'))`, making dynamic loads resolve before the
// next render. Vitest keeps the import async, so first render returns null
// and a microtask later the loaded component appears. Tests that interact
// with dynamically-loaded components must `await waitFor(...)` after render.
vi.mock('next/dynamic', async () => {
  const React = await import(/* webpackChunkName: "react" */ 'react')
  type AnyComponent = React.ComponentType<Record<string, unknown>>
  const cache = new Map<unknown, AnyComponent>()

  const resolveComponent = (mod: unknown): AnyComponent | null => {
    if (mod == null) return null
    return (mod as { default?: AnyComponent }).default ?? (mod as AnyComponent)
  }

  return {
    default: (loader: () => Promise<unknown>) => {
      void loader()
        .then((mod) => {
          const resolved = resolveComponent(mod)
          if (resolved != null) cache.set(loader, resolved)
        })
        // Loads can still be in flight when a test tears down; swallow the
        // late rejection so it does not surface as an unhandled error.
        .catch(() => {})

      return function DynamicComponent(
        props: Record<string, unknown>
      ): React.ReactElement | null {
        const [Component, setComponent] = React.useState<AnyComponent | null>(
          () => cache.get(loader) ?? null
        )
        React.useEffect(() => {
          if (Component != null) return
          let cancelled = false
          void loader()
            .then((mod) => {
              if (cancelled) return
              const resolved = resolveComponent(mod)
              if (resolved == null) return
              cache.set(loader, resolved)
              setComponent(() => resolved)
            })
            .catch(() => {})
          return () => {
            cancelled = true
          }
        }, [Component])

        if (Component == null) return null
        return React.createElement(Component, props)
      }
    }
  }
})
