import { getCookie, setCookie } from './cookieHandler'

// Mock document object with necessary properties and methods
const mockDocument = {
  cookie: '',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}

// Mock console methods to capture warnings/errors
const consoleSpy = {
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {
    // Intentionally empty - suppressing console output during tests
  }),
  error: jest.spyOn(console, 'error').mockImplementation(() => {
    // Intentionally empty - suppressing console output during tests
  })
}

// Helper to mock document.cookie
const mockDocumentCookie = (cookieString: string) => {
  mockDocument.cookie = cookieString
}

// Helper to capture cookie writes
const mockCookieSetter = () => {
  const setCookieCalls: string[] = []
  Object.defineProperty(mockDocument, 'cookie', {
    set: (value: string) => {
      setCookieCalls.push(value)
    },
    get: () => '',
    configurable: true
  })
  return setCookieCalls
}

describe('cookieHandler', () => {
  beforeAll(() => {
    // Mock document globally for the entire test suite - Jest v30 compatible
    delete (global as any).document
    global.document = mockDocument as any
  })

  beforeEach(() => {
    // Clear all mocks
    consoleSpy.warn.mockClear()
    consoleSpy.error.mockClear()

    // Reset document.cookie and its property descriptor
    mockDocument.cookie = ''
    Object.defineProperty(mockDocument, 'cookie', {
      value: '',
      writable: true,
      configurable: true
    })
  })

  afterAll(() => {
    // Restore console methods
    consoleSpy.warn.mockRestore()
    consoleSpy.error.mockRestore()
  })

  describe('getCookie', () => {
    it('should return undefined when document is not available (SSR)', () => {
      // Mock server-side environment
      const originalDocument = global.document
      // @ts-expect-error - Intentionally setting undefined for SSR test
      delete global.document

      const result = getCookie('TEST_COOKIE')

      expect(result).toBeUndefined()

      // Restore document
      global.document = originalDocument
    })

    it('should return undefined when cookie does not exist', () => {
      mockDocumentCookie('OTHER_COOKIE=value; ANOTHER_COOKIE=value2')

      const result = getCookie('MISSING_COOKIE')

      expect(result).toBeUndefined()
    })

    it('should return decoded value for simple cookie', () => {
      mockDocumentCookie('TEST_COOKIE=simple_value; OTHER_COOKIE=other')

      const result = getCookie('TEST_COOKIE')

      expect(result).toBe('simple_value')
    })

    it('should handle cookies with fingerprint format', () => {
      mockDocumentCookie('AUDIO_LANGUAGE=00005---529; NEXT_LOCALE=00005---en')

      const audioResult = getCookie('AUDIO_LANGUAGE')
      const localeResult = getCookie('NEXT_LOCALE')

      expect(audioResult).toBe('529')
      expect(localeResult).toBe('en')
    })

    it('should handle URL-encoded values', () => {
      const encodedValue = encodeURIComponent('special chars: éñ中文')
      mockDocumentCookie(`ENCODED_COOKIE=00005---${encodedValue}`)

      const result = getCookie('ENCODED_COOKIE')

      expect(result).toBe('special chars: éñ中文')
    })

    it('should handle URL-encoded values without fingerprint', () => {
      const encodedValue = encodeURIComponent('test value with spaces')
      mockDocumentCookie(`SIMPLE_ENCODED=${encodedValue}`)

      const result = getCookie('SIMPLE_ENCODED')

      expect(result).toBe('test value with spaces')
    })

    it('should fallback to raw value when decodeURIComponent fails', () => {
      // Create a malformed URI component
      mockDocumentCookie('MALFORMED_COOKIE=00005---test%zz%invalid')

      const result = getCookie('MALFORMED_COOKIE')

      expect(result).toBe('test%zz%invalid')
    })

    it('should use exact name matching to prevent false positives', () => {
      mockDocumentCookie(
        'TEST_COOKIE_LONG=long_value; TEST_COOKIE=correct_value'
      )

      const result = getCookie('TEST_COOKIE')

      expect(result).toBe('correct_value')
    })

    it('should handle empty cookie value', () => {
      mockDocumentCookie('EMPTY_COOKIE=')

      const result = getCookie('EMPTY_COOKIE')

      expect(result).toBe('')
    })

    it('should handle cookie with only fingerprint', () => {
      mockDocumentCookie('FINGERPRINT_ONLY=00005---')

      const result = getCookie('FINGERPRINT_ONLY')

      expect(result).toBe('')
    })

    it('should handle complex cookie string with multiple similar names', () => {
      mockDocumentCookie(
        'USER=00005---john; USER_ID=123; USER_NAME=00005---jane'
      )

      expect(getCookie('USER')).toBe('john')
      expect(getCookie('USER_ID')).toBe('123')
      expect(getCookie('USER_NAME')).toBe('jane')
    })
  })

  describe('setCookie', () => {
    it('should do nothing when document is not available (SSR)', () => {
      // Mock server-side environment
      const originalDocument = global.document
      // @ts-expect-error - Intentionally setting undefined for SSR test
      delete global.document

      const setCookieCalls = mockCookieSetter()
      setCookie('TEST_COOKIE', 'value')

      expect(setCookieCalls).toHaveLength(0)

      // Restore document
      global.document = originalDocument
    })

    it('should validate cookie name - empty string', () => {
      const setCookieCalls = mockCookieSetter()

      setCookie('', 'value')

      expect(setCookieCalls).toHaveLength(0)
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'setCookie: Invalid cookie name provided'
      )
    })

    it('should validate cookie name - non-string type', () => {
      const setCookieCalls = mockCookieSetter()

      // @ts-expect-error - Intentionally passing invalid type for testing
      setCookie(123, 'value')

      expect(setCookieCalls).toHaveLength(0)
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'setCookie: Invalid cookie name provided'
      )
    })

    it('should validate cookie value - non-string type', () => {
      const setCookieCalls = mockCookieSetter()

      // @ts-expect-error - Intentionally passing invalid type for testing
      setCookie('TEST_COOKIE', 123)

      expect(setCookieCalls).toHaveLength(0)
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'setCookie: Invalid cookie value provided'
      )
    })

    it('should validate cookie name - invalid characters', () => {
      const setCookieCalls = mockCookieSetter()

      setCookie('INVALID@COOKIE', 'value')

      expect(setCookieCalls).toHaveLength(0)
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'setCookie: Cookie name contains invalid characters'
      )
    })

    it('should validate cookie name - length limit', () => {
      const setCookieCalls = mockCookieSetter()
      const longName = 'a'.repeat(257) // Exceeds 256 character limit

      setCookie(longName, 'value')

      expect(setCookieCalls).toHaveLength(0)
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'setCookie: Cookie name exceeds maximum length (256 characters)'
      )
    })

    it('should validate cookie value - length limit', () => {
      const setCookieCalls = mockCookieSetter()
      const longValue = 'a'.repeat(4097) // Exceeds 4096 character limit

      setCookie('TEST_COOKIE', longValue)

      expect(setCookieCalls).toHaveLength(0)
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'setCookie: Cookie value exceeds maximum length (4096 characters)'
      )
    })

    it('should set cookie with proper format and attributes', () => {
      const setCookieCalls = mockCookieSetter()

      setCookie('AUDIO_LANGUAGE', '529')

      expect(setCookieCalls).toHaveLength(1)
      const cookieString = setCookieCalls[0]

      expect(cookieString).toContain('AUDIO_LANGUAGE=00005---529')
      expect(cookieString).toContain('path=/')
      expect(cookieString).toContain('SameSite=Lax')
      expect(cookieString).toContain('expires=')
    })

    it('should URL-encode special characters in values', () => {
      const setCookieCalls = mockCookieSetter()
      const specialValue = 'special chars: éñ中文'

      setCookie('SPECIAL_COOKIE', specialValue)

      expect(setCookieCalls).toHaveLength(1)
      const cookieString = setCookieCalls[0]
      const encodedValue = encodeURIComponent(specialValue)

      expect(cookieString).toContain(`SPECIAL_COOKIE=00005---${encodedValue}`)
    })

    it('should accept valid cookie name formats', () => {
      const setCookieCalls = mockCookieSetter()

      // Test various valid name formats
      setCookie('VALID_NAME', 'value1')
      setCookie('valid_name', 'value2')
      setCookie('ValidName123', 'value3')
      setCookie('_underscore_start', 'value4')

      expect(setCookieCalls).toHaveLength(4)
      expect(consoleSpy.warn).not.toHaveBeenCalled()
    })

    it('should set expiration date 30 days in the future', () => {
      const setCookieCalls = mockCookieSetter()
      const beforeTime = Date.now()

      setCookie('TEST_COOKIE', 'value')

      expect(setCookieCalls).toHaveLength(1)
      const cookieString = setCookieCalls[0]

      // Extract expires date from cookie string
      const expiresMatch = cookieString.match(/expires=([^;]+)/)
      expect(expiresMatch).toBeTruthy()

      const expiresDate = new Date(expiresMatch![1])
      const expectedDate = new Date(beforeTime + 30 * 24 * 60 * 60 * 1000)

      // Allow 1 second tolerance for test execution time
      expect(
        Math.abs(expiresDate.getTime() - expectedDate.getTime())
      ).toBeLessThan(1000)
    })

    it('should validate final cookie string length', () => {
      const setCookieCalls = mockCookieSetter()
      // Create a value that when combined with name and attributes exceeds 4096 chars
      // Calculate: name(12) + fingerprint(5) + separator(3) + attributes(~96) = ~116 chars overhead
      // So use 4096 - 116 + 50 = 4030 to ensure we exceed the limit
      const largeValue = 'a'.repeat(4030)

      setCookie('LARGE_COOKIE', largeValue)

      expect(setCookieCalls).toHaveLength(0)
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'setCookie: Final cookie string exceeds browser limit (4096 characters)'
      )
    })

    it('should handle encoding errors gracefully', () => {
      const setCookieCalls = mockCookieSetter()

      // Mock encodeURIComponent to throw an error
      const originalEncodeURIComponent = global.encodeURIComponent
      global.encodeURIComponent = jest.fn().mockImplementation(() => {
        throw new Error('Encoding error')
      })

      setCookie('TEST_COOKIE', 'value')

      expect(setCookieCalls).toHaveLength(0)
      expect(consoleSpy.error).toHaveBeenCalledWith(
        'setCookie: Failed to set cookie',
        expect.any(Error)
      )

      // Restore original function
      global.encodeURIComponent = originalEncodeURIComponent
    })

    it('should handle document.cookie setter errors gracefully', () => {
      // Mock document.cookie setter to throw an error - Jest v30 compatible
      const originalCookieDescriptor = Object.getOwnPropertyDescriptor(
        document,
        'cookie'
      )
      Object.defineProperty(document, 'cookie', {
        set: () => {
          throw new Error('Cookie setter error')
        },
        get: () => '',
        configurable: true
      })

      setCookie('TEST_COOKIE', 'value')

      expect(consoleSpy.error).toHaveBeenCalledWith(
        'setCookie: Failed to set cookie',
        expect.any(Error)
      )

      // Reset document.cookie property for subsequent tests
      if (originalCookieDescriptor) {
        Object.defineProperty(document, 'cookie', originalCookieDescriptor)
      } else {
        delete (document as any).cookie
      }
    })

    it('should handle empty string value', () => {
      const setCookieCalls = mockCookieSetter()

      setCookie('EMPTY_VALUE', '')

      expect(setCookieCalls).toHaveLength(1)
      expect(setCookieCalls[0]).toContain('EMPTY_VALUE=00005---')
    })

    it('should handle values at maximum allowed length', () => {
      const setCookieCalls = mockCookieSetter()
      const maxValue = 'a'.repeat(4096) // Exactly at limit

      setCookie('MAX_VALUE', maxValue)

      // Should fail due to final cookie string validation (value gets encoded + attributes added)
      expect(setCookieCalls).toHaveLength(0)
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'setCookie: Final cookie string exceeds browser limit (4096 characters)'
      )
    })

    it('should handle cookie name at maximum allowed length', () => {
      const setCookieCalls = mockCookieSetter()
      const maxName = 'a'.repeat(256) // Exactly at limit

      setCookie(maxName, 'value')

      expect(setCookieCalls).toHaveLength(1)
      expect(consoleSpy.warn).not.toHaveBeenCalled()
    })
  })
})
