import { NextRequest } from 'next/server'

import { middleware } from './middleware'

describe('middleware', () => {
  const url = 'http://localhost:4200/'
  const requestInit = {
    nextConfig: { i18n: { defaultLocale: 'en', locales: ['ar', 'en', 'ja'] } }
  }

  describe('no cookie set', () => {
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
      expect(result?.status).toBe(307) // checks for temporary redirect
      expect(result?.headers.get('location')).toBe('http://localhost:4200/zh/')
      expect(result?.headers.get('set-cookie')).toBe(
        'NEXT_LOCALE=00001-zh; Path=/'
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
      expect(result?.status).toBe(307) // checks for temporary redirect
      expect(result?.headers.get('location')).toBe('http://localhost:4200/ja/')
      expect(result?.headers.get('set-cookie')).toBe(
        'NEXT_LOCALE=00001-ja; Path=/'
      )
    })

    it('should check if browsers language has script and reqion and is supported', async () => {
      const request = new Request(url, {
        headers: new Headers({
          'accept-language': 'af,zh-Hant-CN,ja-JP;q=0.9',
          cookie: ''
        })
      })
      const req = new NextRequest(request, requestInit)
      const result = await middleware(req)

      expect(req.cookies.get('NEXT_LOCALE')?.value).toBeUndefined()
      expect(result?.status).toBe(307) // checks for temporary redirect
      expect(result?.headers.get('location')).toBe(
        'http://localhost:4200/zh-CN/'
      )
      expect(result?.headers.get('set-cookie')).toBe(
        'NEXT_LOCALE=00001-zh-CN; Path=/'
      )
    })
  })

  describe('cookie is set', () => {
    it('should check if cookie is not same as current locale, and redirect to that locale', async () => {
      const request = new Request(url, {
        headers: new Headers({
          'accept-language': 'af,zh;q=0.9',
          cookie: 'NEXT_LOCALE=00001-ja'
        })
      })
      const req = new NextRequest(request, requestInit)
      const result = await middleware(req)

      expect(req.nextUrl.locale).toBe('en')
      expect(req.cookies.get('NEXT_LOCALE')?.value).toBe('00001-ja')
      expect(result?.status).toBe(307) // checks for temporary redirect
      expect(result?.headers.get('location')).toBe('http://localhost:4200/ja/')
    })

    it('should check if cookie has region and is supported', async () => {
      const request = new Request(url, {
        headers: new Headers({
          'accept-language': 'af,zh;q=0.9',
          cookie: 'NEXT_LOCALE=00001-es-CO'
        })
      })
      const req = new NextRequest(request, requestInit)
      const result = await middleware(req)

      expect(req.nextUrl.locale).toBe('en')
      expect(req.cookies.get('NEXT_LOCALE')?.value).toBe('00001-es-CO')
      expect(result?.status).toBe(307) // checks for temporary redirect
      expect(result?.headers.get('location')).toBe('http://localhost:4200/es/')
      expect(result?.headers.get('set-cookie')).toBe(
        'NEXT_LOCALE=00001-es; Path=/'
      )
    })

    it('should check if cookie has script and region and is supported', async () => {
      const request = new Request(url, {
        headers: new Headers({
          'accept-language': 'af,zh;q=0.9',
          cookie: 'NEXT_LOCALE=00001-zh-Hant-CN'
        })
      })
      const req = new NextRequest(request, requestInit)
      const result = await middleware(req)

      expect(req.nextUrl.locale).toBe('en')
      expect(req.cookies.get('NEXT_LOCALE')?.value).toBe('00001-zh-Hant-CN')
      expect(result?.status).toBe(307) // checks for temporary redirect
      expect(result?.headers.get('location')).toBe(
        'http://localhost:4200/zh-CN/'
      )
      expect(result?.headers.get('set-cookie')).toBe(
        'NEXT_LOCALE=00001-zh-CN; Path=/'
      )
    })
  })
})
