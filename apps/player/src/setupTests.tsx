import '@testing-library/jest-dom'
import 'isomorphic-fetch'
import { configure } from '@testing-library/react'
import type Player from 'video.js/dist/types/player'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/image', () => ({
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

jest.mock('next-intl', () => ({
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

jest.mock('next-intl/server', () => ({
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

const mockSetTheme = jest.fn()
const mockTheme = { theme: 'light', setTheme: mockSetTheme }

jest.mock('next-themes', () => ({
  useTheme: () => mockTheme,
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children
}))

const mockPlayer = {
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  paused: jest.fn().mockReturnValue(true),
  currentTime: jest.fn().mockReturnValue(0),
  duration: jest.fn().mockReturnValue(0),
  buffered: jest.fn().mockReturnValue({
    length: 0,
    start: jest.fn(),
    end: jest.fn()
  }),
  muted: jest.fn().mockReturnValue(false),
  volume: jest.fn().mockReturnValue(1),
  isFullscreen: jest.fn().mockReturnValue(false),
  requestFullscreen: jest.fn().mockResolvedValue(undefined),
  exitFullscreen: jest.fn().mockResolvedValue(undefined),
  isDisposed: jest.fn().mockReturnValue(false),
  dispose: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  src: jest.fn(),
  poster: jest.fn()
}

jest.mock('video.js', () => {
  const mockVideojs = jest.fn(() => mockPlayer as unknown as Player)
  ;(mockVideojs as unknown as { getPlayer: jest.Mock }).getPlayer = jest.fn(
    () => mockPlayer as unknown as Player
  )
  return {
    __esModule: true,
    default: mockVideojs
  }
})

jest.mock('videojs-mux', () => ({}))

jest.mock('react-transition-group', () => ({
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

jest.mock('next/router', () => require('next-router-mock'))

if (process.env['CI'] === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })

export { mockPlayer, mockSetTheme, mockTheme }
