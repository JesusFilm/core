import { NextRequest, NextResponse } from 'next/server'

import { COOKIE_FINGERPRINT, middleware } from './middleware'

jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server')
  const mockRedirect = jest.fn((url, statusCode) => ({
    type: 'redirect',
    url,
    statusCode,
    cookies: {
      set: jest.fn()
    },
    headers: {
      set: jest.fn()
    }
  }))

  const mockNext = jest.fn(() => ({
    type: 'next',
    headers: {
      set: jest.fn()
    }
  }))

  return {
    ...originalModule,
    NextResponse: {
      next: mockNext,
      redirect: mockRedirect
    }
  }
})

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  function createMockRequest(
    path: string,
    options: { locale?: string; headers?: Record<string, string> } = {}
  ): NextRequest {
    const url = new URL(`https://example.com${path}`)

    // Default cookie implementation
    const mockCookies = {
      get: jest.fn((name) => {
        if (name === 'NEXT_LOCALE' && options.locale) {
          return { value: `${COOKIE_FINGERPRINT}---${options.locale}` }
        }
        return undefined
      }),
      getAll: jest.fn(() => [])
    }

    // Default headers implementation
    const mockHeaders = {
      get: jest.fn((name) => {
        if (options.headers && options.headers[name]) {
          return options.headers[name]
        }

        if (name === 'accept-language') {
          return 'en-US,en;q=0.9'
        }
        return null
      })
    }

    return {
      nextUrl: url,
      url: `https://example.com${path}`,
      cookies: mockCookies,
      headers: mockHeaders
    } as unknown as NextRequest
  }

  it('should not redirect for non-easter routes', () => {
    const req = createMockRequest('/some-other-route')
    middleware(req)
    expect(NextResponse.redirect).not.toHaveBeenCalled()
    expect(NextResponse.next).toHaveBeenCalled()
  })

  it('should redirect to /en/watch/easter for the /watch/easter route', () => {
    const req = createMockRequest('/watch/easter')
    middleware(req)
    expect(NextResponse.redirect).toHaveBeenCalled()
    const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0]
    expect(redirectCall[0].pathname).toBe('/en/watch/easter')
    expect(redirectCall[1]).toBe(307) // Verify temporary redirect status
  })

  it('should redirect to /en/watch/easter/some-sub-route for nested routes', () => {
    const req = createMockRequest('/watch/easter/some-sub-route')
    middleware(req)
    expect(NextResponse.redirect).toHaveBeenCalled()
    const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0]
    expect(redirectCall[0].pathname).toBe('/en/watch/easter/some-sub-route')
    expect(redirectCall[1]).toBe(307) // Verify temporary redirect status
  })

  it('should not redirect for already localized routes', () => {
    const req = createMockRequest('/fr/watch/easter')
    middleware(req)
    expect(NextResponse.redirect).not.toHaveBeenCalled()
    expect(NextResponse.next).toHaveBeenCalled()
  })

  it('should pass through localized nested routes', () => {
    const req = createMockRequest('/es/watch/easter/some-sub-route')
    middleware(req)
    expect(NextResponse.redirect).not.toHaveBeenCalled()
    expect(NextResponse.next).toHaveBeenCalled()
  })

  it('should not process static files', () => {
    const req = createMockRequest('/watch/easter/image.jpg')
    middleware(req)
    expect(NextResponse.redirect).not.toHaveBeenCalled()
    expect(NextResponse.next).not.toHaveBeenCalled()
  })

  it('should use locale from cookie if available', () => {
    const req = createMockRequest('/watch/easter', { locale: 'fr' })
    middleware(req)
    expect(NextResponse.redirect).toHaveBeenCalled()
    const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0]
    expect(redirectCall[0].pathname).toBe('/fr/watch/easter')
  })

  it('should set the NEXT_LOCALE cookie on redirect', () => {
    const req = createMockRequest('/watch/easter')
    const result = middleware(req)
    expect(result?.cookies.set).toHaveBeenCalledWith(
      'NEXT_LOCALE',
      `${COOKIE_FINGERPRINT}---en`
    )
  })

  it('should not redirect if target URL matches current URL', () => {
    // Mock a request where the URL and target URL would be the same
    const mockUrl = 'https://example.com/watch/easter'
    const req = createMockRequest('/watch/easter')

    // Force the comparison to be true by making both URLs the same
    const redirectUrl = '/en/watch/easter'
    const targetUrl = new URL(redirectUrl, mockUrl)
    const currentUrl = new URL(mockUrl)

    // Replace the URL objects to force them to be equal
    Object.defineProperty(targetUrl, 'toString', {
      value: () => mockUrl
    })
    Object.defineProperty(currentUrl, 'toString', {
      value: () => mockUrl
    })

    // Mock the URL constructor to return our mock URLs
    const originalURL = global.URL
    global.URL = jest.fn((url, base) => {
      if (url.startsWith('/en/watch/easter')) {
        return targetUrl
      }
      return currentUrl
    }) as any

    middleware(req)

    // Restore the original URL constructor
    global.URL = originalURL

    expect(NextResponse.redirect).not.toHaveBeenCalled()
    expect(NextResponse.next).toHaveBeenCalled()
  })

  it('should add debug headers to redirect response', () => {
    const req = createMockRequest('/watch/easter')
    const result = middleware(req)

    expect(result?.headers.set).toHaveBeenCalledWith(
      'x-middleware-action',
      'redirect'
    )
    expect(result?.headers.set).toHaveBeenCalledWith(
      'x-original-path',
      '/watch/easter'
    )
    expect(result?.headers.set).toHaveBeenCalledWith(
      'x-redirected-to',
      '/en/watch/easter'
    )
  })
})
