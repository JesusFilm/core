import { type ServerResponse, createServer } from 'node:http'

import { hostHeaderValidation, toWebRequest } from '@modelcontextprotocol/node'
import {
  type McpServerFactory,
  createMcpHandler
} from '@modelcontextprotocol/server'
import pino, { type Logger } from 'pino'

import { type McpConfig } from './config'
import { createProtocolServer } from './protocol'

function respond(res: ServerResponse, status: number, message: string): void {
  if (res.writableEnded || res.destroyed) return
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Connection: 'close'
  })
  res.end(JSON.stringify({ error: message }))
}

async function boundedBody(response: Response, limit: number): Promise<Buffer> {
  if (!response.body) return Buffer.alloc(0)
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) return Buffer.concat(chunks)
      size += value.byteLength
      if (size > limit) throw new Error('Response size limit')
      chunks.push(value)
    }
  } finally {
    await reader.cancel().catch(() => undefined)
  }
}

/** The optional factory is supplied by protocol tests, never by release configuration. */
export function createRuntime(
  config: McpConfig,
  options: { factory?: McpServerFactory; logger?: Logger } = {}
) {
  const logger = options.logger ?? pino({ name: 'api-mcp', base: undefined })
  const validateHost = hostHeaderValidation([config.publicUrl.hostname])
  let draining = false
  const active = new Set<AbortController>()
  const handlers = new Set<ReturnType<typeof createMcpHandler>>()

  const server = createServer((req, res) => {
    const startedAt = Date.now()
    res.on('finish', () => {
      logger.info({
        event: 'http_complete',
        status: res.statusCode,
        durationMs: Date.now() - startedAt
      })
    })
    if (req.url === '/health' || req.url === '/ready') {
      if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        respond(res, 405, 'Method not allowed')
        return
      }
      const ready = !draining && config.admissionEnabled
      res.writeHead(req.url === '/ready' && !ready ? 503 : 200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      })
      res.end(
        JSON.stringify({
          status:
            req.url === '/health' ? 'live' : ready ? 'ready' : 'unavailable',
          dataTools: false
        })
      )
      return
    }
    if (!validateHost(req, res)) return
    if (req.headers.origin && req.headers.origin !== config.publicUrl.origin) {
      respond(res, 403, 'Origin denied')
      return
    }
    if (req.url !== config.publicUrl.pathname) {
      respond(res, 404, 'Not found')
      return
    }
    if (
      draining ||
      !config.admissionEnabled ||
      active.size >= config.maxConcurrentRequests
    ) {
      respond(res, 503, 'Admission unavailable')
      return
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      respond(res, 405, 'Method not allowed')
      return
    }
    const abort = new AbortController()
    active.add(abort)
    const handler = createMcpHandler(options.factory ?? createProtocolServer, {
      legacy: 'stateless',
      responseMode: 'json',
      maxSubscriptions: 0,
      maxRequestBodySize: config.maxRequestBytes,
      onerror: () => logger.warn({ event: 'protocol_rejected' })
    })
    handlers.add(handler)
    const timer = setTimeout(() => {
      abort.abort()
      respond(res, 504, 'Request deadline exceeded')
      logger.warn({ event: 'request_deadline' })
    }, config.requestDeadlineMs)
    const cleanup = () => {
      clearTimeout(timer)
      abort.abort()
      active.delete(abort)
      handlers.delete(handler)
      void handler
        .close()
        .catch(() => logger.warn({ event: 'protocol_close_failed' }))
    }
    res.once('close', cleanup)
    req.once('aborted', () => abort.abort())

    const handle = async () => {
      // Keep the socket writable when the SDK stops reading an oversized
      // chunked body, so it can receive the bounded 413 response.
      const request = await toWebRequest(
        {
          method: req.method,
          url: req.url,
          headers: req.headers,
          [Symbol.asyncIterator]: () => req.iterator({ destroyOnReturn: false })
        },
        undefined,
        {
          signal: abort.signal,
          maxRequestBodySize: config.maxRequestBytes
        }
      )
      if (abort.signal.aborted) return
      const response = await handler.fetch(request)
      const body = await boundedBody(response, config.maxResponseBytes)
      if (abort.signal.aborted || res.writableEnded || res.destroyed) return
      res.writeHead(response.status, {
        'Content-Type':
          response.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'no-store',
        ...(response.headers.has('allow')
          ? { Allow: response.headers.get('allow')! }
          : {})
      })
      res.end(body)
    }
    void handle().catch((error: unknown) => {
      if (abort.signal.aborted) return
      const tooLarge =
        error instanceof Error && error.name === 'RequestBodyTooLargeError'
      respond(
        res,
        tooLarge ? 413 : 500,
        tooLarge ? 'Request size limit' : 'Request failed'
      )
      logger.warn({ event: tooLarge ? 'request_size_limit' : 'request_failed' })
    })
  })
  server.maxHeadersCount = 64
  server.headersTimeout = config.requestDeadlineMs
  server.requestTimeout = config.requestDeadlineMs
  server.setTimeout(config.requestDeadlineMs + 1000, (socket) =>
    socket.destroy()
  )

  async function listen(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(config.port, config.host, () => {
        server.removeListener('error', reject)
        resolve()
      })
    })
    logger.info({ event: 'listening', dataTools: false })
  }

  function beginDrain(): void {
    draining = true
  }

  async function shutdown(): Promise<void> {
    beginDrain()
    logger.info({ event: 'drain_started' })
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        for (const abort of active) abort.abort()
        for (const handler of handlers)
          void handler.close().catch(() => undefined)
        server.closeAllConnections()
        resolve()
      }, config.drainDeadlineMs)
      server.close(() => {
        clearTimeout(timer)
        resolve()
      })
    })
    logger.info({ event: 'drain_complete' })
  }

  return { server, listen, beginDrain, shutdown }
}
