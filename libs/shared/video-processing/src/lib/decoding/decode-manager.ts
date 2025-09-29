/**
 * Main thread API for WebCodecs video decoding
 * Provides high-level interface to DecodeWorker
 */

import type { DecodeSessionConfig, FrameMetadata, VideoMetadata } from './decode.worker'
import { globalProfiler } from '../profiler'

interface DecodeSession {
  id: string
  worker: Worker
  active: boolean
  onFrame?: (frame: VideoFrame, metadata: FrameMetadata) => void
  onEnd?: () => void
  onError?: (error: Error) => void
  onMetadata?: (metadata: VideoMetadata) => void
}

/**
 * Create a new decode session
 */
export function createDecodeSession(config: DecodeSessionConfig): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create worker
    const worker = new Worker(
      new URL('./decode.worker.ts', import.meta.url),
      { type: 'module' }
    )

    const session: DecodeSession = {
      id: '',
      worker,
      active: true,
      onFrame: config.onFrame,
      onEnd: config.onEnd,
      onError: config.onError,
      onMetadata: config.onMetadata
    }

    // Set up message handling
    worker.addEventListener('message', (event) => {
      const { type, sessionId, frame, metadata, error, decodeStats } = event.data

      switch (type) {
        case 'session_created':
          session.id = sessionId
          resolve(sessionId)
          break

        case 'frame':
          if (session.onFrame && frame) {
            session.onFrame(frame, metadata)
          }
          break

        case 'metadata':
          session.onMetadata?.(metadata)
          break

        case 'profiling':
          // Record decode performance in global profiler
          if (decodeStats) {
            globalProfiler.startMeasurement('decode_ms_per_frame', {
              avgDecodeTime: decodeStats.avgDecodeTime,
              totalFrames: decodeStats.totalFrames,
              decodeTimes: decodeStats.decodeTimes
            })
            globalProfiler.endMeasurement('decode_ms_per_frame')
          }
          break

        case 'end':
          session.onEnd?.()
          session.active = false
          break

        case 'error':
          const err = new Error(error || 'Decode worker error')
          session.onError?.(err)
          session.active = false
          reject(err)
          break
      }
    })

    worker.addEventListener('error', (error) => {
      const err = new Error(`Worker error: ${error.message}`)
      session.onError?.(err)
      session.active = false
      reject(err)
    })

    // Start session
    worker.postMessage({
      type: 'create_session',
      config: {
        src: config.src,
        startTime: config.startTime,
        endTime: config.endTime
      }
    })
  })
}

/**
 * End a decode session
 */
export function endDecodeSession(sessionId: string): void {
  // Find worker for session and send end message
  // This is a simplified implementation - in production we'd track sessions
  const worker = new Worker(new URL('./decode.worker.ts', import.meta.url), { type: 'module' })
  worker.postMessage({
    type: 'end_session',
    sessionId
  })
}

/**
 * Get decode statistics
 */
export function getDecodeStats(sessionId: string): Promise<{ queueSize: number }> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./decode.worker.ts', import.meta.url), { type: 'module' })

    worker.addEventListener('message', (event) => {
      if (event.data.type === 'stats') {
        resolve(event.data)
        worker.terminate()
      }
    })

    worker.postMessage({
      type: 'get_stats'
    })
  })
}

/**
 * Check if WebCodecs decoding is supported
 */
export function isWebCodecsSupported(): boolean {
  return typeof VideoDecoder !== 'undefined'
}

/**
 * Get supported video codecs
 */
export async function getSupportedCodecs(): Promise<string[]> {
  if (!isWebCodecsSupported()) return []

  const codecs = [
    'avc1.42001E', // H.264 Baseline
    'avc1.4D001E', // H.264 Main
    'avc1.640028', // H.264 High
    'av01.0.08M.08', // AV1
    'vp8',
    'vp09.00.10.08' // VP9
  ]

  const supported: string[] = []

  for (const codec of codecs) {
    try {
      const support = await VideoDecoder.isConfigSupported({ codec })
      if (support.supported) {
        supported.push(codec)
      }
    } catch {
      // Codec not supported
    }
  }

  return supported
}

/**
 * Create a frame stream from decode session for use with analysis functions
 */
export function createFrameStream(sessionId: string): AsyncIterable<{ frame: VideoFrame; metadata: import('../types/decoding').FrameMetadata }> {
  let frameQueue: Array<{ frame: VideoFrame; metadata: import('../types/decoding').FrameMetadata }> = []
  let resolveNext: ((value: IteratorResult<{ frame: VideoFrame; metadata: import('../types/decoding').FrameMetadata }>) => void) | null = null
  let finished = false

  // Create worker to listen for frames
  const worker = new Worker(new URL('./decode.worker.ts', import.meta.url), { type: 'module' })

  worker.addEventListener('message', (event) => {
    const { type, frame, metadata } = event.data

    if (type === 'frame' && frame && metadata) {
      frameQueue.push({ frame, metadata })

      // Resolve pending next() call
      if (resolveNext) {
        const nextFrame = frameQueue.shift()!
        resolveNext({ value: nextFrame, done: false })
        resolveNext = null
      }
    } else if (type === 'end') {
      finished = true
      if (resolveNext) {
        resolveNext({ value: undefined, done: true })
        resolveNext = null
      }
    }
  })

  return {
    [Symbol.asyncIterator]() {
      return {
        async next(): Promise<IteratorResult<{ frame: VideoFrame; metadata: import('../types/decoding').FrameMetadata }>> {
          // Return queued frame if available
          if (frameQueue.length > 0) {
            const frame = frameQueue.shift()!
            return { value: frame, done: false }
          }

          // Wait for next frame or end
          if (finished) {
            return { value: undefined, done: true }
          }

          return new Promise((resolve) => {
            resolveNext = resolve
          })
        }
      }
    }
  }
}
