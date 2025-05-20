import { NextRequest } from 'next/server'

import { middleware } from './middleware'

const url = 'http://localhost:4300/watch'

const requestInit = {
  nextConfig: {
    i18n: {
      defaultLocale: 'en',
      locales: [
        'en',
        'es',
        'fr',
        'id',
        'th',
        'ja',
        'ko',
        'ru',
        'tr',
        'zh',
        'zh-Hans-CN'
      ]
    }
  }
}

// Helper to get location and set-cookie from response
function getHeader(result: any, key: string) {
  if (!result) return undefined
  if (typeof result.headers?.get === 'function') {
    return result.headers.get(key)
  }
  return undefined
}

describe('middleware', () => {
  it('should skip non-/watch paths', async () => {
    const request = new Request('http://localhost:4300/other')
    const req = new NextRequest(request)
    const result = await middleware(req)
    expect(result).toBeUndefined()
  })

  it('should skip static files', async () => {
    const request = new Request('http://localhost:4300/watch/file.png')
    const req = new NextRequest(request)
    const result = await middleware(req)
    expect(result).toBeUndefined()
  })

  it('should use geolocation header if present', async () => {
    const request = new Request(url, {
      headers: new Headers({ 'cf-ipcountry': 'ES' })
    })
    const req = new NextRequest(request)
    const result = await middleware(req)
    expect(getHeader(result, 'location')).toBe('http://localhost:4300/es/watch')
    expect(getHeader(result, 'set-cookie')).toContain('NEXT_LOCALE=00005---es')
  })

  it('should fallback to Accept-Language if no geo header', async () => {
    const request = new Request(url, {
      headers: new Headers({ 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' })
    })
    const req = new NextRequest(request)
    const result = await middleware(req)
    expect(getHeader(result, 'location')).toBe('http://localhost:4300/fr/watch')
    expect(getHeader(result, 'set-cookie')).toContain('NEXT_LOCALE=00005---fr')
  })

  it('should use default locale if no headers', async () => {
    const request = new Request(url)
    const req = new NextRequest(request)
    const result = await middleware(req)
    expect(result?.status).toBe(200)
    expect(getHeader(result, 'set-cookie')).toContain('NEXT_LOCALE=00005---en')
    expect(getHeader(result, 'location')).toBeNull()
  })

  it('should not redirect if cookie matches locale', async () => {
    const request = new Request(url, {
      headers: new Headers({ cookie: 'NEXT_LOCALE=00005---es' })
    })
    const req = new NextRequest(request, requestInit)
    req.nextUrl.locale = 'es'
    const result = await middleware(req)
    expect(result).toBeUndefined()
  })

  it('should redirect if cookie does not match locale', async () => {
    const request = new Request(url, {
      headers: new Headers({ cookie: 'NEXT_LOCALE=00005---fr' })
    })
    const req = new NextRequest(request, requestInit)
    req.nextUrl.locale = 'en'
    const result = await middleware(req)
    expect(result?.status).toBe(307)
    expect(getHeader(result, 'location')).toBe('http://localhost:4300/fr/watch')
    expect(getHeader(result, 'set-cookie')).toContain('NEXT_LOCALE=00005---fr')
  })

  it('should map Singapore to zh-Hans-CN', async () => {
    const request = new Request(url, {
      headers: new Headers({ 'cf-ipcountry': 'SG' })
    })
    const req = new NextRequest(request)
    const result = await middleware(req)
    expect(getHeader(result, 'location')).toBe(
      'http://localhost:4300/zh-Hans-CN/watch'
    )
    expect(getHeader(result, 'set-cookie')).toContain(
      'NEXT_LOCALE=00005---zh-Hans-CN'
    )
  })
})
