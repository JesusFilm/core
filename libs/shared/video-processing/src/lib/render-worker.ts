/**
 * Web worker for background video rendering
 * Handles frame processing and encoding without blocking the UI thread
 */

import type { RenderPassInput, RenderPassResult } from './render-pass'
import type { RenderingProgress, RenderingResult } from '../types/crop-path'
import type { VirtualCameraPath, VirtualCameraKeyframe } from '../types/virtual-camera'

// Worker message types
export interface RenderWorkerMessage {
  type: 'start' | 'progress' | 'complete' | 'error' | 'cancel'
  data?: any
}

export interface RenderWorkerStartMessage extends RenderWorkerMessage {
  type: 'start'
  data: RenderPassInput
}

export interface RenderWorkerProgressMessage extends RenderWorkerMessage {
  type: 'progress'
  data: RenderingProgress
}

export interface RenderWorkerCompleteMessage extends RenderWorkerMessage {
  type: 'complete'
  data: RenderPassResult
}

export interface RenderWorkerErrorMessage extends RenderWorkerMessage {
  type: 'error'
  data: { error: string }
}

export interface RenderWorkerCancelMessage extends RenderWorkerMessage {
  type: 'cancel'
}

/**
 * Web Worker implementation for video rendering
 */
export class RenderWorker {
  private worker: Worker | null = null
  private isRendering = false

  constructor() {
    this.initializeWorker()
  }

  /**
   * Initialize the web worker
   */
  private initializeWorker(): void {
    const workerScript = `
      // Worker script content will be injected here
      self.onmessage = function(e) {
        const message = e.data;

        if (message.type === 'start') {
          handleRenderStart(message.data);
        } else if (message.type === 'cancel') {
          handleRenderCancel();
        }
      };

      let isCancelled = false;

      function handleRenderStart(input) {
        isCancelled = false;

        try {
          // Import required modules
          importScripts('/libs/shared/video-processing/dist/render-pass.js');

          // Run render pass
          const result = runRenderPass(input, (progress) => {
            if (isCancelled) return;

            self.postMessage({
              type: 'progress',
              data: progress
            });
          });

          if (!isCancelled) {
            self.postMessage({
              type: 'complete',
              data: { progress: { stage: 'complete', progress: 100 }, result }
            });
          }
        } catch (error) {
          self.postMessage({
            type: 'error',
            data: { error: error.message || 'Unknown render error' }
          });
        }
      }

      function handleRenderCancel() {
        isCancelled = true;
      }
    `

    // Create blob URL for worker script
    const blob = new Blob([workerScript], { type: 'application/javascript' })
    const workerUrl = URL.createObjectURL(blob)

    this.worker = new Worker(workerUrl)
  }

  /**
   * Start rendering process
   */
  async startRendering(
    input: RenderPassInput,
    onProgress?: (progress: RenderingProgress) => void,
    onComplete?: (result: RenderPassResult) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (this.isRendering) {
      throw new Error('Render worker is already busy')
    }

    this.isRendering = true

    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'))
        return
      }

      // Set up message handler
      const messageHandler = (e: MessageEvent<RenderWorkerMessage>) => {
        const message = e.data

        switch (message.type) {
          case 'progress':
            onProgress?.(message.data as RenderingProgress)
            break

          case 'complete':
            this.isRendering = false
            this.worker?.removeEventListener('message', messageHandler)
            onComplete?.(message.data as RenderPassResult)
            resolve()
            break

          case 'error':
            this.isRendering = false
            this.worker?.removeEventListener('message', messageHandler)
            const error = (message.data as RenderWorkerErrorMessage['data']).error
            onError?.(error)
            reject(new Error(error))
            break
        }
      }

      this.worker.addEventListener('message', messageHandler)

      // Start rendering
      this.worker.postMessage({
        type: 'start',
        data: input
      } as RenderWorkerStartMessage)
    })
  }

  /**
   * Cancel current rendering operation
   */
  cancelRendering(): void {
    if (this.worker && this.isRendering) {
      this.worker.postMessage({ type: 'cancel' } as RenderWorkerCancelMessage)
      this.isRendering = false
    }
  }

  /**
   * Check if worker is currently rendering
   */
  isBusy(): boolean {
    return this.isRendering
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
      this.isRendering = false
    }
  }
}

/**
 * Worker pool for managing multiple render operations
 */
export class RenderWorkerPool {
  private workers: RenderWorker[] = []
  private maxWorkers: number

  constructor(maxWorkers: number = navigator.hardwareConcurrency || 4) {
    this.maxWorkers = Math.min(maxWorkers, navigator.hardwareConcurrency || 4)
  }

  /**
   * Get an available worker from the pool
   */
  private getAvailableWorker(): RenderWorker | null {
    // Find existing idle worker
    const idleWorker = this.workers.find(worker => !worker.isBusy())
    if (idleWorker) return idleWorker

    // Create new worker if under limit
    if (this.workers.length < this.maxWorkers) {
      const newWorker = new RenderWorker()
      this.workers.push(newWorker)
      return newWorker
    }

    return null
  }

  /**
   * Start rendering with worker pool
   */
  async startRendering(
    input: RenderPassInput,
    onProgress?: (progress: RenderingProgress) => void,
    onComplete?: (result: RenderPassResult) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    const worker = this.getAvailableWorker()

    if (!worker) {
      throw new Error(`No available workers (max: ${this.maxWorkers})`)
    }

    return worker.startRendering(input, onProgress, onComplete, onError)
  }

  /**
   * Cancel all rendering operations
   */
  cancelAll(): void {
    this.workers.forEach(worker => worker.cancelRendering())
  }

  /**
   * Terminate all workers
   */
  terminateAll(): void {
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
  }

  /**
   * Get pool status
   */
  getStatus(): { activeWorkers: number; totalWorkers: number; maxWorkers: number } {
    return {
      activeWorkers: this.workers.filter(w => w.isBusy()).length,
      totalWorkers: this.workers.length,
      maxWorkers: this.maxWorkers
    }
  }
}

/**
 * Streaming renderer for large videos
 * Processes frames in batches to avoid memory issues
 */
export class StreamingVideoRenderer {
  private workerPool: RenderWorkerPool
  private batchSize: number
  private memoryLimit: number

  constructor(options: {
    maxWorkers?: number
    batchSize?: number
    memoryLimit?: number
  } = {}) {
    this.workerPool = new RenderWorkerPool(options.maxWorkers)
    this.batchSize = options.batchSize || 30 // 1 second at 30fps
    this.memoryLimit = options.memoryLimit || 500 * 1024 * 1024 // 500MB
  }

  /**
   * Render video in streaming batches
   */
  async renderStreaming(
    input: RenderPassInput,
    onProgress?: (progress: RenderingProgress) => void,
    onBatchComplete?: (batchIndex: number, batchResult: RenderPassResult) => void
  ): Promise<RenderingResult> {
    const { cropPath, metadata } = input

    // Convert to VirtualCameraPath if needed
    const virtualPath = isVirtualCameraPath(cropPath)
      ? cropPath
      : PathSerializer.deserializeCropPath(cropPath)

    // Calculate batches
    const totalFrames = virtualPath.keyframes.length
    const batches: VirtualCameraPath[] = []

    for (let i = 0; i < totalFrames; i += this.batchSize) {
      const batchKeyframes = virtualPath.keyframes.slice(i, i + this.batchSize)

      // Create batch path
      const batchPath: VirtualCameraPath = {
        ...virtualPath,
        keyframes: batchKeyframes,
        metadata: {
          ...virtualPath.metadata,
          duration: batchKeyframes.length / metadata.fps
        }
      }

      batches.push(batchPath)
    }

    const batchResults: RenderingResult[] = []

    // Process batches
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batchPath = batches[batchIndex]

      // Create batch input
      const batchInput: RenderPassInput = {
        ...input,
        cropPath: batchPath
      }

      // Monitor memory usage
      if (this.shouldThrottleMemory()) {
        await this.waitForMemory()
      }

      // Render batch
      const batchResult = await new Promise<RenderPassResult>((resolve, reject) => {
        this.workerPool.startRendering(
          batchInput,
          (progress) => {
            // Adjust progress for batch
            const batchProgress = batchIndex / batches.length
            const frameProgress = progress.currentFrame || 0
            const adjustedProgress = batchProgress + (frameProgress / totalFrames)

            onProgress?.({
              ...progress,
              progress: adjustedProgress * 100
            })
          },
          (result) => {
            if (result.result) {
              resolve(result)
            } else if (result.error) {
              reject(new Error(result.error))
            } else {
              reject(new Error('Unknown rendering error'))
            }
          },
          reject
        )
      })

      const finalResult = batchResult.result!
      batchResults.push(finalResult)
      onBatchComplete?.(batchIndex, batchResult)
    }

    // Combine batch results
    return this.combineBatchResults(batchResults)
  }

  /**
   * Check if memory usage is too high
   */
  private shouldThrottleMemory(): boolean {
    const memInfo = (performance as any).memory
    if (!memInfo) return false

    return memInfo.usedJSHeapSize > this.memoryLimit
  }

  /**
   * Wait for memory to free up
   */
  private async waitForMemory(): Promise<void> {
    return new Promise(resolve => {
      const checkMemory = () => {
        if (!this.shouldThrottleMemory()) {
          resolve()
        } else {
          setTimeout(checkMemory, 100)
        }
      }
      checkMemory()
    })
  }

  /**
   * Combine multiple batch results into final output
   */
  private combineBatchResults(batchResults: RenderingResult[]): RenderingResult {
    if (batchResults.length === 0) {
      throw new Error('No batch results to combine')
    }

    if (batchResults.length === 1) {
      return batchResults[0]
    }

    // For now, return the first result with combined stats
    // In a real implementation, this would concatenate video segments
    const firstResult = batchResults[0]
    const totalTime = batchResults.reduce((sum, r) => sum + r.stats.totalTime, 0)
    const avgFps = batchResults.reduce((sum, r) => sum + r.stats.avgEncodingFps, 0) / batchResults.length
    const peakMemory = Math.max(...batchResults.map(r => r.stats.peakMemoryUsage))

    return {
      ...firstResult,
      stats: {
        ...firstResult.stats,
        totalTime,
        avgEncodingFps: avgFps,
        peakMemoryUsage: peakMemory
      },
      warnings: [
        ...firstResult.warnings,
        'Video was rendered in streaming batches - concatenation may be needed for final output'
      ]
    }
  }

  /**
   * Cancel streaming render
   */
  cancel(): void {
    this.workerPool.cancelAll()
  }

  /**
   * Get pool status
   */
  getStatus() {
    return this.workerPool.getStatus()
  }
}

// Import needed for worker
import { runRenderPass } from './render-pass'
import { PathSerializer } from './virtual-camera'

// Type guard for VirtualCameraPath
function isVirtualCameraPath(path: any): path is VirtualCameraPath {
  return 'keyframes' in path && 'metadata' in path
}
