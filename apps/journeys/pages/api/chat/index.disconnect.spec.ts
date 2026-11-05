// @vitest-environment node
import { createServer, get } from 'node:http'
import type { AddressInfo } from 'node:net'

import { streamText } from 'ai'
import { MockLanguageModelV4 } from 'ai/test'
import type { NextApiRequest, NextApiResponse } from 'next'

import handler from './index'

const mocks = vi.hoisted(() => ({
  model: vi.fn(),
  prompt: vi.fn(),
  keepAlive: vi.fn(),
  end: vi.fn(),
  flush: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>()
  return { ...actual, streamText: vi.fn(actual.streamText) }
})

vi.mock('@vercel/functions', () => ({ waitUntil: mocks.keepAlive }))

vi.mock('@ai-sdk/google', () => ({ google: mocks.model }))
vi.mock('../../../src/libs/getFlags', () => ({
  getFlags: () => Promise.resolve({ apologistChat: true })
}))
vi.mock('../../../src/libs/getCardChatEnabled', () => ({
  getCardChatEnabled: () => Promise.resolve(true)
}))
vi.mock('../../../src/libs/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}))
vi.mock('../../../src/libs/langfuse/client', () => ({
  APOLOGIST_PROMPT_NAME: 'synthetic-prompt',
  getActivePromptLabel: () => 'development',
  getLangfuse: () => ({
    prompt: {
      get: mocks.prompt
    }
  }),
  startChatGeneration: () => ({ end: mocks.end }),
  flushLangfuse: mocks.flush
}))

function deferred(): {
  promise: Promise<void>
  resolve: () => void
  reject: (error: unknown) => void
} {
  let resolve!: () => void
  let reject!: (error: unknown) => void
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe('chat HTTP stream lifecycle', () => {
  beforeEach(() => {
    mocks.prompt.mockResolvedValue({ type: 'text', compile: () => 'synthetic' })
    mocks.flush.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it.each(['socket', 'request-error'])(
    'skips generation when cancellation happens during prompt retrieval (%s)',
    async (kind) => {
      vi.stubEnv('CHAT_PROVIDER', 'gemini')
      const requested = deferred()
      const release = deferred()
      const handled = deferred()
      const closed = deferred()
      let incoming: import('node:http').IncomingMessage
      mocks.prompt.mockImplementation(async () => {
        requested.resolve()
        await release.promise
        return { type: 'text', compile: () => 'synthetic' }
      })
      const server = createServer((req, res) => {
        incoming = req
        const request = req as NextApiRequest
        request.method = 'POST'
        request.body = {
          messages: [
            { role: 'user', parts: [{ type: 'text', text: 'synthetic' }] }
          ],
          journeyId: 'synthetic',
          cardId: 'synthetic'
        }
        res.once('close', closed.resolve)
        void handler(request, res as NextApiResponse).then(
          handled.resolve,
          handled.reject
        )
      })
      await new Promise<void>((resolve) =>
        server.listen(0, '127.0.0.1', resolve)
      )
      const client = get(
        `http://127.0.0.1:${(server.address() as AddressInfo).port}`
      )
      client.on('error', () => undefined)
      try {
        await requested.promise
        if (kind === 'socket') {
          client.destroy()
          await closed.promise
        } else {
          incoming!.emit('error', new Error('aborted'))
        }
        release.resolve()
        await handled.promise
        expect(streamText).not.toHaveBeenCalled()
        expect(mocks.end).toHaveBeenCalledWith(
          expect.objectContaining({ level: 'WARNING' })
        )
        expect(mocks.flush).toHaveBeenCalledTimes(1)
        expect(incoming!.listenerCount('error')).toBe(0)
      } finally {
        release.resolve()
        client.destroy()
        server.closeAllConnections()
        await new Promise<void>((resolve) => server.close(() => resolve()))
      }
    }
  )

  it.each([true, false, 'request-error'])(
    'ends and flushes the generation with client disconnect=%s',
    async (disconnect) => {
      vi.stubEnv('CHAT_PROVIDER', 'gemini')
      const release = deferred()
      const handled = deferred()
      const flushed = deferred()
      let providerSignal: AbortSignal | undefined
      mocks.flush.mockImplementation(async () => {
        await flushed.promise
      })
      mocks.model.mockReturnValue(
        new MockLanguageModelV4({
          doStream: ({ abortSignal }) => {
            providerSignal = abortSignal
            return Promise.resolve({
              stream: new ReadableStream({
                async start(controller) {
                  controller.enqueue({ type: 'stream-start', warnings: [] })
                  controller.enqueue({ type: 'text-start', id: 'text' })
                  controller.enqueue({
                    type: 'text-delta',
                    id: 'text',
                    delta: 'first'
                  })
                  // Keep the provider alive until the real HTTP client closes.
                  await release.promise
                  for (let i = 0; i < 50; i++) {
                    controller.enqueue({
                      type: 'text-delta',
                      id: 'text',
                      delta: ' more'
                    })
                  }
                  controller.enqueue({ type: 'text-end', id: 'text' })
                  controller.enqueue({
                    type: 'finish',
                    finishReason: { unified: 'stop', raw: 'stop' },
                    usage: {
                      inputTokens: {
                        total: 1,
                        noCache: 1,
                        cacheRead: 0,
                        cacheWrite: 0
                      },
                      outputTokens: { total: 51, text: 51, reasoning: 0 }
                    }
                  })
                  controller.close()
                }
              })
            })
          }
        })
      )
      let activeRequest: import('node:http').IncomingMessage
      const server = createServer((req, res) => {
        activeRequest = req
        const request = req as NextApiRequest
        request.method = 'POST'
        request.body = {
          messages: [
            { role: 'user', parts: [{ type: 'text', text: 'synthetic' }] }
          ],
          journeyId: 'synthetic-journey',
          cardId: 'synthetic-card'
        }
        if (disconnect) res.once('close', () => release.resolve())
        void handler(request, res as NextApiResponse).then(
          handled.resolve,
          handled.reject
        )
      })
      await new Promise<void>((resolve) =>
        server.listen(0, '127.0.0.1', resolve)
      )
      let handlerFinished = false
      let lifecycleFinished = false
      void handled.promise.then(() => {
        handlerFinished = true
      })
      try {
        await new Promise<void>((resolve, reject) => {
          get(
            `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
            (res) => {
              res.once('data', () => {
                if (disconnect === 'request-error') {
                  activeRequest!.emit('error', new Error('aborted'))
                  release.resolve()
                } else if (disconnect) res.destroy()
                else release.resolve()
                resolve()
              })
            }
          ).on('error', reject)
        })
        expect(mocks.keepAlive).toHaveBeenCalledTimes(1)
        void mocks.keepAlive.mock.calls[0][0].then(() => {
          lifecycleFinished = true
        })
        await vi.waitFor(() => expect(mocks.end).toHaveBeenCalledTimes(1))
        expect(mocks.end).toHaveBeenCalledWith(
          expect.objectContaining({ level: disconnect ? 'WARNING' : 'DEFAULT' })
        )
        expect(providerSignal?.aborted ?? false).toBe(Boolean(disconnect))
        expect(handlerFinished).toBe(false)
        expect(lifecycleFinished).toBe(false)
        flushed.resolve()
        await handled.promise
        expect(lifecycleFinished).toBe(true)
        expect(mocks.flush).toHaveBeenCalledTimes(1)
        expect(mocks.end).toHaveBeenCalledTimes(1)
      } finally {
        release.resolve()
        flushed.resolve()
        server.closeAllConnections()
        await new Promise<void>((resolve) => server.close(() => resolve()))
      }
    }
  )
})
