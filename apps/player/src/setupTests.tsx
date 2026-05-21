import '@testing-library/jest-dom/vitest'
import 'isomorphic-fetch'
import { ReadableStream, TransformStream, WritableStream } from 'stream/web'

import { configure } from '@testing-library/react'
import type Player from 'video.js/dist/types/player'
import type { Mock } from 'vitest'

if (typeof globalThis.TransformStream === 'undefined') {
  Object.assign(globalThis, { ReadableStream, TransformStream, WritableStream })
}

configure({ asyncUtilTimeout: 2500 })

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    priority,
    unoptimized,
    ...props
  }: {
    src: string
    alt: string
    priority?: boolean
    unoptimized?: boolean
  }) => <img src={src} alt={alt} {...props} />
}))

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, values?: Record<string, unknown>) => {
      if (key.includes('.')) {
        return key
      }
      return values ? `${key} ${JSON.stringify(values)}` : key
    }
    t.rich = (key: string, values?: Record<string, unknown>) => {
      if (!values) return key
      let text = key

      Object.entries(values).forEach(([name, value]) => {
        if (
          typeof value !== 'function' &&
          name !== 'strong' &&
          name !== 'link'
        ) {
          text = text.replace(`{${name}}`, String(value))
        }
      })

      if (values['strong'] && typeof values['strong'] === 'function') {
        return values['strong'](text)
      }

      return text
    }
    return t
  },
  getTranslations: async () => {
    return (key: string, values?: Record<string, unknown>) => {
      if (key.includes('.')) {
        return key
      }
      return values ? `${key} ${JSON.stringify(values)}` : key
    }
  }
}))

vi.mock('next-intl/server', () => ({
  getTranslations: async () => {
    return (key: string, values?: Record<string, unknown>) => {
      if (key.includes('.')) {
        return key
      }
      return values ? `${key} ${JSON.stringify(values)}` : key
    }
  },
  getLocale: async () => 'en'
}))

const mockSetTheme = vi.fn()
const mockTheme = { theme: 'light', setTheme: mockSetTheme }

vi.mock('next-themes', () => ({
  useTheme: () => mockTheme,
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children
}))

const mockPlayer = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  paused: vi.fn().mockReturnValue(true),
  currentTime: vi.fn().mockReturnValue(0),
  duration: vi.fn().mockReturnValue(0),
  buffered: vi.fn().mockReturnValue({
    length: 0,
    start: vi.fn(),
    end: vi.fn()
  }),
  muted: vi.fn().mockReturnValue(false),
  volume: vi.fn().mockReturnValue(1),
  isFullscreen: vi.fn().mockReturnValue(false),
  requestFullscreen: vi.fn().mockResolvedValue(undefined),
  exitFullscreen: vi.fn().mockResolvedValue(undefined),
  isDisposed: vi.fn().mockReturnValue(false),
  dispose: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  src: vi.fn(),
  poster: vi.fn()
}

vi.mock('video.js', () => {
  const mockVideojs = vi.fn(() => mockPlayer as unknown as Player)
  ;(mockVideojs as unknown as { getPlayer: Mock }).getPlayer = vi.fn(
    () => mockPlayer as unknown as Player
  )
  return {
    __esModule: true,
    default: mockVideojs
  }
})

vi.mock('videojs-mux', () => ({}))

vi.mock('react-transition-group', () => ({
  CSSTransition: ({
    children,
    in: inProp
  }: {
    children: React.ReactNode
    in: boolean
  }) => (inProp ? children : null)
}))

Object.defineProperty(window.navigator, 'userAgent', {
  writable: true,
  value: ''
})

Object.defineProperty(window.navigator, 'platform', {
  writable: true,
  value: ''
})

Object.defineProperty(window.navigator, 'maxTouchPoints', {
  writable: true,
  value: 0
})

Object.defineProperty(window.navigator, 'vendor', {
  writable: true,
  value: ''
})

vi.mock(
  'next/router',
  () => import(/* webpackChunkName: "next-router-mock" */ 'next-router-mock')
)

export { mockPlayer, mockSetTheme, mockTheme }
