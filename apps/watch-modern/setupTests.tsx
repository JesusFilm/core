import '@testing-library/jest-dom/vitest'
import 'isomorphic-fetch'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 2500 })
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  )
}))

Object.defineProperty(
  window.navigator,
  'userAgent',
  ((value) => ({
    get() {
      return value
    },
    set(v) {
      value = v
    }
  }))(window.navigator.userAgent)
)

vi.mock(
  'next/router',
  () => import(/* webpackChunkName: "next-router-mock" */ 'next-router-mock')
)
