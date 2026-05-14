import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 5000 })

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

  return {
    default: (loader: () => Promise<unknown>) => {
      void loader().then((mod) => {
        const resolved = (mod as { default?: AnyComponent }).default ??
          (mod as AnyComponent)
        cache.set(loader, resolved)
      })

      return function DynamicComponent(
        props: Record<string, unknown>
      ): React.ReactElement | null {
        const [Component, setComponent] = React.useState<AnyComponent | null>(
          () => cache.get(loader) ?? null
        )
        React.useEffect(() => {
          if (Component != null) return
          let cancelled = false
          void loader().then((mod) => {
            if (cancelled) return
            const resolved = (mod as { default?: AnyComponent }).default ??
              (mod as AnyComponent)
            cache.set(loader, resolved)
            setComponent(() => resolved)
          })
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
