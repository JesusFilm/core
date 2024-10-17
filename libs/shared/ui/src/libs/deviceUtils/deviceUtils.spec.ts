import {
  hasTouchScreen,
  isIOS,
  isIOSTouchScreen,
  isIPhone,
  isMobile
} from './deviceUtils'

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

describe('iPhone function', () => {
  const originalNavigator = { ...global.navigator }

  beforeEach(() => {
    Object.assign(navigator, { ...originalNavigator })
  })

  afterEach(() => {
    jest.resetAllMocks()
    Object.assign(navigator, originalNavigator)
  })

  test('should return true when userAgent contains "iPhone"', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      configurable: true
    })

    expect(isIPhone()).toBe(true)
  })

  test('should return false when userAgent does not contain "iPhone"', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Linux; Android 11; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.101 Mobile Safari/537.36',
      configurable: true
    })
    expect(isIPhone()).toBe(false)
  })

  test('should return false when userAgent is undefined', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: undefined,
      configurable: true
    })
    expect(isIPhone()).toBe(false)
  })
})

describe('isIPhone/isIOS/isMobile functions', () => {
  const originalNavigator = { ...global.navigator }

  afterAll(() => {
    jest.resetAllMocks()
    Object.assign(navigator, originalNavigator)
  })

  test('isIPhone should return false when navigator is undefined', () => {
    Object.assign(navigator, undefined)
    expect(isIPhone()).toBe(false)
  })

  test('isIOS should return false when navigator is undefined', () => {
    Object.assign(navigator, undefined)
    expect(isIOS()).toBe(false)
  })

  test('isMobile should return false when navigator is undefined', () => {
    Object.assign(navigator, undefined)
    expect(isMobile()).toBe(false)
  })
})

describe('isIOS function', () => {
  test('should return true when userAgent contains iOS devices', () => {
    const iOSUserAgents = [
      'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Safari/605.1.15'
    ]

    iOSUserAgents.forEach((userAgent) => {
      Object.defineProperty(navigator, 'userAgent', {
        value: userAgent,
        configurable: true
      })
      expect(isIOS()).toBe(true)
    })
  })

  test('should return false when userAgent does not contain iOS devices', () => {
    const nonIOSUserAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
    Object.defineProperty(navigator, 'userAgent', {
      value: nonIOSUserAgent,
      configurable: true
    })
    expect(isIOS()).toBe(false)
  })

  test('should return false when userAgent is undefined', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: undefined,
      configurable: true
    })
    expect(isIOS()).toBe(false)
  })
})

describe('isIOSTouchScreen function', () => {
  test('should return true when userAgent contains iOS devices', () => {
    const iOSUserAgents = [
      'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    ]

    iOSUserAgents.forEach((userAgent) => {
      Object.defineProperty(navigator, 'userAgent', {
        value: userAgent,
        configurable: true
      })
      expect(isIOSTouchScreen()).toBe(true)
    })
  })

  test('should return false when userAgent does not contain iOS devices', () => {
    const nonIOSUserAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
    Object.defineProperty(navigator, 'userAgent', {
      value: nonIOSUserAgent,
      configurable: true
    })
    expect(isIOSTouchScreen()).toBe(false)
  })

  test('should return false when userAgent is undefined', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: undefined,
      configurable: true
    })
    expect(isIOSTouchScreen()).toBe(false)
  })
})

describe('isMobile function', () => {
  test('should return true when userAgent contains mobile devices', () => {
    const mobileUserAgents = [
      'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; Lumia 950 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Mobile Safari/537.36',
      'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    ]

    mobileUserAgents.forEach((userAgent) => {
      Object.defineProperty(navigator, 'userAgent', {
        value: userAgent,
        configurable: true
      })
      expect(isMobile()).toBe(true)
    })
  })

  test('should return false when userAgent does not contain mobile devices', () => {
    const nonMobileUserAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Safari/605.1.15'
    Object.defineProperty(navigator, 'userAgent', {
      value: nonMobileUserAgent,
      configurable: true
    })
    expect(isMobile()).toBe(false)
  })

  test('should return false when userAgent is undefined', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: undefined,
      configurable: true
    })
    expect(isMobile()).toBe(false)
  })
})
