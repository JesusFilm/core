/**
 * WebCodecs-based video decoder worker
 * Produces sequential VideoFrame stream for analysis pipeline
 */

/// <reference lib="webworker" />

// WebCodecs API types
declare global {
  interface VideoDecoder {
    decode(chunk: EncodedVideoChunk): void
    flush(): Promise<void>
    reset(): void
    close(): void
    readonly state: 'unconfigured' | 'configured' | 'closed'
    configure(config: VideoDecoderConfig): void
  }

  interface VideoDecoderConfig {
    codec: string
    codedWidth?: number
    codedHeight?: number
    description?: BufferSource
    hardwareAcceleration?: 'no-preference' | 'prefer-hardware' | 'prefer-software'
    optimizeForLatency?: boolean
  }

  interface EncodedVideoChunk {
    type: 'key' | 'delta'
    timestamp: number
    duration?: number
    data: BufferSource
  }

  interface VideoFrame {
    timestamp: number
    duration?: number
    codedWidth: number
    codedHeight: number
    displayWidth: number
    displayHeight: number
    close(): void
    clone(): VideoFrame
  }

  var VideoDecoder: {
    prototype: VideoDecoder
    new (init: VideoDecoderInit): VideoDecoder
    isConfigSupported(config: VideoDecoderConfig): Promise<VideoDecoderSupport>
  }

  interface VideoDecoderInit {
    output: (frame: VideoFrame) => void
    error: (error: Error) => void
  }

  interface VideoDecoderSupport {
    supported: boolean
    config: VideoDecoderConfig
  }

  interface EncodedVideoChunkInit {
    type: 'key' | 'delta'
    timestamp: number
    duration?: number
    data: BufferSource
  }

  var EncodedVideoChunk: {
    prototype: EncodedVideoChunk
    new (init: EncodedVideoChunkInit): EncodedVideoChunk
  }
}

interface DecodeSessionConfig {
  src: string | ArrayBuffer
  startTime?: number
  endTime?: number
  onFrame?: (frame: VideoFrame, metadata: FrameMetadata) => void
  onEnd?: () => void
  onError?: (error: Error) => void
  onMetadata?: (metadata: VideoMetadata) => void
}

interface FrameMetadata {
  timestamp: number
  duration?: number
  frameIndex: number
}

interface VideoMetadata {
  duration: number
  width: number
  height: number
  fps: number
  codec: string
}

interface DecodeSession {
  id: string
  config: DecodeSessionConfig
  decoder: VideoDecoder | null
  active: boolean
  frameCount: number
  startTime: number
  endTime?: number
  decodeTimes: number[] // Track decode times for profiling
  lastFrameTime: number // For estimating decode time
}

/**
 * Bounded queue for VideoFrame backpressure control
 */
class FrameQueue {
  private queue: VideoFrame[] = []
  private maxSize: number
  private onOverflow?: () => void

  constructor(maxSize = 120, onOverflow?: () => void) {
    this.maxSize = maxSize
    this.onOverflow = onOverflow
  }

  enqueue(frame: VideoFrame): boolean {
    if (this.queue.length >= this.maxSize) {
      this.onOverflow?.()
      return false
    }
    this.queue.push(frame)
    return true
  }

  dequeue(): VideoFrame | undefined {
    return this.queue.shift()
  }

  size(): number {
    return this.queue.length
  }

  clear(): void {
    this.queue.forEach(frame => frame.close())
    this.queue = []
  }

  isEmpty(): boolean {
    return this.queue.length === 0
  }

  isFull(): boolean {
    return this.queue.length >= this.maxSize
  }
}

/**
 * MP4 demuxer using native browser APIs (MediaSource + VideoDecoder)
 */
class MP4Demuxer {
  private mediaSource: MediaSource | null = null
  private videoDecoder: VideoDecoder | null = null
  private sourceBuffer: SourceBuffer | null = null
  private onChunk?: (chunk: EncodedVideoChunk) => void
  private onMetadata?: (metadata: VideoMetadata) => void

  async initialize(src: string | ArrayBuffer): Promise<void> {
    // For now, use fetch + MediaSource approach
    // TODO: Add mp4box.js fallback for unsupported codecs

    if (typeof src === 'string') {
      const response = await fetch(src)
      const arrayBuffer = await response.arrayBuffer()
      return this.demuxArrayBuffer(arrayBuffer)
    } else {
      return this.demuxArrayBuffer(src)
    }
  }

  private async demuxArrayBuffer(buffer: ArrayBuffer): Promise<void> {
    // Use MediaSource + VideoDecoder for MP4 demuxing
    this.mediaSource = new MediaSource()

    return new Promise((resolve, reject) => {
      if (!this.mediaSource) return reject(new Error('MediaSource not available'))

      this.mediaSource.addEventListener('sourceopen', async () => {
        try {
          // Create video element for demuxing
          const video = document.createElement('video')
          video.src = URL.createObjectURL(new Blob([buffer], { type: 'video/mp4' }))

          // Wait for metadata
          await new Promise<void>((resolveMetadata) => {
            video.addEventListener('loadedmetadata', () => {
              const metadata: VideoMetadata = {
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
                fps: 30, // TODO: Extract actual FPS from MP4
                codec: 'avc1.640028' // TODO: Extract actual codec
              }
              this.onMetadata?.(metadata)
              resolveMetadata()
            })
          })

          // Configure decoder
          this.videoDecoder = new VideoDecoder({
            output: (frame) => {
              // Convert frame to EncodedVideoChunk for uniform processing
              // Note: This is a simplified approach - in production we'd demux directly
              this.onChunk?.(this.frameToChunk(frame))
              frame.close()
            },
            error: (error) => reject(error)
          })

          // TODO: Configure with actual codec from MP4
          this.videoDecoder.configure({
            codec: 'avc1.640028',
            codedWidth: video.videoWidth,
            codedHeight: video.videoHeight,
            hardwareAcceleration: 'prefer-hardware'
          })

          resolve()
        } catch (error) {
          reject(error)
        }
      })

      this.mediaSource.addEventListener('sourceended', () => {
        // Demuxing complete
      })

      this.mediaSource.addEventListener('error', reject)
    })
  }

  private frameToChunk(frame: VideoFrame): EncodedVideoChunk {
    // This is a placeholder - in real implementation we'd demux the MP4 directly
    // For now, we'll need to use a different approach
    throw new Error('Direct MP4 demuxing not yet implemented')
  }

  setChunkCallback(callback: (chunk: EncodedVideoChunk) => void): void {
    this.onChunk = callback
  }

  setMetadataCallback(callback: (metadata: VideoMetadata) => void): void {
    this.onMetadata = callback
  }

  destroy(): void {
    if (this.videoDecoder) {
      this.videoDecoder.close()
      this.videoDecoder = null
    }
    if (this.mediaSource) {
      this.mediaSource.endOfStream()
      this.mediaSource = null
    }
  }
}

/**
 * Simplified MP4 parser for basic demuxing
 * This is a minimal implementation - production would use mp4box.js
 */
class SimpleMP4Demuxer {
  private onChunk?: (chunk: EncodedVideoChunk) => void
  private onMetadata?: (metadata: VideoMetadata) => void

  async demux(buffer: ArrayBuffer): Promise<void> {
    // Very basic MP4 parsing - extract width/height from moov box
    const view = new DataView(buffer)

    // Look for moov box and extract video track info
    let offset = 0
    while (offset < buffer.byteLength - 8) {
      const size = view.getUint32(offset, false)
      const type = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7)
      )

      if (type === 'moov') {
        // Parse moov box for video metadata
        this.parseMoovBox(new DataView(buffer, offset + 8, size - 8))
        break
      }

      offset += size
    }

    // For now, provide mock chunks - real implementation would parse NALUs
    // This is just to establish the API structure
    const metadata: VideoMetadata = {
      duration: 60, // Mock duration
      width: 1920,
      height: 1080,
      fps: 30,
      codec: 'avc1.640028'
    }

    this.onMetadata?.(metadata)

    // Mock frame generation for API testing
    let timestamp = 0
    const frameDuration = 1000000 / 30 // 30 fps in microseconds

    for (let i = 0; i < 30; i++) { // Just first second for testing
      const chunk = new EncodedVideoChunk({
        type: i === 0 ? 'key' : 'delta',
        timestamp: timestamp,
        duration: frameDuration,
        data: new Uint8Array([0, 0, 0, 1]) // Minimal NALU
      })

      this.onChunk?.(chunk)
      timestamp += frameDuration
    }
  }

  private parseMoovBox(view: DataView): void {
    // Basic moov parsing - in production this would be more comprehensive
    // For now, we'll use default values
  }

  setChunkCallback(callback: (chunk: EncodedVideoChunk) => void): void {
    this.onChunk = callback
  }

  setMetadataCallback(callback: (metadata: VideoMetadata) => void): void {
    this.onMetadata = callback
  }
}

/**
 * Main decode session manager
 */
class DecodeSessionManager {
  private sessions = new Map<string, DecodeSession>()
  private frameQueue = new FrameQueue(120, () => {
    console.warn('[DecodeWorker] Frame queue overflow - dropping frames')
  })

  createSession(config: DecodeSessionConfig): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const session: DecodeSession = {
      id: sessionId,
      config,
      decoder: null,
      active: true,
      frameCount: 0,
      startTime: config.startTime || 0,
      endTime: config.endTime,
      decodeTimes: [],
      lastFrameTime: 0
    }

    this.sessions.set(sessionId, session)
    this.startDecoding(session)

    return sessionId
  }

  private async startDecoding(session: DecodeSession): Promise<void> {
    try {
      // Configure VideoDecoder
      session.decoder = new VideoDecoder({
        output: (frame) => this.handleFrame(session, frame),
        error: (error) => this.handleError(session, error)
      })

      // Configure decoder (using H.264 for now)
      session.decoder.configure({
        codec: 'avc1.640028',
        hardwareAcceleration: 'prefer-hardware',
        optimizeForLatency: true
      })

      // Start demuxing
      const demuxer = new SimpleMP4Demuxer()
      demuxer.setMetadataCallback((metadata) => {
        session.config.onMetadata?.(metadata)
      })

      demuxer.setChunkCallback((chunk) => {
        if (session.decoder && session.active) {
          session.decoder.decode(chunk)
        }
      })

      // Load and demux the video
      if (typeof session.config.src === 'string') {
        const response = await fetch(session.config.src)
        const buffer = await response.arrayBuffer()
        await demuxer.demux(buffer)
      } else {
        await demuxer.demux(session.config.src)
      }

      // Flush decoder
      if (session.decoder) {
        await session.decoder.flush()
      }

      // Signal completion
      session.config.onEnd?.()

    } catch (error) {
      this.handleError(session, error as Error)
    }
  }

  private handleFrame(session: DecodeSession, frame: VideoFrame): void {
    if (!session.active) {
      frame.close()
      return
    }

    const now = performance.now()

    // Estimate decode time (time since last frame)
    if (session.lastFrameTime > 0) {
      const decodeTime = now - session.lastFrameTime
      session.decodeTimes.push(decodeTime)
    }
    session.lastFrameTime = now

    // Check time bounds
    const frameTime = frame.timestamp / 1000000 // Convert to seconds
    if (frameTime < session.startTime ||
        (session.endTime !== undefined && frameTime > session.endTime)) {
      frame.close()
      return
    }

    // Add to queue for backpressure control
    if (!this.frameQueue.enqueue(frame)) {
      // Queue full - drop frame
      frame.close()
      return
    }

    // Create frame metadata
    const metadata: FrameMetadata = {
      timestamp: frame.timestamp,
      duration: frame.duration,
      frameIndex: session.frameCount++
    }

    // Deliver frame (transferable)
    try {
      session.config.onFrame?.(frame, metadata)
    } catch (error) {
      console.error('[DecodeWorker] Error delivering frame:', error)
      frame.close()
    }
  }

  private handleError(session: DecodeSession, error: Error): void {
    console.error('[DecodeWorker] Decode error:', error)
    session.config.onError?.(error)
    this.endSession(session.id)
  }

  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    session.active = false

    if (session.decoder) {
      session.decoder.close()
      session.decoder = null
    }

    // Send profiling data
    if (session.decodeTimes.length > 0) {
      const avgDecodeTime = session.decodeTimes.reduce((sum, time) => sum + time, 0) / session.decodeTimes.length
      self.postMessage({
        type: 'profiling',
        sessionId,
        decodeStats: {
          avgDecodeTime,
          totalFrames: session.frameCount,
          decodeTimes: session.decodeTimes.slice(0, 100) // Limit for performance
        }
      })
    }

    // Clear any queued frames for this session
    this.frameQueue.clear()

    this.sessions.delete(sessionId)
  }

  getQueueSize(): number {
    return this.frameQueue.size()
  }
}

// Global session manager
const sessionManager = new DecodeSessionManager()

// Worker message handling
self.addEventListener('message', async (event) => {
  const { type, sessionId, config } = event.data

  switch (type) {
    case 'create_session':
      try {
        const newSessionId = sessionManager.createSession({
          ...config,
          onFrame: (frame, metadata) => {
            // Transfer frame ownership to main thread
            self.postMessage({
              type: 'frame',
              sessionId: newSessionId,
              frame,
              metadata
            }, [frame]) // Transfer frame
          },
          onEnd: () => {
            self.postMessage({
              type: 'end',
              sessionId: newSessionId
            })
          },
          onError: (error) => {
            self.postMessage({
              type: 'error',
              sessionId: newSessionId,
              error: error.message
            })
          },
          onMetadata: (metadata) => {
            self.postMessage({
              type: 'metadata',
              sessionId: newSessionId,
              metadata
            })
          }
        })

        self.postMessage({
          type: 'session_created',
          sessionId: newSessionId
        })
      } catch (error) {
        self.postMessage({
          type: 'error',
          error: (error as Error).message
        })
      }
      break

    case 'end_session':
      sessionManager.endSession(sessionId)
      self.postMessage({
        type: 'session_ended',
        sessionId
      })
      break

    case 'get_stats':
      self.postMessage({
        type: 'stats',
        queueSize: sessionManager.getQueueSize()
      })
      break
  }
})

// Export types for main thread
export type { DecodeSessionConfig, FrameMetadata, VideoMetadata }
