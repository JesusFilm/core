import { NextRequest } from 'next/server'
import { authMiddleware } from 'next-firebase-auth-edge'

import middleware, { COOKIE_FINGERPRINT } from './middleware'

jest.mock('next-firebase-auth-edge', () => ({
  authMiddleware: jest.fn()
}))

const mockAuthMiddleware = authMiddleware as jest.MockedFunction<
  typeof authMiddleware
>

describe('middleware', () => {
  const url = 'http://localhost:4200/'
  const requestInit = {
    nextConfig: { i18n: { defaultLocale: 'en', locales: ['ar', 'en', 'ja'] } }
  }

  describe('handleInvalidToken (no auth headers)', () => {
    beforeEach(() => {
      mockAuthMiddleware.mockImplementation(async (_req, options) => {
        return options.handleInvalidToken!('MISSING_CREDENTIALS' as any)
      })
    })

    describe('no cookie set', () => {
      it('should set browsers language to default locale when no accept headers', async () => {
        const request = new Request(url, {
          headers: new Headers({})
        })
        const req = new NextRequest(request, requestInit)
        const result = await middleware(req)

        expect(req.cookies.get('NEXT_LOCALE')?.value).toBeUndefined()
        expect(result?.status).toBe(200)
        expect(result?.headers.get('set-cookie')).toBe(
          `NEXT_LOCALE=${COOKIE_FINGERPRINT}---en; Path=/`
        )
      })

      it('should set browsers language as cookie, and redirect to that locale', async () => {
        const request = new Request(url, {
          headers: new Headers({
            'accept-language': 'af,zh;q=0.9',
            cookie: ''
          })
        })
        const req = new NextRequest(request, requestInit)
        const result = await middleware(req)

        expect(req.cookies.get('NEXT_LOCALE')?.value).toBeUndefined()
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toBe(
          'http://localhost:4200/zh/'
        )
        expect(result?.headers.get('set-cookie')).toBe(
          `NEXT_LOCALE=${COOKIE_FINGERPRINT}---zh; Path=/`
        )
      })

      it('should check if browsers language has region and is supported', async () => {
        const request = new Request(url, {
          headers: new Headers({
            'accept-language': 'af,ja-JP;q=0.9',
            cookie: ''
          })
        })
        const req = new NextRequest(request, requestInit)
        const result = await middleware(req)

        expect(req.cookies.get('NEXT_LOCALE')?.value).toBeUndefined()
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toBe(
          'http://localhost:4200/ja/'
        )
        expect(result?.headers.get('set-cookie')).toBe(
          `NEXT_LOCALE=${COOKIE_FINGERPRINT}---ja; Path=/`
        )
      })

      it('should check if browsers language has script and region and is supported', async () => {
        const request = new Request(url, {
          headers: new Headers({
            'accept-language': 'af,zh-Hans-CN,ja-JP;q=0.9',
            cookie: ''
          })
        })
        const req = new NextRequest(request, requestInit)
        const result = await middleware(req)

        expect(req.cookies.get('NEXT_LOCALE')?.value).toBeUndefined()
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toBe(
          'http://localhost:4200/zh-Hans-CN/'
        )
        expect(result?.headers.get('set-cookie')).toBe(
          `NEXT_LOCALE=${COOKIE_FINGERPRINT}---zh-Hans-CN; Path=/`
        )
      })
    })

    describe('cookie is set', () => {
      it('should check if cookie is not same as current locale, and redirect to that locale', async () => {
        const request = new Request(url, {
          headers: new Headers({
            'accept-language': 'af,zh;q=0.9',
            cookie: `NEXT_LOCALE=${COOKIE_FINGERPRINT}---ja`
          })
        })
        const req = new NextRequest(request, requestInit)
        const result = await middleware(req)

        expect(req.nextUrl.locale).toBe('en')
        expect(req.cookies.get('NEXT_LOCALE')?.value).toBe(
          `${COOKIE_FINGERPRINT}---ja`
        )
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toBe(
          'http://localhost:4200/ja/'
        )
      })

      it('should check if cookie has region and is supported', async () => {
        const request = new Request(url, {
          headers: new Headers({
            'accept-language': 'af,zh;q=0.9',
            cookie: `NEXT_LOCALE=${COOKIE_FINGERPRINT}---es-CO`
          })
        })
        const req = new NextRequest(request, requestInit)
        const result = await middleware(req)

        expect(req.nextUrl.locale).toBe('en')
        expect(req.cookies.get('NEXT_LOCALE')?.value).toBe(
          `${COOKIE_FINGERPRINT}---es-CO`
        )
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toBe(
          'http://localhost:4200/es/'
        )
        expect(result?.headers.get('set-cookie')).toBe(
          `NEXT_LOCALE=${COOKIE_FINGERPRINT}---es; Path=/`
        )
      })

      it('should check if cookie has script and region and is supported', async () => {
        const request = new Request(url, {
          headers: new Headers({
            'accept-language': 'af,zh;q=0.9',
            cookie: `NEXT_LOCALE=${COOKIE_FINGERPRINT}---zh-Hans-CN`
          })
        })
        const req = new NextRequest(request, requestInit)
        const result = await middleware(req)

        expect(req.nextUrl.locale).toBe('en')
        expect(req.cookies.get('NEXT_LOCALE')?.value).toBe(
          `${COOKIE_FINGERPRINT}---zh-Hans-CN`
        )
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toBe(
          'http://localhost:4200/zh-Hans-CN/'
        )
        expect(result?.headers.get('set-cookie')).toBe(
          `NEXT_LOCALE=${COOKIE_FINGERPRINT}---zh-Hans-CN; Path=/`
        )
      })
    })
  })

  describe('handleValidToken (with auth headers)', () => {
    const authHeaders = new Headers({
      'x-firebase-auth-token': 'cached-token-value',
      'x-middleware-request-auth': 'verified'
    })

    beforeEach(() => {
      mockAuthMiddleware.mockImplementation(async (_req, options) => {
        return options.handleValidToken!(
          { token: 'tok', decodedToken: {} } as any,
          authHeaders
        )
      })
    })

    it('should forward auth headers with NextResponse.next when no redirect needed', async () => {
      const request = new Request(url, {
        headers: new Headers({})
      })
      const req = new NextRequest(request, requestInit)
      const result = await middleware(req)

      expect(result?.status).toBe(200)
    })

    it('should forward auth headers on locale redirect response', async () => {
      const request = new Request(url, {
        headers: new Headers({
          'accept-language': 'af,ja-JP;q=0.9',
          cookie: ''
        })
      })
      const req = new NextRequest(request, requestInit)
      const result = await middleware(req)

      expect(result?.status).toBe(307)
      expect(result?.headers.get('location')).toBe('http://localhost:4200/ja/')
      expect(result?.headers.get('x-firebase-auth-token')).toBe(
        'cached-token-value'
      )
      expect(result?.headers.get('x-middleware-request-auth')).toBe('verified')
    })

    it('should forward auth headers on cookie-based locale redirect', async () => {
      const request = new Request(url, {
        headers: new Headers({
          cookie: `NEXT_LOCALE=${COOKIE_FINGERPRINT}---ko`
        })
      })
      const req = new NextRequest(request, requestInit)
      const result = await middleware(req)

      expect(result?.status).toBe(307)
      expect(result?.headers.get('location')).toBe('http://localhost:4200/ko/')
      expect(result?.headers.get('x-firebase-auth-token')).toBe(
        'cached-token-value'
      )
    })
  })
})
