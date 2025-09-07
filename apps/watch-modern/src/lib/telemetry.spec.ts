/**
 * @jest-environment jsdom
 */

import { sendTelemetryEvent, createCarouselVideoEvent, carouselTelemetry, errorTelemetry } from './telemetry'

// Mock window.dataLayer
const mockDataLayerPush = jest.fn()
const mockDataLayer = []

Object.defineProperty(window, 'dataLayer', {
  value: mockDataLayer,
  writable: true
})

window.dataLayer.push = mockDataLayerPush

describe('Telemetry Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDataLayer.length = 0
  })

  describe('sendTelemetryEvent', () => {
    it('should add event to dataLayer when window is available', () => {
      const testEvent = { event: 'test_event', data: 'test' }

      sendTelemetryEvent(testEvent)

      expect(mockDataLayerPush).toHaveBeenCalledWith(testEvent)
      expect(mockDataLayer).toContain(testEvent)
    })

    it('should handle server-side rendering gracefully', () => {
      // Mock server environment
      const originalWindow = global.window
      delete (global as any).window

      const testEvent = { event: 'server_event', data: 'server' }

      // Should not throw error
      expect(() => sendTelemetryEvent(testEvent)).not.toThrow()

      // Restore window
      global.window = originalWindow
    })
  })

  describe('createCarouselVideoEvent', () => {
    const mockVideo = {
      id: 'video-123',
      title: 'Test Video',
      slug: 'test-video'
    }

    it('should create carousel video play event', () => {
      const event = createCarouselVideoEvent(
        'carousel_video_play',
        mockVideo,
        0,
        3,
        { mute_state: false }
      )

      expect(event).toEqual({
        event: 'carousel_video_play',
        video_id: 'video-123',
        video_title: 'Test Video',
        video_slug: 'test-video',
        slide_index: 0,
        total_slides: 3,
        autoplay: true,
        mute_state: false
      })
    })

    it('should create carousel video pause event with current time', () => {
      const event = createCarouselVideoEvent(
        'carousel_video_pause',
        mockVideo,
        1,
        3,
        { current_time: 45.5 }
      )

      expect(event).toEqual({
        event: 'carousel_video_pause',
        video_id: 'video-123',
        video_title: 'Test Video',
        video_slug: 'test-video',
        slide_index: 1,
        total_slides: 3,
        autoplay: true,
        current_time: 45.5
      })
    })

    it('should create carousel video advance event with previous slide info', () => {
      const event = createCarouselVideoEvent(
        'carousel_video_advance',
        mockVideo,
        2,
        3,
        {
          previous_slide_index: 1,
          slide_index: 2
        }
      )

      expect(event).toEqual({
        event: 'carousel_video_advance',
        video_id: 'video-123',
        video_title: 'Test Video',
        video_slug: 'test-video',
        slide_index: 2,
        total_slides: 3,
        autoplay: true,
        previous_slide_index: 1
      })
    })
  })

  describe('carouselTelemetry', () => {
    const mockVideo = {
      id: 'video-456',
      title: 'Carousel Test Video',
      slug: 'carousel-test'
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should send video play telemetry event', () => {
      carouselTelemetry.videoPlay(mockVideo, 0, 2, true)

      expect(mockDataLayerPush).toHaveBeenCalledWith({
        event: 'carousel_video_play',
        video_id: 'video-456',
        video_title: 'Carousel Test Video',
        video_slug: 'carousel-test',
        slide_index: 0,
        total_slides: 2,
        autoplay: true,
        mute_state: true
      })
    })

    it('should send video pause telemetry event with current time', () => {
      carouselTelemetry.videoPause(mockVideo, 1, 2, 120.5)

      expect(mockDataLayerPush).toHaveBeenCalledWith({
        event: 'carousel_video_pause',
        video_id: 'video-456',
        video_title: 'Carousel Test Video',
        video_slug: 'carousel-test',
        slide_index: 1,
        total_slides: 2,
        autoplay: true,
        current_time: 120.5
      })
    })

    it('should send video mute telemetry event', () => {
      carouselTelemetry.videoMute(mockVideo, 0, 3)

      expect(mockDataLayerPush).toHaveBeenCalledWith({
        event: 'carousel_video_mute',
        video_id: 'video-456',
        video_title: 'Carousel Test Video',
        video_slug: 'carousel-test',
        slide_index: 0,
        total_slides: 3,
        autoplay: true,
        mute_state: true
      })
    })

    it('should send video unmute telemetry event', () => {
      carouselTelemetry.videoUnmute(mockVideo, 1, 3)

      expect(mockDataLayerPush).toHaveBeenCalledWith({
        event: 'carousel_video_unmute',
        video_id: 'video-456',
        video_title: 'Carousel Test Video',
        video_slug: 'carousel-test',
        slide_index: 1,
        total_slides: 3,
        autoplay: true,
        mute_state: false
      })
    })

    it('should send video advance telemetry event with slide transition info', () => {
      carouselTelemetry.videoAdvance(mockVideo, 0, 1, 3)

      expect(mockDataLayerPush).toHaveBeenCalledWith({
        event: 'carousel_video_advance',
        video_id: 'video-456',
        video_title: 'Carousel Test Video',
        video_slug: 'carousel-test',
        slide_index: 1,
        total_slides: 3,
        autoplay: true,
        previous_slide_index: 0
      })
    })

    it('should send video error telemetry event', () => {
      carouselTelemetry.videoError(mockVideo, 2, 3, 'HLS load failed')

      expect(mockDataLayerPush).toHaveBeenCalledWith({
        event: 'carousel_video_error',
        video_id: 'video-456',
        video_title: 'Carousel Test Video',
        video_slug: 'carousel-test',
        slide_index: 2,
        total_slides: 3,
        autoplay: true,
        error_message: 'HLS load failed'
      })
    })
  })

  describe('errorTelemetry', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should send HLS error telemetry event', () => {
      errorTelemetry.hlsError('video-789', 'Network timeout', 'NETWORK_ERROR')

      expect(mockDataLayerPush).toHaveBeenCalledWith({
        event: 'carousel_hls_error',
        video_id: 'video-789',
        error_message: 'Network timeout',
        error_code: 'NETWORK_ERROR',
        timestamp: expect.any(Number)
      })
    })

    it('should send GraphQL error telemetry event', () => {
      errorTelemetry.graphqlError('Query failed', 'GetCarouselVideos')

      expect(mockDataLayerPush).toHaveBeenCalledWith({
        event: 'carousel_graphql_error',
        error_message: 'Query failed',
        operation: 'GetCarouselVideos',
        timestamp: expect.any(Number)
      })
    })

    it('should handle GraphQL errors gracefully on server-side', () => {
      // Mock server environment
      const originalWindow = global.window
      delete (global as any).window

      // Should not throw error
      expect(() => errorTelemetry.graphqlError('Server error', 'TestQuery')).not.toThrow()

      // Restore window
      global.window = originalWindow
    })
  })

  describe('Event Payload Structure Validation', () => {
    it('should maintain consistent payload structure across all carousel events', () => {
      const mockVideo = {
        id: 'validation-test',
        title: 'Validation Video',
        slug: 'validation-slug'
      }

      // Test all carousel telemetry methods
      carouselTelemetry.videoPlay(mockVideo, 0, 2, false)
      carouselTelemetry.videoPause(mockVideo, 0, 2, 30)
      carouselTelemetry.videoMute(mockVideo, 0, 2)
      carouselTelemetry.videoUnmute(mockVideo, 0, 2)
      carouselTelemetry.videoAdvance(mockVideo, 0, 1, 2)
      carouselTelemetry.videoError(mockVideo, 0, 2, 'Test error')

      const allEvents = mockDataLayerPush.mock.calls.map(call => call[0])

      // Verify all events have required base properties
      allEvents.forEach(event => {
        expect(event).toHaveProperty('event')
        expect(event).toHaveProperty('video_id', 'validation-test')
        expect(event).toHaveProperty('video_title', 'Validation Video')
        expect(event).toHaveProperty('video_slug', 'validation-slug')
        expect(event).toHaveProperty('slide_index')
        expect(event).toHaveProperty('total_slides', 2)
        expect(event).toHaveProperty('autoplay', true)
      })

      // Verify event-specific properties
      const playEvent = allEvents.find(e => e.event === 'carousel_video_play')
      expect(playEvent).toHaveProperty('mute_state', false)

      const pauseEvent = allEvents.find(e => e.event === 'carousel_video_pause')
      expect(pauseEvent).toHaveProperty('current_time', 30)

      const muteEvent = allEvents.find(e => e.event === 'carousel_video_mute')
      expect(muteEvent).toHaveProperty('mute_state', true)

      const unmuteEvent = allEvents.find(e => e.event === 'carousel_video_unmute')
      expect(unmuteEvent).toHaveProperty('mute_state', false)

      const advanceEvent = allEvents.find(e => e.event === 'carousel_video_advance')
      expect(advanceEvent).toHaveProperty('previous_slide_index', 0)

      const errorEvent = allEvents.find(e => e.event === 'carousel_video_error')
      expect(errorEvent).toHaveProperty('error_message', 'Test error')
    })

    it('should handle edge cases in event data', () => {
      const edgeCaseVideo = {
        id: 'edge-case-123',
        title: 'Video with "quotes" and & special chars',
        slug: 'edge-case-slug?with=query&params=true'
      }

      carouselTelemetry.videoPlay(edgeCaseVideo, 0, 1, true)

      expect(mockDataLayerPush).toHaveBeenCalledWith({
        event: 'carousel_video_play',
        video_id: 'edge-case-123',
        video_title: 'Video with "quotes" and & special chars',
        video_slug: 'edge-case-slug?with=query&params=true',
        slide_index: 0,
        total_slides: 1,
        autoplay: true,
        mute_state: true
      })
    })
  })
})
