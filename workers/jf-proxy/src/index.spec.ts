import { fetchMock } from 'cloudflare:test'

import app from '.'

describe('test the worker', () => {
  beforeAll(() => {
    fetchMock.activate()
    fetchMock.disableNetConnect()
  })

  afterEach(() => fetchMock.assertNoPendingInterceptors())

  it('should return 200 response', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .reply(200, 'body content')

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('body content')
  })

  it('should handle 404 response', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .reply(404, 'body content')

    fetchMock
      .get('http://localhost')
      .intercept({ path: '/not-found.html' })
      .reply(404, 'not found content')

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(404)
    expect(await res.text()).toBe('not found content')
  })

  it('should handle 500 response', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .reply(500, 'server error')

    fetchMock
      .get('http://localhost')
      .intercept({ path: '/not-found.html' })
      .reply(404, 'not found content')

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(404)
    expect(await res.text()).toBe('not found content')
  })

  it('should handle 301 response', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .reply(301, 'redirect content', {
        headers: { location: 'http://test.example.com/redirected-path%AA' }
      })

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(301)
    expect(await res.text()).toBe('redirect content')
    expect(res.headers.get('location')).toBe(
      'http://localhost/redirected-path%aa'
    )
  })

  it('should handle 302 response', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .reply(302, 'redirect content', {
        headers: { location: 'http://test.example.com/redirected-path%AA' }
      })

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(302)
    expect(await res.text()).toBe('redirect content')
    expect(res.headers.get('location')).toBe(
      'http://localhost/redirected-path%aa'
    )
  })

  it('should handle network error in main fetch', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .replyWithError(new Error('Network error'))

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(503)
    expect(await res.text()).toBe('Service Unavailable')
  })

  it('should handle network error in not-found fetch', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .reply(404, 'not found')

    fetchMock
      .get('http://localhost')
      .intercept({ path: '/not-found.html' })
      .replyWithError(new Error('Network error'))

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(404)
    expect(await res.text()).toBe('Not Found')
  })

  it('should handle invalid URLs in redirect location header', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .reply(301, 'redirect content', {
        headers: { location: 'invalid-url' }
      })

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(301)
    expect(await res.text()).toBe('redirect content')
    expect(res.headers.get('location')).toBe('invalid-url')
  })

  it('should handle missing location header in redirect', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .reply(301, 'redirect content', {
        headers: {} // No location header
      })

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(301)
    expect(await res.text()).toBe('redirect content')
    expect(res.headers.has('location')).toBe(false)
  })

  it('should handle missing PROXY_DEST binding', async () => {
    fetchMock
      .get('http://localhost')
      .intercept({ path: '/test-path%aa' })
      .reply(200, 'original host content')

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      {} // No PROXY_DEST binding
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('original host content')
  })
})
