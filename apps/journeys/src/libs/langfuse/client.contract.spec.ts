// @vitest-environment node
import { type IncomingHttpHeaders, createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

import { LangfuseClient } from '@langfuse/client'
import { trace } from '@opentelemetry/api'

import { flushLangfuse, getLangfuse, startChatGeneration } from './client'

interface WireSpan {
  name: string
  traceId: string
  spanId: string
  parentSpanId?: string
  startTimeUnixNano: string
  endTimeUnixNano: string
  attributes: Array<{
    key: string
    value: { stringValue?: string; intValue?: string | number }
  }>
}
interface WireBatch {
  resourceSpans: Array<{ scopeSpans: Array<{ spans: WireSpan[] }> }>
}

describe('Langfuse v4 wire contract', () => {
  it('exports complete isolated v4 observations, reads prompts and tolerates rejected delivery over real HTTP', async () => {
    const requests: Array<{
      url: string
      method?: string
      headers: IncomingHttpHeaders
      body: string
    }> = []
    let exportStatus = 200
    let exportAcknowledgement: Promise<void> | undefined
    const server = createServer(async (req, res) => {
      const chunks: Buffer[] = []
      for await (const chunk of req) chunks.push(Buffer.from(chunk))
      requests.push({
        url: req.url ?? '',
        method: req.method,
        headers: req.headers,
        body: Buffer.concat(chunks).toString()
      })
      res.setHeader('Content-Type', 'application/json')
      if (req.url?.startsWith('/api/public/v2/prompts/')) {
        res.end(
          JSON.stringify({
            name: 'apologist-world-cup-chat',
            version: 7,
            type: 'text',
            prompt: 'Use {{translation}} in {{language}}',
            config: {},
            labels: ['development'],
            tags: []
          })
        )
        return
      }
      if (exportAcknowledgement != null) {
        const batch: WireBatch = JSON.parse(Buffer.concat(chunks).toString())
        const hasRoot = batch.resourceSpans.some(({ scopeSpans }) =>
          scopeSpans.some(({ spans }) =>
            spans.some(({ name }) => name === 'apologist-chat')
          )
        )
        if (hasRoot) await exportAcknowledgement
      }
      res.statusCode = exportStatus
      res.end('{}')
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    vi.stubEnv('LANGFUSE_PUBLIC_KEY', 'pk-offline')
    vi.stubEnv('LANGFUSE_SECRET_KEY', 'sk-offline')
    vi.stubEnv('LANGFUSE_BASE_URL', baseUrl)
    vi.stubEnv('LANGFUSE_TRACING_ENVIRONMENT', 'offline-contract')
    vi.stubEnv('LANGFUSE_RELEASE', 'offline-release')
    vi.stubEnv('LANGFUSE_OTEL_COMPRESSION', 'none')
    vi.stubEnv('LANGFUSE_FLUSH_AT', '1')
    try {
      const globalProvider = trace.getTracerProvider()
      const client = getLangfuse()
      expect(client).toBeInstanceOf(LangfuseClient)
      expect(trace.getTracerProvider()).toBe(globalProvider)
      const prompt = await client!.prompt.get('apologist-world-cup-chat', {
        label: 'development'
      })
      expect(prompt.compile({ translation: 'ESV', language: 'Spanish' })).toBe(
        'Use ESV in Spanish'
      )
      const input = [{ role: 'user', content: 'synthetic question' }]
      const metadata = {
        journeyId: 'journey-offline',
        language: 'Spanish',
        ipCountry: 'NZ',
        provider: 'offline',
        modelId: 'offline-model'
      }
      const operation = startChatGeneration({
        sessionId: 'session-offline',
        metadata,
        model: 'offline-model',
        input,
        prompt
      })!
      await flushLangfuse()
      expect(requests.filter(({ method }) => method === 'POST')).toHaveLength(0)
      operation.end({
        output: 'synthetic answer',
        usageDetails: { input: 4, output: 2 },
        level: 'DEFAULT'
      })
      operation.end({ output: 'must not overwrite', level: 'ERROR' })
      await flushLangfuse()
      await flushLangfuse()
      await vi.waitFor(() =>
        expect(requests.filter(({ method }) => method === 'POST')).toHaveLength(
          2
        )
      )
      const exports = requests.filter(({ method }) => method === 'POST')
      expect(exports).toHaveLength(2)
      for (const request of exports)
        expect(request).toMatchObject({
          url: '/api/public/otel/v1/traces',
          headers: {
            authorization: `Basic ${Buffer.from('pk-offline:sk-offline').toString('base64')}`,
            'x-langfuse-ingestion-version': '4',
            'x-langfuse-sdk-name': 'javascript'
          }
        })
      expect(exports[0].headers['x-langfuse-sdk-version']).toMatch(/^5\./)
      const spans = exports.flatMap(({ body }) => {
        const batch: WireBatch = JSON.parse(body)
        return batch.resourceSpans.flatMap(({ scopeSpans }) =>
          scopeSpans.flatMap(({ spans }) => spans)
        )
      })
      expect(spans).toHaveLength(2)
      const root = spans.find(({ name }) => name === 'apologist-chat')!
      const generation = spans.find(
        ({ name }) => name === 'apologist-generation'
      )!
      expect(root.traceId).toMatch(/^[a-f0-9]{32}$/)
      expect(generation.traceId).toBe(root.traceId)
      expect(generation.parentSpanId).toBe(root.spanId)
      expect(root.parentSpanId ?? '').toBe('')
      for (const span of spans) {
        expect(BigInt(span.endTimeUnixNano)).toBeGreaterThanOrEqual(
          BigInt(span.startTimeUnixNano)
        )
        const attributes = Object.fromEntries(
          span.attributes.map(({ key, value }) => [key, value.stringValue])
        )
        expect(attributes).toMatchObject({
          'session.id': 'session-offline',
          'langfuse.trace.name': 'apologist-chat',
          'langfuse.environment': 'offline-contract',
          'langfuse.release': 'offline-release',
          'langfuse.observation.input': JSON.stringify(input),
          'langfuse.observation.output': 'synthetic answer'
        })
        for (const [key, value] of Object.entries(metadata)) {
          expect(attributes[`langfuse.observation.metadata.${key}`]).toBe(value)
        }
        expect(attributes).not.toHaveProperty('langfuse.trace.input')
        expect(attributes).not.toHaveProperty('langfuse.trace.output')
      }
      const attributes = Object.fromEntries(
        generation.attributes.map(({ key, value }) => [key, value.stringValue])
      )
      expect(attributes).toMatchObject({
        'langfuse.observation.type': 'generation',
        'langfuse.observation.model.name': 'offline-model',
        'langfuse.observation.prompt.name': 'apologist-world-cup-chat',
        'langfuse.observation.usage_details': JSON.stringify({
          input: 4,
          output: 2
        })
      })
      const promptVersion = generation.attributes.find(
        ({ key }) => key === 'langfuse.observation.prompt.version'
      )?.value
      expect(
        Number(promptVersion?.intValue ?? promptVersion?.stringValue)
      ).toBe(7)
      expect(requests[0].url).toContain(
        '/api/public/v2/prompts/apologist-world-cup-chat?'
      )
      expect(new URL(requests[0].url, baseUrl).searchParams.get('label')).toBe(
        'development'
      )
      expect(requests.every(({ url }) => !url.includes('/ingestion'))).toBe(
        true
      )

      // Two overlapping requests must not share ambient/global trace context.
      // Finishing B first must not prematurely export A's still-active spans.
      requests.length = 0
      const first = startChatGeneration({
        sessionId: 'overlap-a',
        metadata: { journeyId: 'journey-a' },
        input: 'input-a'
      })!
      const second = startChatGeneration({
        sessionId: 'overlap-b',
        metadata: { journeyId: 'journey-b' },
        input: 'input-b'
      })!
      second.end({ output: 'answer-b' })
      await flushLangfuse()
      const exportedSpans = (): WireSpan[] =>
        requests.flatMap(({ body }) => {
          const payload: WireBatch = JSON.parse(body)
          return payload.resourceSpans.flatMap(({ scopeSpans }) =>
            scopeSpans.flatMap(({ spans }) => spans)
          )
        })
      expect(exportedSpans()).toHaveLength(2)
      expect(JSON.stringify(exportedSpans())).not.toContain('overlap-a')
      first.end({ output: 'answer-a' })
      await flushLangfuse()
      const overlapping = exportedSpans()
      expect(overlapping).toHaveLength(4)
      expect(new Set(overlapping.map(({ traceId }) => traceId)).size).toBe(2)
      for (const suffix of ['a', 'b']) {
        const matching = overlapping.filter((span) =>
          span.attributes.some(
            ({ key, value }) =>
              key === 'session.id' && value.stringValue === `overlap-${suffix}`
          )
        )
        expect(matching).toHaveLength(2)
        const root = matching.find(({ name }) => name === 'apologist-chat')!
        const child = matching.find(
          ({ name }) => name === 'apologist-generation'
        )!
        expect(child.traceId).toBe(root.traceId)
        expect(child.parentSpanId).toBe(root.spanId)
        for (const span of matching) {
          const values = Object.fromEntries(
            span.attributes.map(({ key, value }) => [key, value.stringValue])
          )
          expect(values).toMatchObject({
            'langfuse.observation.input': `input-${suffix}`,
            'langfuse.observation.output': `answer-${suffix}`,
            'langfuse.observation.metadata.journeyId': `journey-${suffix}`
          })
        }
      }

      // Exports may start on end() before forceFlush(). A queue that has
      // already drained must not let the serverless handler return before
      // those HTTP deliveries finish (including LANGFUSE_FLUSH_AT=1).
      requests.length = 0
      let acknowledge!: () => void
      exportAcknowledgement = new Promise<void>((resolve) => {
        acknowledge = resolve
      })
      const pending = startChatGeneration({
        metadata: { journeyId: 'synthetic-held-acknowledgement' },
        input: 'synthetic question'
      })!
      pending.end({ output: 'synthetic answer' })
      try {
        await vi.waitFor(() => expect(requests).toHaveLength(2))
        let flushed = false
        const flushing = flushLangfuse().then(() => {
          flushed = true
        })
        await new Promise<void>((resolve) => setTimeout(resolve, 25))
        expect(flushed).toBe(false)
        acknowledge()
        await flushing
        expect(flushed).toBe(true)
      } finally {
        acknowledge()
        exportAcknowledgement = undefined
      }

      // A real non-retryable collector rejection must not reject the chat's
      // final flush or accidentally export an operation twice on retry.
      requests.length = 0
      exportStatus = 400
      const rejected = startChatGeneration({
        metadata: { journeyId: 'synthetic-rejection' },
        input: 'synthetic question'
      })!
      rejected.end({ output: 'answer survives telemetry outage' })
      await expect(flushLangfuse()).resolves.toBeUndefined()
      expect(requests).toHaveLength(2)
      await expect(flushLangfuse()).resolves.toBeUndefined()
      expect(requests).toHaveLength(2)
    } finally {
      vi.unstubAllEnvs()
      server.closeAllConnections()
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      )
    }
  })
})
