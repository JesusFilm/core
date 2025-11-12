// Polyfill for requestVideoFrameCallback
// This API is used by video.js for subtitle synchronization but is not supported in all browsers

declare global {
  interface VideoFrameCallbackMetadata {
    mediaTime: number
    presentedFrames: number
    expectedDisplayTime: number
    width: number
    height: number
    presentationTime: number
    expectedPresentationTime: number
    refreshRate?: number
  }

  interface HTMLVideoElement {
    requestVideoFrameCallback(
      callback: (
        now: DOMHighResTimeStamp,
        metadata: VideoFrameCallbackMetadata
      ) => void
    ): number
    cancelVideoFrameCallback(handle: number): void
  }
}

// Polyfill implementation
if (
  typeof HTMLVideoElement !== 'undefined' &&
  !HTMLVideoElement.prototype.requestVideoFrameCallback
) {
  const videoFrameCallbacks = new Map<
    number,
    {
      callback: (
        now: DOMHighResTimeStamp,
        metadata: VideoFrameCallbackMetadata
      ) => void
      video: HTMLVideoElement
    }
  >()
  let nextCallbackId = 1

  HTMLVideoElement.prototype.requestVideoFrameCallback = function (
    callback: (
      now: DOMHighResTimeStamp,
      metadata: VideoFrameCallbackMetadata
    ) => void
  ): number {
    // Guard against null/undefined this (e.g., when Video.js calls on disposed elements)
    if (!this || !this.tagName || this.tagName !== 'VIDEO') {
      console.warn('requestVideoFrameCallback called on invalid element:', this)
      return 0 // Return invalid handle
    }

    const callbackId = nextCallbackId++
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const video = this

    const rafCallback = (timestamp: DOMHighResTimeStamp) => {
      if (!videoFrameCallbacks.has(callbackId)) return

      // Additional safety check - ensure video element still exists
      if (!video || !video.parentNode) {
        videoFrameCallbacks.delete(callbackId)
        return
      }

      // Create metadata object that mimics the VideoFrameCallbackMetadata
      const metadata: VideoFrameCallbackMetadata = {
        mediaTime: video.currentTime || 0,
        presentedFrames: 0, // Not available in fallback
        expectedDisplayTime: timestamp + 16.67, // Assume 60fps
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
        presentationTime: timestamp,
        expectedPresentationTime: timestamp,
        refreshRate: 60 // Assume 60fps
      }

      try {
        callback(timestamp, metadata)
      } catch (error) {
        console.warn('Error in requestVideoFrameCallback:', error)
      }

      // Schedule next frame
      requestAnimationFrame(rafCallback)
    }

    videoFrameCallbacks.set(callbackId, { callback, video })
    requestAnimationFrame(rafCallback)

    return callbackId
  }

  HTMLVideoElement.prototype.cancelVideoFrameCallback = function (
    handle: number
  ): void {
    // Guard against null/undefined this
    if (!this || !this.tagName || this.tagName !== 'VIDEO') {
      return
    }
    videoFrameCallbacks.delete(handle)
  }
}
