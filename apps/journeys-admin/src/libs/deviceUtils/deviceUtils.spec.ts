import { hasTouchScreen } from './deviceUtils'

describe('hasTouchScreen', () => {
  const originalNavigator = { ...global.navigator }

  beforeEach(() => {
    Object.assign(navigator, { ...originalNavigator })
  })

  afterEach(() => {
    jest.resetAllMocks()
    Object.assign(navigator, originalNavigator)
  })

  it('should return false if device does not have a touch screen', () => {
    Object.assign(navigator, {
      maxTouchPoints: 0,
      msMaxTouchPoints: 0
    })
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: query === '(pointer:coarse)',
        media: query
      }
    })
    expect(hasTouchScreen()).toBe(false)
  })

  it('should return true if device has a touch screen', () => {
    Object.assign(navigator, {
      maxTouchPoints: 10
    })
    expect(hasTouchScreen()).toBe(true)
  })

  it('should return true if matchMedia matches pointer:coarse', () => {
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: query === '(pointer:coarse)',
        media: query
      }
    })
    expect(hasTouchScreen()).toBe(true)
  })

  it('should return true if "orientation" is in window', () => {
    Object.assign(window, {
      orientation: {}
    })
    expect(hasTouchScreen()).toBe(true)
  })

  it('should return true if device is detected via user agent', () => {
    // Cannot set property userAgent with Object.assign
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Android',
      configurable: true
    })
    expect(hasTouchScreen()).toBe(true)
  })

  it('should return false if none of the conditions are met', () => {
    Object.assign(navigator, 'maxTouchPoints', {
      maxTouchPoints: 0,
      msMaxTouchPoints: 0
    })
    // Cannot set property userAgent with Object.assign
    Object.defineProperty(navigator, 'userAgent', {
      value: '',
      configurable: true
    })
    window.matchMedia = jest.fn().mockImplementation(() => {
      return {
        matches: false,
        media: ''
      }
    })
    Object.assign(window, {
      orientation: undefined
    })
    expect(hasTouchScreen()).toBe(false)
  })
})
