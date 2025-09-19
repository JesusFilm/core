import type { DetectionResult, DetectionWorkerMessage } from '../types'

export interface DetectionCallbacks {
  onChunk?: (result: DetectionResult) => void
  onComplete?: (results: DetectionResult[]) => void
  onError?: (error: string) => void
}

export class DetectionWorkerController {
  private worker?: Worker
  private results: DetectionResult[] = []

  start(duration: number, callbacks: DetectionCallbacks) {
    if (typeof window === 'undefined') {
      return
    }

    this.stop()
    this.results = []

    this.worker = new Worker(new URL('../workers/detection.worker.ts', import.meta.url), {
      type: 'module'
    })

    this.worker.onmessage = (event: MessageEvent<DetectionWorkerMessage>) => {
      const message = event.data

      if (message.type === 'chunk') {
        this.results.push(message.result)
        callbacks.onChunk?.(message.result)
        return
      }

      if (message.type === 'complete') {
        this.results = message.results
        callbacks.onComplete?.(message.results)
        return
      }

      if (message.type === 'error') {
        callbacks.onError?.(message.error)
      }
    }

    this.worker.onerror = (event) => {
      callbacks.onError?.(event.message)
    }

    this.worker.postMessage({
      type: 'start',
      payload: {
        duration
      }
    })
  }

  stop() {
    if (this.worker) {
      this.worker.postMessage({ type: 'terminate' })
      this.worker.terminate()
      this.worker = undefined
    }
    this.results = []
  }

  dispose() {
    this.stop()
  }
}

export function runDetection(
  duration: number,
  callbacks: DetectionCallbacks
): () => void {
  const controller = new DetectionWorkerController()
  controller.start(duration, callbacks)
  return () => controller.dispose()
}
