import { request } from 'node:http'
import { PassThrough } from 'node:stream'

import pino from 'pino'

import { fixtureFactory } from '../test/fixture'
import { config, message, payload, post, runtimeUrl } from '../test/helpers'

import { createRuntime } from './runtime'

const runtimes: ReturnType<typeof createRuntime>[] = []
async function start(
  options: Parameters<typeof createRuntime>[1] = {},
  overrides = {}
) {
  const runtime = createRuntime({ ...config(), ...overrides }, options)
  runtimes.push(runtime)
  await runtime.listen()
  return runtime
}

describe('real MCP HTTP endpoint', () => {
  afterEach(async () => {
    await Promise.all(
      runtimes.splice(0).map(async (runtime) => await runtime.shutdown())
    )
  })

  it.each(['2026-07-28', '2025-11-25'])(
    'serves only tools with request isolation on %s',
    async (version) => {
      const runtime = await start({ factory: fixtureFactory('replica') })
      const url = runtimeUrl(runtime)
      const discovery =
        version === '2026-07-28'
          ? await post(url, version, 'server/discover')
          : await post(url, version, 'initialize', {
              protocolVersion: version,
              capabilities: {},
              clientInfo: { name: 'fixture', version: '1.0' }
            })
      expect(discovery.status).toBe(200)
      expect(discovery.headers.has('mcp-session-id')).toBe(false)
      const discovered = await payload(discovery)
      expect(discovered.result.capabilities).toEqual({
        tools: { listChanged: false }
      })
      if (version === '2026-07-28')
        expect(discovered.result.supportedVersions).toEqual(['2026-07-28'])
      if (version === '2025-11-25')
        expect(discovered.result.protocolVersion).toBe(version)
      const listed = await payload(await post(url, version, 'tools/list'))
      expect(
        listed.result.tools.map((tool: { name: string }) => tool.name)
      ).toEqual(['fixture_echo'])
      const results = await Promise.all(
        ['first', 'second'].map(async (value) => {
          const response = await post(url, version, 'tools/call', {
            name: 'fixture_echo',
            arguments: { value }
          })
          expect(response.status).toBe(200)
          expect(response.headers.has('mcp-session-id')).toBe(false)
          return (await payload(response)).result.structuredContent
        })
      )
      expect(results.map((result) => result.value)).toEqual(['first', 'second'])
      expect(results[0].instance).not.toBe(results[1].instance)
      expect(results[0].replica).toBe('replica')
    }
  )

  it.each(['2026-07-28', '2025-11-25'])(
    'keeps release tools empty with unreachable future endpoints on %s',
    async (version) => {
      const runtime = await start(
        {},
        {
          issuerUrl: new URL('http://127.0.0.1:1'),
          gatewayUrl: new URL('http://127.0.0.1:1')
        }
      )
      const listed = await payload(
        await post(runtimeUrl(runtime), version, 'tools/list')
      )
      expect(listed.result.tools).toEqual([])
      const denied = await payload(
        await post(runtimeUrl(runtime), version, 'tools/call', {
          name: 'journey_read',
          arguments: { journeyId: 'private' }
        })
      )
      expect(denied.error ?? denied.result?.isError).toBeTruthy()
      expect(JSON.stringify(denied)).not.toContain('private')
      expect(
        (await fetch(runtimeUrl(runtime).replace('/mcp', '/ready'))).status
      ).toBe(200)
    }
  )

  it.each(['2026-07-28', '2025-11-25'])(
    'denies subscriptions and unsupported capabilities over POST on %s',
    async (version) => {
      const runtime = await start()
      for (const method of [
        'subscriptions/listen',
        'subscriptions/subscribe',
        'resources/list',
        'prompts/list',
        'sampling/createMessage',
        'elicitation/create',
        'unknown'
      ]) {
        const result = await payload(
          await post(runtimeUrl(runtime), version, method)
        )
        expect(result.error.code).toBe(
          method === 'subscriptions/listen' && version === '2026-07-28'
            ? -32603
            : -32601
        )
      }
      for (const method of ['GET', 'DELETE', 'PUT']) {
        const response = await fetch(runtimeUrl(runtime), { method })
        expect(response.status).toBe(405)
        expect(response.headers.get('allow')).toBe('POST')
      }
    }
  )

  it('preserves SDK validation and notification behavior before denying unsupported requests', async () => {
    const runtime = await start()
    const url = runtimeUrl(runtime)
    const wrongType = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'unknown' })
    })
    expect(wrongType.status).toBe(415)
    const malformed = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream'
      },
      body: JSON.stringify({ id: 1, method: 'unknown' })
    })
    expect((await payload(malformed)).error.code).toBe(-32600)
    const notification = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream'
      },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/unknown' })
    })
    expect(notification.status).toBe(202)
    expect(await notification.text()).toBe('')
    const unsupportedRevision = await post(url, '2099-01-01', 'tools/list')
    expect(unsupportedRevision.status).toBe(400)
  })

  it.each(['2026-07-28', '2025-11-25'])(
    'bounds protocol error output with oversized request IDs on %s',
    async (version) => {
      const runtime = await start({}, { maxResponseBytes: 256 })
      const response = await fetch(runtimeUrl(runtime), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json, text/event-stream',
          'mcp-protocol-version': version,
          'mcp-method': 'subscriptions/listen'
        },
        body: JSON.stringify({
          ...message(version, 'subscriptions/listen'),
          id: 'x'.repeat(2000)
        })
      })
      expect(response.status).toBe(500)
      expect(Buffer.byteLength(await response.text())).toBeLessThanOrEqual(256)
    }
  )

  it.each(['2026-07-28', '2025-11-25'])(
    'enforces input, output, concurrency and deadline bounds on %s',
    async (version) => {
      const runtime = await start(
        { factory: fixtureFactory('bounds') },
        {
          maxRequestBytes: 2048,
          maxResponseBytes: 4096,
          requestDeadlineMs: 250,
          maxConcurrentRequests: 1
        }
      )
      const url = runtimeUrl(runtime)
      const oversized = await fetch(url, {
        method: 'POST',
        body: 'x'.repeat(2049)
      })
      expect(oversized.status).toBe(413)
      const output = await post(url, version, 'tools/call', {
        name: 'fixture_echo',
        arguments: { value: 'hidden', outputBytes: 8192 }
      })
      expect(output.status).toBe(500)
      expect(await output.text()).not.toContain('hidden')
      const slow = post(url, version, 'tools/call', {
        name: 'fixture_echo',
        arguments: { value: 'slow', delayMs: 1000 }
      })
      await new Promise((resolve) => setTimeout(resolve, 50))
      const busy = await post(url, version, 'tools/list')
      expect(busy.status).toBe(503)
      expect((await slow).status).toBe(504)
      expect((await post(url, version, 'tools/list')).status).toBe(200)
    }
  )

  it('enforces the trusted body bound for chunked requests', async () => {
    const runtime = await start({}, { maxRequestBytes: 1024 })
    const status = await new Promise<number | undefined>((resolve, reject) => {
      const req = request(
        runtimeUrl(runtime),
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'transfer-encoding': 'chunked'
          }
        },
        (response) => {
          response.resume()
          resolve(response.statusCode)
        }
      )
      req.on('error', reject)
      req.write('x'.repeat(512))
      req.end('x'.repeat(513))
    })
    expect(status).toBe(413)
  })

  it('bounds an incomplete request body by the application deadline', async () => {
    const runtime = await start({}, { requestDeadlineMs: 100 })
    const started = Date.now()
    const status = await new Promise<number | undefined>((resolve, reject) => {
      const req = request(
        runtimeUrl(runtime),
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' }
        },
        (response) => {
          response.resume()
          resolve(response.statusCode)
          req.end()
        }
      )
      req.on('error', reject)
      req.write('{')
    })
    expect(status).toBe(504)
    expect(Date.now() - started).toBeLessThan(1500)
  })

  it.each(['2026-07-28', '2025-11-25'])(
    'releases protocol admission when a client disconnects on %s',
    async (version) => {
      const runtime = await start(
        { factory: fixtureFactory('disconnect') },
        { maxConcurrentRequests: 1 }
      )
      const abort = new AbortController()
      const pending = fetch(runtimeUrl(runtime), {
        method: 'POST',
        signal: abort.signal,
        headers: {
          'content-type': 'application/json',
          accept: 'application/json, text/event-stream',
          'mcp-protocol-version': version,
          'mcp-method': 'tools/call',
          'mcp-name': 'fixture_echo'
        },
        body: JSON.stringify(
          message(version, 'tools/call', {
            name: 'fixture_echo',
            arguments: { value: 'disconnect', delayMs: 5000 }
          })
        )
      })
      const disconnected = pending.then(
        () => false,
        () => true
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
      abort.abort()
      expect(await disconnected).toBe(true)
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(
        (await post(runtimeUrl(runtime), version, 'tools/list')).status
      ).toBe(200)
    }
  )

  it('fails readiness and admission while stopped but keeps liveness, and rejects foreign hosts/origins', async () => {
    const runtime = await start()
    const url = runtimeUrl(runtime)
    const rejectedHost = await new Promise<number | undefined>(
      (resolve, reject) => {
        const req = request(
          url,
          { headers: { Host: 'attacker.example' } },
          (response) => {
            response.resume()
            resolve(response.statusCode)
          }
        )
        req.on('error', reject)
        req.end()
      }
    )
    expect(rejectedHost).toBe(403)
    expect(
      (await fetch(url, { headers: { Origin: 'https://attacker.example' } }))
        .status
    ).toBe(403)
    runtime.beginDrain()
    expect((await fetch(url.replace('/mcp', '/health'))).status).toBe(200)
    expect((await fetch(url.replace('/mcp', '/ready'))).status).toBe(503)
    expect((await post(url, '2026-07-28', 'tools/list')).status).toBe(503)
  })

  it('closes admission independently of readiness routing', async () => {
    const runtime = await start({}, { admissionEnabled: false })
    expect(
      (await fetch(runtimeUrl(runtime).replace('/mcp', '/ready'))).status
    ).toBe(503)
    expect(
      (await post(runtimeUrl(runtime), '2026-07-28', 'tools/list')).status
    ).toBe(503)
  })

  it('never logs headers, bodies, URLs or raw protocol errors', async () => {
    const stream = new PassThrough()
    let logs = ''
    stream.on('data', (chunk: Buffer) => {
      logs += chunk.toString()
    })
    const runtime = await start({ logger: pino({ base: undefined }, stream) })
    const response = await fetch(runtimeUrl(runtime), {
      method: 'POST',
      headers: {
        authorization: 'Bearer TOKEN_SENTINEL',
        'content-type': 'application/json'
      },
      body: '{"TEXT_SENTINEL":'
    })
    await response.text()
    await fetch(`${runtimeUrl(runtime)}?private=URL_SENTINEL`)
    expect(logs).toContain('http_complete')
    expect(logs).not.toMatch(
      /TOKEN_SENTINEL|TEXT_SENTINEL|URL_SENTINEL|authorization/i
    )
  })
})
