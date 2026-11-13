import { type ChildProcess, fork } from 'node:child_process'
import { createServer, request } from 'node:http'
import { type AddressInfo } from 'node:net'
import { join } from 'node:path'

import { payload, post } from './helpers'

interface Replica {
  child: ChildProcess
  port: number
  logs: () => string
  stop: (signal?: NodeJS.Signals) => Promise<void>
}

async function replica(label: string, deadlineMs = 2000): Promise<Replica> {
  const child = fork(
    join(process.cwd(), 'apis/api-mcp/test/fixture-process.ts'),
    [],
    {
      execArgv: ['--import', 'tsx'],
      env: {
        ...process.env,
        MCP_AUTH_MODE: 'disabled',
        MCP_PUBLIC_URL: 'http://127.0.0.1:4010/mcp',
        MCP_DRAIN_DEADLINE_MS: String(deadlineMs),
        FIXTURE_REPLICA: label
      },
      stdio: ['ignore', 'pipe', 'pipe', 'ipc']
    }
  )
  let logs = ''
  child.stdout?.on('data', (chunk: Buffer) => {
    logs += chunk.toString()
  })
  child.stderr?.on('data', (chunk: Buffer) => {
    logs += chunk.toString()
  })
  const port = await new Promise<number>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Replica startup deadline exceeded')),
      5000
    )
    child.once('error', reject)
    child.once('exit', (code) =>
      reject(new Error(`Replica exited before ready: ${code}`))
    )
    child.once('message', (message: { port: number }) => {
      clearTimeout(timer)
      resolve(message.port)
    })
  })
  return {
    child,
    port,
    logs: () => logs,
    stop: async (signal = 'SIGTERM') => {
      if (child.exitCode !== null || child.signalCode !== null) return
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          child.kill('SIGKILL')
          reject(new Error('Replica did not shut down within bound'))
        }, 4000)
        child.once('exit', () => {
          clearTimeout(timer)
          resolve()
        })
        child.kill(signal)
      })
    }
  }
}

describe('local process qualification', () => {
  const children: Replica[] = []

  afterEach(async () => {
    await Promise.all(
      children.splice(0).map(async (child) => await child.stop('SIGKILL'))
    )
  })

  it.each(['2026-07-28', '2025-11-25'])(
    'routes across two replicas and replaces one without affinity on %s',
    async (version) => {
      const first = await replica('first')
      children.push(first)
      const second = await replica('second')
      children.push(second)
      const backends = [first.port, second.port]
      let next = 0
      const proxy = createServer((req, res) => {
        const upstream = request(
          {
            hostname: '127.0.0.1',
            port: backends[next++ % backends.length],
            method: req.method,
            path: req.url,
            headers: req.headers
          },
          (response) => {
            res.writeHead(response.statusCode ?? 502, response.headers)
            response.pipe(res)
          }
        )
        upstream.on('error', () => {
          res.writeHead(502)
          res.end()
        })
        req.pipe(upstream)
      })
      await new Promise<void>((resolve) =>
        proxy.listen(0, '127.0.0.1', resolve)
      )
      const url = `http://127.0.0.1:${(proxy.address() as AddressInfo).port}/mcp`
      try {
        const observed = []
        for (let index = 0; index < 4; index++) {
          const response = await post(url, version, 'tools/call', {
            name: 'fixture_echo',
            arguments: { value: `request-${index}` }
          })
          expect(response.headers.has('mcp-session-id')).toBe(false)
          const result = (await payload(response)).result.structuredContent
          expect(result.value).toBe(`request-${index}`)
          observed.push(result)
        }
        expect(observed.map((result) => result.replica)).toEqual([
          'first',
          'second',
          'first',
          'second'
        ])
        expect(new Set(observed.map((result) => result.instance)).size).toBe(4)
        await first.stop('SIGKILL')
        const replacement = await replica('replacement')
        children.push(replacement)
        backends[0] = replacement.port
        const replaced = await payload(
          await post(url, version, 'tools/call', {
            name: 'fixture_echo',
            arguments: { value: 'after-replacement' }
          })
        )
        expect(replaced.result.structuredContent.replica).toBe('replacement')
        expect(replaced.result.structuredContent.value).toBe(
          'after-replacement'
        )
        const surviving = await payload(
          await post(url, version, 'tools/call', {
            name: 'fixture_echo',
            arguments: { value: 'surviving' }
          })
        )
        expect(surviving.result.structuredContent.replica).toBe('second')
      } finally {
        await new Promise<void>((resolve) => proxy.close(() => resolve()))
      }
    }
  )

  it.each(['2026-07-28', '2025-11-25'])(
    'settles a bounded request during graceful drain on %s',
    async (version) => {
      const child = await replica('graceful')
      children.push(child)
      const pending = post(
        `http://127.0.0.1:${child.port}/mcp`,
        version,
        'tools/call',
        {
          name: 'fixture_echo',
          arguments: { value: 'settle', delayMs: 250 }
        }
      )
      await new Promise((resolve) => setTimeout(resolve, 100))
      const stopped = child.stop()
      const response = await payload(await pending)
      expect(response.result.structuredContent.value).toBe('settle')
      await stopped
      expect(child.logs()).toContain('drain_complete')
    }
  )

  it.each(['2026-07-28', '2025-11-25'])(
    'bounds transport shutdown without asserting backend cancellation on %s',
    async (version) => {
      const child = await replica('bounded', 100)
      children.push(child)
      const pending = post(
        `http://127.0.0.1:${child.port}/mcp`,
        version,
        'tools/call',
        {
          name: 'fixture_echo',
          arguments: { value: 'long', delayMs: 5000 }
        }
      ).catch(() => undefined)
      await new Promise((resolve) => setTimeout(resolve, 100))
      const started = Date.now()
      await child.stop()
      expect(Date.now() - started).toBeLessThan(2500)
      await pending
      expect(child.logs()).toContain('drain_complete')
    }
  )
})
