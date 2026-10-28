// @vitest-environment node
import { createServer, get } from 'node:http'
import type { AddressInfo } from 'node:net'

import { MockLanguageModelV4 } from 'ai/test'
import type { NextApiRequest, NextApiResponse } from 'next'

import handler from './index'

const mocks = vi.hoisted(() => ({
  model: vi.fn(),
  end: vi.fn(),
  flush: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@ai-sdk/google', () => ({ google: mocks.model }))
vi.mock('../../../src/libs/getFlags', () => ({
  getFlags: async () => ({ apologistChat: true })
}))
vi.mock('../../../src/libs/getCardChatEnabled', () => ({
  getCardChatEnabled: async () => true
}))
vi.mock('../../../src/libs/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}))
vi.mock('../../../src/libs/langfuse/client', () => ({
  APOLOGIST_PROMPT_NAME: 'synthetic-prompt',
  getActivePromptLabel: () => 'development',
  getLangfuse: () => ({
    prompt: { get: async () => ({ type: 'text', compile: () => 'synthetic' }) }
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
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it.each([true, false])(
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
          doStream: async ({ abortSignal }) => {
            providerSignal = abortSignal
            return {
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
            }
          }
        })
      )
      const server = createServer((req, res) => {
        const request = req as NextApiRequest
        request.method = 'POST'
        request.body = {
          messages: [{ role: 'user', parts: [{ type: 'text', text: 'synthetic' }] }],
          journeyId: 'synthetic-journey',
          cardId: 'synthetic-card'
        }
        if (disconnect) res.once('close', () => release.resolve())
        void handler(request, res as NextApiResponse).then(
          handled.resolve,
          handled.reject
        )
      })
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
      let handlerFinished = false
      void handled.promise.then(() => {
        handlerFinished = true
      })
      try {
        await new Promise<void>((resolve, reject) => {
          get(`http://127.0.0.1:${(server.address() as AddressInfo).port}`, (res) => {
            res.once('data', () => {
              if (disconnect) res.destroy()
              else release.resolve()
              resolve()
            })
          }).on('error', reject)
        })
        await vi.waitFor(() => expect(mocks.end).toHaveBeenCalledTimes(1))
        expect(mocks.end).toHaveBeenCalledWith(
          expect.objectContaining({ level: disconnect ? 'WARNING' : 'DEFAULT' })
        )
        expect(providerSignal?.aborted ?? false).toBe(disconnect)
        expect(handlerFinished).toBe(false)
        flushed.resolve()
        await handled.promise
        expect(mocks.flush).toHaveBeenCalled()
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
