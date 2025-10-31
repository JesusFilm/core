import { NextRequest } from 'next/server'

import { config, middleware } from './middleware'

const globalWithOptionalAtob = globalThis as typeof globalThis & {
  atob?: (value: string) => string
}

describe('middleware', () => {
  const originalEnv = process.env
  const originalAtob = globalWithOptionalAtob.atob

  beforeAll(() => {
    if (!globalWithOptionalAtob.atob) {
      globalWithOptionalAtob.atob = (value: string) =>
        Buffer.from(value, 'base64').toString('utf-8')
    }
  })

  afterAll(() => {
    if (originalAtob) {
      globalWithOptionalAtob.atob = originalAtob
    } else {
      Reflect.deleteProperty(globalWithOptionalAtob, 'atob')
    }
  })

  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.BASIC_AUTH_USER = 'admin'
    process.env.BASIC_AUTH_PASS = 'supersecret'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const createRequest = (headers?: Record<string, string>) =>
    new NextRequest('http://localhost/api/example', { headers })

  it('allows requests with valid credentials', () => {
    const credentials = Buffer.from('admin:supersecret').toString('base64')
    const request = createRequest({ authorization: `Basic ${credentials}` })

    const response = middleware(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('WWW-Authenticate')).toBeNull()
  })

  it('rejects requests with missing credentials', () => {
    const request = createRequest()

    const response = middleware(request)

    expect(response.status).toBe(401)
    expect(response.headers.get('WWW-Authenticate')).toBe(
      'Basic realm="Restricted API"'
    )
  })

  it('rejects requests with invalid credentials', () => {
    const credentials = Buffer.from('admin:wrong').toString('base64')
    const request = createRequest({ authorization: `Basic ${credentials}` })

    const response = middleware(request)

    expect(response.status).toBe(401)
  })

  it('skips auth when credentials are not configured', () => {
    delete process.env.BASIC_AUTH_USER
    delete process.env.BASIC_AUTH_PASS

    const request = createRequest()

    const response = middleware(request)

    expect(response.status).toBe(200)
  })
})

describe('middleware config', () => {
  it('protects only API routes', () => {
    expect(config.matcher).toEqual(['/api/:path*'])
  })
})
