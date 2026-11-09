import type { Context } from '@opentelemetry/api'
import type {
  ReadableSpan,
  Span,
  SpanProcessor
} from '@opentelemetry/sdk-trace-base'

// Keep below the OTLP exporter's default limit of 30 in-flight requests.
// Queuing outside Langfuse preserves its payload limits, headers and masking.
const MAX_CONCURRENT_DELIVERIES = 20

export class QueuedSpanProcessor implements SpanProcessor {
  private readonly queue: Array<() => Promise<void>> = []
  private readonly pending = new Set<Promise<void>>()
  private active = 0

  constructor(private readonly delegate: SpanProcessor) {}

  onStart(span: Span, context: Context): void {
    this.delegate.onStart(span, context)
  }

  onEnd(span: ReadableSpan): void {
    let complete!: () => void
    const delivery = new Promise<void>((resolve) => {
      complete = resolve
    })
    this.pending.add(delivery)
    this.queue.push(async () => {
      try {
        this.delegate.onEnd(span)
        await this.delegate.forceFlush()
      } catch {
        console.warn('[langfuse] trace export failed')
      } finally {
        this.pending.delete(delivery)
        complete()
      }
    })
    this.drain()
  }

  private drain(): void {
    while (this.active < MAX_CONCURRENT_DELIVERIES && this.queue.length > 0) {
      const deliver = this.queue.shift()!
      this.active++
      void deliver().finally(() => {
        this.active--
        this.drain()
      })
    }
  }

  async forceFlush(): Promise<void> {
    // Include spans waiting for a slot as well as HTTP exports already running.
    await Promise.all([...this.pending])
    await this.delegate.forceFlush()
  }

  async shutdown(): Promise<void> {
    await this.forceFlush()
    await this.delegate.shutdown()
  }
}
