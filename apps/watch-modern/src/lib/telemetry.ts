/**
 * Telemetry utilities for watch-modern application
 * Mirrors legacy GTM event patterns for video carousel interactions
 */

declare global {
  interface Window {
    dataLayer: any[]
  }
}

/**
 * Base telemetry event interface
 */
export interface TelemetryEvent {
  event: string
  [key: string]: any
}

/**
 * Video carousel telemetry event types
 */
export type CarouselEventType =
  | 'carousel_video_play'
  | 'carousel_video_pause'
  | 'carousel_video_mute'
  | 'carousel_video_unmute'
  | 'carousel_video_advance'
  | 'carousel_video_error'

/**
 * Video carousel event payload
 */
export interface CarouselVideoEvent extends TelemetryEvent {
  event: CarouselEventType
  video_id: string
  video_title: string
  video_slug: string
  slide_index: number
  total_slides: number
  video_duration?: number // in seconds
  current_time?: number // in seconds
  mute_state?: boolean
  autoplay?: boolean
}

/**
 * Sends a telemetry event to GTM dataLayer
 * @param event - The telemetry event to send
 */
export function sendTelemetryEvent(event: TelemetryEvent): void {
  if (typeof window === 'undefined') {
    // Server-side: log for debugging but don't send to GTM
    console.log('[Telemetry]', event)
    return
  }

  // Ensure dataLayer exists
  if (!window.dataLayer) {
    window.dataLayer = []
  }

  // Send event to GTM
  window.dataLayer.push(event)

  // Also log for development/debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[GTM Event]', event)
  }
}

/**
 * Creates a carousel video event payload
 * @param type - Event type
 * @param video - Video data
 * @param slideIndex - Current slide index (0-based)
 * @param totalSlides - Total number of slides
 * @param additionalData - Additional event data
 * @returns Carousel video event
 */
export function createCarouselVideoEvent(
  type: CarouselEventType,
  video: {
    id: string
    title: string
    slug: string
  },
  slideIndex: number,
  totalSlides: number,
  additionalData: Partial<CarouselVideoEvent> = {}
): CarouselVideoEvent {
  return {
    event: type,
    video_id: video.id,
    video_title: video.title,
    video_slug: video.slug,
    slide_index: slideIndex,
    total_slides: totalSlides,
    autoplay: true, // Carousel videos are autoplay by design
    ...additionalData
  }
}

/**
 * Specific event creators for carousel interactions
 */
export const carouselTelemetry = {
  /**
   * Track when a carousel video starts playing
   */
  videoPlay: (
    video: { id: string; title: string; slug: string },
    slideIndex: number,
    totalSlides: number,
    isMuted: boolean
  ): void => {
    const event = createCarouselVideoEvent(
      'carousel_video_play',
      video,
      slideIndex,
      totalSlides,
      { mute_state: isMuted }
    )
    sendTelemetryEvent(event)
  },

  /**
   * Track when a carousel video is paused
   */
  videoPause: (
    video: { id: string; title: string; slug: string },
    slideIndex: number,
    totalSlides: number,
    currentTime: number
  ): void => {
    const event = createCarouselVideoEvent(
      'carousel_video_pause',
      video,
      slideIndex,
      totalSlides,
      { current_time: currentTime }
    )
    sendTelemetryEvent(event)
  },

  /**
   * Track when a carousel video is muted
   */
  videoMute: (
    video: { id: string; title: string; slug: string },
    slideIndex: number,
    totalSlides: number
  ): void => {
    const event = createCarouselVideoEvent(
      'carousel_video_mute',
      video,
      slideIndex,
      totalSlides,
      { mute_state: true }
    )
    sendTelemetryEvent(event)
  },

  /**
   * Track when a carousel video is unmuted
   */
  videoUnmute: (
    video: { id: string; title: string; slug: string },
    slideIndex: number,
    totalSlides: number
  ): void => {
    const event = createCarouselVideoEvent(
      'carousel_video_unmute',
      video,
      slideIndex,
      totalSlides,
      { mute_state: false }
    )
    sendTelemetryEvent(event)
  },

  /**
   * Track when carousel advances to next slide
   */
  videoAdvance: (
    video: { id: string; title: string; slug: string },
    fromSlideIndex: number,
    toSlideIndex: number,
    totalSlides: number
  ): void => {
    const event = createCarouselVideoEvent(
      'carousel_video_advance',
      video,
      toSlideIndex,
      totalSlides,
      {
        previous_slide_index: fromSlideIndex,
        slide_index: toSlideIndex
      }
    )
    sendTelemetryEvent(event)
  },

  /**
   * Track video playback errors
   */
  videoError: (
    video: { id: string; title: string; slug: string },
    slideIndex: number,
    totalSlides: number,
    error: string
  ): void => {
    const event = createCarouselVideoEvent(
      'carousel_video_error',
      video,
      slideIndex,
      totalSlides,
      { error_message: error }
    )
    sendTelemetryEvent(event)
  }
}

/**
 * Error telemetry for HLS and other technical issues
 */
export const errorTelemetry = {
  /**
   * Track HLS.js errors
   */
  hlsError: (videoId: string, error: string, errorCode?: string): void => {
    sendTelemetryEvent({
      event: 'carousel_hls_error',
      video_id: videoId,
      error_message: error,
      error_code: errorCode,
      timestamp: Date.now()
    })
  },

  /**
   * Track GraphQL fetch errors
   */
  graphqlError: (error: string, operation: string): void => {
    sendTelemetryEvent({
      event: 'carousel_graphql_error',
      error_message: error,
      operation,
      timestamp: Date.now()
    })
  }
}
