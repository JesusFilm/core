import '@testing-library/jest-dom'
import 'isomorphic-fetch'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }) => <img src={src} alt={alt} />
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

jest.mock('next/router', () => require('next-router-mock'))

// Mock PointerEvent and HTMLElement methods for shadcn/ui Select component testing
function createMockPointerEvent(
  type: string,
  props: PointerEventInit = {}
): PointerEvent {
  const event = new Event(type, props) as PointerEvent
  Object.assign(event, {
    button: props.button ?? 0,
    ctrlKey: props.ctrlKey ?? false,
    pointerType: props.pointerType ?? 'mouse'
  })
  return event
}

// Mock PointerEvent globally - needed for shadcn/ui Select component testing
Object.defineProperty(window, 'PointerEvent', {
  writable: true,
  value: createMockPointerEvent as any
})

// Mock HTMLElement methods globally - needed for shadcn/ui Select component testing
Object.assign(window.HTMLElement.prototype, {
  scrollIntoView: jest.fn(),
  releasePointerCapture: jest.fn(),
  hasPointerCapture: jest.fn()
})

if (process.env.CI === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
