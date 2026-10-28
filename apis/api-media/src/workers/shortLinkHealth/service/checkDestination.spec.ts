import dns, { type LookupAddress, type LookupAllOptions } from 'node:dns'
import { once } from 'node:events'
import { readFileSync } from 'node:fs'
import http, { type IncomingMessage, type ServerResponse } from 'node:http'
import https from 'node:https'
import {
  type AddressInfo,
  type LookupFunction,
  type Socket,
  createServer,
  getDefaultAutoSelectFamily,
  setDefaultAutoSelectFamily
} from 'node:net'
import { checkServerIdentity, createSecureContext } from 'node:tls'

import { vi } from 'vitest'

import {
  MAX_REDIRECTS,
  REQUEST_TIMEOUT_MS,
  checkDestination,
  classifyError,
  classifyStatus
} from './checkDestination'

describe('checkDestination', () => {
  // Synthetic fixture identity only. This key never authenticates a deployed service.
  const key = readFileSync(new URL('./health-test-key.pem', import.meta.url))
  const cert = readFileSync(new URL('./health-test-cert.pem', import.meta.url))
  const publicV4 = { address: '93.184.216.34', family: 4 }
  const publicV6 = { address: '2606:4700:4700::1111', family: 6 }
  const originalHttpRequest = http.request
  const originalHttpsRequest = https.request

  let handler: (request: IncomingMessage, response: ServerResponse) => void
  let answers: (hostname: string) => LookupAddress[]
  let lookups: string[]
  let hits: Array<{
    method: string | undefined
    host: string | undefined
    path: string | undefined
  }>
  let serverNames: string[]
  let verifiedNames: string[]
  let trustFixture: boolean
  let httpServer: http.Server
  let httpsServer: https.Server
  let httpPort: number
  let httpsPort: number
  let tlsStallServer: ReturnType<typeof createServer>
  let stalledSocket: Socket | undefined
  let onStallConnection: () => void = () => undefined

  function destination(
    path = '/',
    hostname = 'health.example.test',
    secure = false
  ): string {
    return `${secure ? 'https' : 'http'}://${hostname}:${secure ? httpsPort : httpPort}${path}`
  }

  /**
   * Exercise Node's real connection lookup/HTTP/TLS stack without public traffic.
   * The production lookup must validate the synthetic DNS answers FIRST. Only its
   * approved socket addresses are then mapped to this test's loopback listener.
   * No second DNS lookup is available; a private answer reaching this adapter
   * would hit the listener and fail the zero-request assertions below.
   */
  function fixtureOptions(options: https.RequestOptions): https.RequestOptions {
    expect(options.agent).toBe(false)
    expect(options.rejectUnauthorized).not.toBe(false)
    expect(options.servername).toBeUndefined()
    const guardedLookup = options.lookup
    if (guardedLookup == null)
      throw new Error('missing connection lookup guard')
    const lookup: LookupFunction = (hostname, lookupOptions, callback) => {
      guardedLookup(hostname, lookupOptions, (error, address, family) => {
        if (error != null) {
          callback(error, '', 4)
          return
        }
        if (Array.isArray(address)) {
          callback(
            null,
            address.map(() => ({ address: '127.0.0.1', family: 4 }))
          )
        } else callback(null, '127.0.0.1', family === 6 ? 4 : family)
      })
    }
    return {
      ...options,
      lookup,
      ca: trustFixture ? cert : undefined,
      checkServerIdentity: (hostname, certificate) => {
        verifiedNames.push(hostname)
        return checkServerIdentity(hostname, certificate)
      }
    }
  }

  beforeAll(async () => {
    const serve = (
      request: IncomingMessage,
      response: ServerResponse
    ): void => {
      hits.push({
        method: request.method,
        host: request.headers.host,
        path: request.url
      })
      handler(request, response)
    }
    httpServer = http.createServer(serve)
    httpsServer = https.createServer(
      {
        key,
        cert,
        SNICallback: (servername, callback) => {
          serverNames.push(servername)
          callback(null, createSecureContext({ key, cert }))
        }
      },
      serve
    )
    tlsStallServer = createServer((socket) => {
      stalledSocket = socket
      socket.resume()
      onStallConnection()
    })
    tlsStallServer.listen(0, '127.0.0.1')
    httpServer.listen(0, '127.0.0.1')
    httpsServer.listen(0, '127.0.0.1')
    await Promise.all([
      once(httpServer, 'listening'),
      once(httpsServer, 'listening'),
      once(tlsStallServer, 'listening')
    ])
    httpPort = (httpServer.address() as AddressInfo).port
    httpsPort = (httpsServer.address() as AddressInfo).port
  })

  afterAll(async () => {
    await Promise.all([
      new Promise<void>((resolve) => tlsStallServer.close(() => resolve())),
      new Promise<void>((resolve) => httpServer.close(() => resolve())),
      new Promise<void>((resolve) => httpsServer.close(() => resolve()))
    ])
  })

  beforeEach(() => {
    hits = []
    lookups = []
    serverNames = []
    verifiedNames = []
    trustFixture = true
    handler = (_request, response) => {
      response.writeHead(200)
      response.end()
    }
    answers = () => [publicV4]
    vi.stubEnv('SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS', 'false')
    vi.spyOn(dns, 'lookup').mockImplementation(((
      hostname: string,
      _options: LookupAllOptions,
      callback: (
        error: NodeJS.ErrnoException | null,
        addresses: LookupAddress[]
      ) => void
    ) => {
      lookups.push(hostname)
      queueMicrotask(() => callback(null, answers(hostname)))
    }) as typeof dns.lookup)
    // Only the test dial mapping/CA changes; URL and production lookup stay intact.
    vi.spyOn(http, 'request').mockImplementation(((
      url: URL,
      options: http.RequestOptions,
      callback: (response: IncomingMessage) => void
    ) =>
      originalHttpRequest(
        url,
        fixtureOptions(options),
        callback
      )) as typeof http.request)
    vi.spyOn(https, 'request').mockImplementation(((
      url: URL,
      options: https.RequestOptions,
      callback: (response: IncomingMessage) => void
    ) =>
      originalHttpsRequest(
        url,
        fixtureOptions(options),
        callback
      )) as typeof https.request)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    stalledSocket?.destroy()
    httpServer.closeAllConnections()
    httpsServer.closeAllConnections()
  })

  describe('health classification', () => {
    it.each([
      [200, 'ok'],
      [403, 'ok'],
      [429, 'ok'],
      [404, 'notFound'],
      [410, 'notFound'],
      [500, 'serverError'],
      [503, 'serverError']
    ] as const)('maps %i to %s', (status, health) => {
      expect(classifyStatus(status)).toBe(health)
    })

    it.each([
      ['ENOTFOUND', 'dns'],
      ['EAI_AGAIN', 'dns'],
      ['CERT_HAS_EXPIRED', 'tls'],
      ['ERR_TLS_CERT_ALTNAME_INVALID', 'tls'],
      ['ERR_TOO_MANY_REDIRECTS', 'redirectLoop'],
      ['ECONNRESET', 'unknown'],
      ['AbortError', 'timeout']
    ] as const)('maps nested %s to %s', (code, health) => {
      expect(
        classifyError(
          Object.assign(new TypeError('fetch failed'), { cause: { code } })
        )
      ).toBe(health)
    })
  })

  describe('connection destination policy', () => {
    it.each([
      '127.0.0.1',
      '10.0.0.1',
      '172.16.0.1',
      '192.168.1.1',
      '169.254.169.254',
      '100.64.0.1',
      '::1',
      'fc00::1',
      'fe80::1',
      '::ffff:7f00:1',
      '::ffff:169.254.169.254',
      '0:0:0:0:0:0:0:1',
      '0:0:0:0:0:ffff:7f00:1'
    ])('refuses DNS resolving to %s without a request', async (address) => {
      answers = () => [{ address, family: address.includes(':') ? 6 : 4 }]
      expect(await checkDestination(destination())).toBe('unknown')
      expect(hits).toEqual([])
      expect(lookups).toEqual(['health.example.test'])
    })

    it.each([
      [publicV4, { address: '::1', family: 6 }],
      [publicV6, { address: '10.0.0.1', family: 4 }],
      [{ address: '127.0.0.1', family: 4 }, publicV4],
      []
    ])('rejects the complete mixed/empty answer set %#', async (...records) => {
      answers = () => records
      expect(await checkDestination(destination())).toBe('unknown')
      expect(hits).toEqual([])
    })

    it.each([[publicV4], [publicV6], [publicV4, publicV6]])(
      'allows only public answers %#',
      async (...records) => {
        answers = () => records
        expect(await checkDestination(destination())).toBe('ok')
        expect(hits).toHaveLength(1)
        expect(lookups).toHaveLength(1)
      }
    )

    it('supports single-family socket lookup without a second resolution', async () => {
      const original = getDefaultAutoSelectFamily()
      setDefaultAutoSelectFamily(false)
      try {
        expect(await checkDestination(destination())).toBe('ok')
        expect(lookups).toHaveLength(1)
        expect(hits).toHaveLength(1)
      } finally {
        setDefaultAutoSelectFamily(original)
      }
    })

    it('preserves the existing explicit local-development destination opt-in', async () => {
      vi.stubEnv('SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS', 'true')
      expect(await checkDestination(`http://127.0.0.1:${httpPort}/local`)).toBe(
        'ok'
      )
      expect(lookups).toEqual([])
      expect(hits).toHaveLength(1)
    })

    it('does not perform an unchecked second DNS resolution before connecting', async () => {
      answers = () =>
        lookups.length === 1
          ? [publicV4]
          : [{ address: '127.0.0.1', family: 4 }]
      expect(await checkDestination(destination())).toBe('ok')
      expect(lookups).toHaveLength(1)
      expect(hits).toHaveLength(1)
    })

    it('revalidates a rebound hostname on HEAD-to-GET fallback', async () => {
      handler = (_request, response) => {
        response.writeHead(405)
        response.end()
      }
      answers = () =>
        lookups.length === 1
          ? [publicV4]
          : [{ address: '127.0.0.1', family: 4 }]
      expect(await checkDestination(destination())).toBe('unknown')
      expect(hits.map((hit) => hit.method)).toEqual(['HEAD'])
      expect(lookups).toHaveLength(2)
    })

    it.each([false, true])(
      'blocks private DNS at redirect (GET fallback=%s)',
      async (fallback) => {
        handler = (request, response) => {
          response.writeHead(
            fallback && request.method === 'HEAD' ? 405 : 302,
            {
              location: destination('/', 'private.example.test')
            }
          )
          response.end()
        }
        answers = (hostname) =>
          hostname === 'private.example.test'
            ? [{ address: '10.0.0.1', family: 4 }]
            : [publicV4]
        expect(await checkDestination(destination())).toBe('unknown')
        expect(hits.map((hit) => hit.method)).toEqual(
          fallback ? ['HEAD', 'GET'] : ['HEAD']
        )
      }
    )

    it('revalidates a rebound hostname on redirect', async () => {
      handler = (_request, response) => {
        response.writeHead(302, { location: '/again' })
        response.end()
      }
      answers = () =>
        lookups.length === 1
          ? [publicV4]
          : [{ address: '169.254.169.254', family: 4 }]
      expect(await checkDestination(destination())).toBe('unknown')
      expect(hits).toHaveLength(1)
    })

    it('retains native fetch forbidden-port rejection before DNS', async () => {
      for (const port of [21, 22, 25, 53, 6667, 10080])
        expect(
          await checkDestination(`https://health.example.test:${port}/`)
        ).toBe('unknown')
      expect(lookups).toEqual([])
      expect(hits).toEqual([])
    })

    it('rejects literal private addresses, local names, URL credentials and non-web schemes before dialing', async () => {
      for (const url of [
        'http://127.0.0.1',
        'https://[::1]',
        'http://localhost',
        'http://service.internal',
        'file:///etc/hosts',
        'https://name:password@health.example.test'
      ])
        expect(await checkDestination(url)).toBe('unknown')
      expect(lookups).toEqual([])
      expect(hits).toEqual([])
    })
  })

  describe('native HTTP/TLS and health behavior', () => {
    it('preserves HTTPS Host, SNI, certificate identity and path while connecting through validated lookup', async () => {
      expect(
        await checkDestination(
          destination('/path?q=hello%20world', 'health.example.test', true)
        )
      ).toBe('ok')
      expect(hits).toEqual([
        {
          method: 'HEAD',
          host: `health.example.test:${httpsPort}`,
          path: '/path?q=hello%20world'
        }
      ])
      expect(serverNames).toEqual(['health.example.test'])
      expect(verifiedNames).toEqual(['health.example.test'])
    })

    it('rejects a trusted certificate for the wrong hostname', async () => {
      expect(
        await checkDestination(destination('/', 'wrong.example.test', true))
      ).toBe('tls')
      expect(verifiedNames).toEqual(['wrong.example.test'])
      expect(hits).toEqual([])
    })

    it('rejects an untrusted certificate', async () => {
      trustFixture = false
      expect(
        await checkDestination(destination('/', 'health.example.test', true))
      ).toBe('tls')
      expect(hits).toEqual([])
    })

    it.each([405, 501])(
      'uses a new validated GET after HEAD %i',
      async (status) => {
        handler = (request, response) => {
          response.writeHead(request.method === 'HEAD' ? status : 200)
          response.end()
        }
        expect(
          await checkDestination(destination('/', 'health.example.test', true))
        ).toBe('ok')
        expect(hits.map((hit) => hit.method)).toEqual(['HEAD', 'GET'])
        expect(lookups).toHaveLength(2)
        expect(serverNames).toEqual([
          'health.example.test',
          'health.example.test'
        ])
        expect(verifiedNames).toEqual([
          'health.example.test',
          'health.example.test'
        ])
      }
    )

    it.each([
      [403, 'ok', 1],
      [429, 'ok', 1],
      [404, 'notFound', 2],
      [410, 'notFound', 2],
      [503, 'serverError', 2]
    ] as const)(
      'preserves status %i health %s',
      async (status, health, attempts) => {
        handler = (_request, response) => {
          response.writeHead(status)
          response.end()
        }
        expect(await checkDestination(destination())).toBe(health)
        expect(hits).toHaveLength(attempts)
      }
    )

    it('follows relative public redirects with fresh lookup', async () => {
      handler = (request, response) => {
        response.writeHead(
          request.url === '/a' ? 302 : 200,
          request.url === '/a' ? { location: '/b' } : {}
        )
        response.end()
      }
      expect(await checkDestination(destination('/a'))).toBe('ok')
      expect(hits.map((hit) => hit.path)).toEqual(['/a', '/b'])
      expect(lookups).toHaveLength(2)
    })

    it('retains the manual redirect limit', async () => {
      handler = (_request, response) => {
        response.writeHead(302, { location: '/again' })
        response.end()
      }
      expect(await checkDestination(destination())).toBe('redirectLoop')
      expect(hits).toHaveLength(MAX_REDIRECTS + 1)
    })

    it('refuses a protocol upgrade without leaving a pending health check', async () => {
      handler = (_request, response) => {
        response.writeHead(101, {
          connection: 'Upgrade',
          upgrade: 'synthetic-test'
        })
        response.flushHeaders()
      }
      expect(await checkDestination(destination())).toBe('unknown')
    })

    it('destroys a never-ending GET body immediately after response headers', async () => {
      let closed = false
      handler = (request, response) => {
        if (request.method === 'HEAD') {
          response.writeHead(405)
          response.end()
          return
        }
        response.on('close', () => {
          closed = true
        })
        response.writeHead(200)
        response.write('body is intentionally unfinished')
      }
      expect(await checkDestination(destination())).toBe('ok')
      await vi.waitFor(() => expect(closed).toBe(true))
    })

    it('destroys a never-ending redirect body before the next hop', async () => {
      let closed = false
      handler = (request, response) => {
        if (request.url === '/b') {
          response.writeHead(200)
          response.end()
          return
        }
        response.on('close', () => {
          closed = true
        })
        response.writeHead(302, { location: '/b' })
        response.flushHeaders()
        response.write('unfinished redirect')
      }
      expect(await checkDestination(destination('/a'))).toBe('ok')
      await vi.waitFor(() => expect(closed).toBe(true))
    })

    it('aborts a connection stalled before response headers at the per-attempt deadline', async () => {
      let arrived!: () => void
      const received = new Promise<void>((resolve) => {
        arrived = resolve
      })
      let closed = false
      handler = (request) => {
        request.on('close', () => {
          closed = true
        })
        arrived()
      }
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const result = checkDestination(destination())
      await received
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS)
      expect(await result).toBe('timeout')
      vi.useRealTimers()
      await vi.waitFor(() => expect(closed).toBe(true))
    })

    it('aborts a stalled TLS handshake at the same deadline', async () => {
      const connected = new Promise<void>((resolve) => {
        onStallConnection = resolve
      })
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const result = checkDestination(
        `https://health.example.test:${(tlsStallServer.address() as AddressInfo).port}/`
      )
      await connected
      const socket = stalledSocket
      if (socket == null) throw new Error('missing fixture socket')
      let closed = false
      socket.on('close', () => {
        closed = true
      })
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS)
      expect(await result).toBe('timeout')
      vi.useRealTimers()
      await vi.waitFor(() => expect(closed).toBe(true))
      expect(hits).toEqual([])
    })

    it('aborts a stalled DNS lookup and never connects when its answer arrives late', async () => {
      let complete!: () => void
      vi.mocked(dns.lookup).mockImplementation(((
        _hostname: string,
        _options: LookupAllOptions,
        callback: (
          error: NodeJS.ErrnoException | null,
          addresses: LookupAddress[]
        ) => void
      ) => {
        complete = () => callback(null, [publicV4])
      }) as typeof dns.lookup)
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const result = checkDestination(destination())
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS)
      expect(await result).toBe('timeout')
      complete()
      vi.useRealTimers()
      await new Promise<void>((resolve) => setImmediate(resolve))
      expect(hits).toEqual([])
    })
  })
})
