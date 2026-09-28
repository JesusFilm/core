import { type InterceptedRequest, fetchMock } from '../test/fetchMock'
import { domainRecord, routingRecord } from '../test/fixtures'
import { seedRecords, workerRequest } from '../test/workerRequest'

import { isAdminRequest } from './adminProxy'
import type { Env } from './env'
import { clearDomainCache } from './store'

const adminDest = 'short-links-admin.vercel.example'
const adminOrigin = `https://${adminDest}`

const adminEnv: Partial<Env> = {
  ADMIN_HOSTNAME: 'jesus.film',
  ADMIN_PATH: '/s/dashboard',
  ADMIN_PROXY_DEST: adminDest
}

describe('isAdminRequest', () => {
  it.each([
    ['jesus.film', '/s/dashboard', true],
    ['jesus.film', '/s/dashboard/', true],
    ['jesus.film', '/s/dashboard/links', true],
    ['jesus.film', '/s/dashboard/api/qr', true],
    ['jesus.film', '/s/dashboardx', false],
    ['jesus.film', '/s/dash', false],
    ['jesus.film', '/s/abc', false],
    ['jesus.film', '/dashboard', false],
    ['jesus.film', '/', false],
    ['www.jesus.film', '/s/dashboard', false],
    ['nxstp.is', '/s/dashboard', false]
  ])('%s%s -> %s', (host, pathname, expected) => {
    expect(isAdminRequest(host, pathname, adminEnv)).toBe(expected)
  })

  it('compares the host case-insensitively', () => {
    expect(
      isAdminRequest('jesus.film', '/s/dashboard', {
        ...adminEnv,
        ADMIN_HOSTNAME: 'Jesus.Film'
      })
    ).toBe(true)
    expect(isAdminRequest('JESUS.FILM', '/s/dashboard', adminEnv)).toBe(true)
  })

  it('tolerates a trailing slash on ADMIN_PATH', () => {
    const env = { ...adminEnv, ADMIN_PATH: '/s/dashboard/' }

    expect(isAdminRequest('jesus.film', '/s/dashboard', env)).toBe(true)
    expect(isAdminRequest('jesus.film', '/s/dashboard/links', env)).toBe(true)
    expect(isAdminRequest('jesus.film', '/s/dashboardx', env)).toBe(false)
  })

  it.each([
    ['ADMIN_HOSTNAME', ''],
    ['ADMIN_PATH', ''],
    ['ADMIN_PROXY_DEST', ''],
    ['ADMIN_HOSTNAME', undefined],
    ['ADMIN_PATH', undefined],
    ['ADMIN_PROXY_DEST', undefined]
  ])('is off when %s is %j', (name, value) => {
    expect(
      isAdminRequest('jesus.film', '/s/dashboard', {
        ...adminEnv,
        [name]: value
      })
    ).toBe(false)
  })
})

describe('admin proxy', () => {
  beforeAll(async () => {
    fetchMock.activate()
    await seedRecords({
      'domain:jesus.film': domainRecord({
        hostname: 'jesus.film',
        pathPrefix: 's',
        notFound: 'fallback',
        fallbackTo: 'https://www.jesusfilm.org',
        reservedPaths: ['dashboard']
      }),
      'domain:other.example': domainRecord({
        hostname: 'other.example',
        pathPrefix: 's'
      }),
      'link:jesus.film/abc': routingRecord({
        id: 'link-jf',
        to: 'https://example.com/jf'
      })
    })
  })

  afterAll(() => fetchMock.deactivate())

  beforeEach(() => clearDomainCache())

  afterEach(() => fetchMock.assertNoPendingInterceptors())

  it('forwards a GET with path, query and headers and sends no event', async () => {
    let captured: InterceptedRequest | undefined
    fetchMock
      .get(adminOrigin)
      .intercept({ path: '/s/dashboard/links?page=2&q=easter' })
      .reply((request) => {
        captured = request
        return {
          statusCode: 200,
          data: '<html>links</html>',
          responseOptions: {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          }
        }
      })

    const { response, sent } = await workerRequest(
      'https://jesus.film/s/dashboard/links?page=2&q=easter',
      { headers: { cookie: 'session=abc', accept: 'text/html' } },
      adminEnv
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe(
      'text/html; charset=utf-8'
    )
    expect(await response.text()).toBe('<html>links</html>')
    expect(captured?.headers.get('cookie')).toBe('session=abc')
    expect(captured?.headers.get('accept')).toBe('text/html')
    expect(captured?.headers.get('x-forwarded-host')).toBe('jesus.film')
    expect(captured?.headers.get('x-forwarded-proto')).toBe('https')
    expect(sent).toHaveLength(0)
  })

  it('matches the bare admin path', async () => {
    fetchMock
      .get(adminOrigin)
      .intercept({ path: '/s/dashboard' })
      .reply(200, 'dashboard')

    const { response } = await workerRequest(
      'https://JESUS.FILM/s/dashboard',
      {},
      adminEnv
    )

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('dashboard')
  })

  it('forwards a POST with its body and overwrites spoofed forwarding headers', async () => {
    let captured: InterceptedRequest | undefined
    fetchMock
      .get(adminOrigin)
      .intercept({ path: '/s/dashboard/api/links', method: 'POST' })
      .reply((request) => {
        captured = request
        return {
          statusCode: 201,
          data: '{"ok":true}',
          responseOptions: { headers: { 'Content-Type': 'application/json' } }
        }
      })

    const { response, sent } = await workerRequest(
      'https://jesus.film/s/dashboard/api/links',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-host': 'attacker.example',
          'x-forwarded-proto': 'http'
        },
        body: '{"pathname":"easter"}'
      },
      adminEnv
    )

    expect(response.status).toBe(201)
    expect(await response.text()).toBe('{"ok":true}')
    expect(captured?.body).toBe('{"pathname":"easter"}')
    expect(captured?.headers.get('content-type')).toBe('application/json')
    expect(captured?.headers.get('x-forwarded-host')).toBe('jesus.film')
    expect(captured?.headers.get('x-forwarded-proto')).toBe('https')
    expect(sent).toHaveLength(0)
  })

  it.each(['PUT', 'PATCH', 'DELETE'])(
    'allows %s on the admin branch',
    async (method) => {
      fetchMock
        .get(adminOrigin)
        .intercept({ path: '/s/dashboard/api/links/1', method })
        .reply(204, '')

      const { response } = await workerRequest(
        'https://jesus.film/s/dashboard/api/links/1',
        { method },
        adminEnv
      )

      expect(response.status).toBe(204)
    }
  )

  it('preserves an upstream 307 with Location and Set-Cookie without following it', async () => {
    fetchMock
      .get(adminOrigin)
      .intercept({ path: '/s/dashboard' })
      .reply(307, '', {
        headers: {
          Location: '/s/dashboard/users/sign-in',
          'Set-Cookie': 'session=xyz; Path=/s/dashboard; HttpOnly; Secure'
        }
      })

    const { response, sent } = await workerRequest(
      'https://jesus.film/s/dashboard',
      {},
      adminEnv
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('/s/dashboard/users/sign-in')
    expect(response.headers.get('set-cookie')).toBe(
      'session=xyz; Path=/s/dashboard; HttpOnly; Secure'
    )
    expect(sent).toHaveLength(0)
  })

  it('passes an upstream error status through', async () => {
    fetchMock
      .get(adminOrigin)
      .intercept({ path: '/s/dashboard/missing' })
      .reply(404, 'admin not found')

    const { response } = await workerRequest(
      'https://jesus.film/s/dashboard/missing',
      {},
      adminEnv
    )

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('admin not found')
  })

  it('answers 503 when the upstream fetch fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    fetchMock
      .get(adminOrigin)
      .intercept({ path: '/s/dashboard' })
      .replyWithError(new Error('connection refused'))

    const { response, sent } = await workerRequest(
      'https://jesus.film/s/dashboard',
      {},
      adminEnv
    )

    expect(response.status).toBe(503)
    expect(await response.text()).toBe('Service Unavailable')
    expect(sent).toHaveLength(0)
    error.mockRestore()
  })

  it('is skipped when the vars are empty', async () => {
    const { response } = await workerRequest(
      'https://jesus.film/s/dashboard',
      {},
      { ADMIN_HOSTNAME: '', ADMIN_PATH: '', ADMIN_PROXY_DEST: '' }
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://www.jesusfilm.org')
  })

  it('is skipped when the host differs', async () => {
    const { response } = await workerRequest(
      'https://other.example/s/dashboard/links',
      {},
      adminEnv
    )

    expect(response.status).toBe(404)
  })

  it('does not match /s/dashboardx', async () => {
    fetchMock
      .get('http://graphql.example.com')
      .intercept({ path: '/', method: 'POST' })
      .reply(200, JSON.stringify({ data: { shortLinkByPath: null } }))

    const { response } = await workerRequest(
      'https://jesus.film/s/dashboardx',
      {},
      adminEnv
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://www.jesusfilm.org')
  })

  it('keeps the 405 rule for non-admin paths on the admin host', async () => {
    const { response } = await workerRequest(
      'https://jesus.film/s/abc',
      { method: 'POST', body: 'x' },
      adminEnv
    )

    expect(response.status).toBe(405)
  })

  it('still redirects short links on the admin host', async () => {
    const { response, sent } = await workerRequest(
      'https://jesus.film/s/abc',
      {},
      adminEnv
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://example.com/jf')
    expect(sent).toHaveLength(1)
  })
})
