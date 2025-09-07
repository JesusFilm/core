import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { CarouselVideoItem } from '@/server/getCarouselVideos'
import { OverlayMeta } from './OverlayMeta'
import { errorTelemetry } from '@/lib/telemetry'

interface SlideProps {
  video: CarouselVideoItem
  index: number
  totalSlides: number
  isActive: boolean
  isMuted: boolean
  watchUrl: string
  transitionState: 'normal' | 'gradient' | 'fade'
}

/**
 * Individual slide component that renders video with overlay
 * Supports HLS playback with native HLS fallback for Safari
 */
export function Slide({ video, index, totalSlides, isActive, isMuted, watchUrl, transitionState }: SlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHlsLoaded, setIsHlsLoaded] = useState(false)

  // Detect Safari for native HLS support (keeping for future use)
  // const isSafari = useCallback(() => {
  //   const ua = navigator.userAgent
  //   return ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Chromium')
  // }, [])

  // Check if browser supports native HLS
  const supportsNativeHls = useCallback(() => {
    const video = document.createElement('video')
    return video.canPlayType('application/vnd.apple.mpegurl') !== ''
  }, [])

  // Initialize HLS.js for non-Safari browsers
  const initHls = useCallback(() => {
    const videoElement = videoRef.current
    if (!videoElement || !video.hlsUrl || !Hls.isSupported() || supportsNativeHls() || hlsRef.current) return

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    })

    hls.loadSource(video.hlsUrl)
    hls.attachMedia(videoElement)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setIsHlsLoaded(true)
      // Start playing if slide is active and visible
      if (isActive && isVisible) {
        video.play().catch(() => {
          // Silently handle autoplay failures
        })
      }
    })

    hls.on(Hls.Events.ERROR, (_, data) => {
      console.error('HLS.js error:', data)

      // Send telemetry for HLS errors
      errorTelemetry.hlsError(
        video.id,
        data.details || 'Unknown HLS error',
        data.type?.toString()
      )

      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError()
            break
          default:
            initHls()
            break
        }
      }
    })

    hlsRef.current = hls
  }, [isActive, isVisible, supportsNativeHls])

  // Cleanup HLS instance
  const cleanupHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
      setIsHlsLoaded(false)
    }
  }, [])

  // Setup intersection observer for programmatic autoplay
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(video)
    intersectionObserverRef.current = observer

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect()
      }
    }
  }, [])

  // Initialize HLS when video URL is available and component mounts
  useEffect(() => {
    if (video.hlsUrl && isActive && isVisible) {
      initHls()
    }

    return () => {
      cleanupHls()
    }
  }, [video.hlsUrl, isActive, isVisible, initHls, cleanupHls])

  // Handle video playback when slide becomes active/inactive (single active player policy)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive && isVisible && isHlsLoaded) {
      // Start playing only for active slide
      video.play().catch(() => {
        // Silently handle autoplay failures (common in browsers)
      })
    } else {
      // Pause and reset non-active slides
      video.pause()
      video.currentTime = 0 // Reset to beginning

      // For non-active slides, also destroy HLS instance to save resources
      // Only keep HLS instances for active slide and immediate neighbors
      if (!isActive && hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
        setIsHlsLoaded(false)
      }
    }
  }, [isActive, isVisible, isHlsLoaded])

  // Handle mute state changes
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.muted = isMuted
    }
  }, [isMuted])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupHls()
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect()
      }
    }
  }, [cleanupHls])

  // Calculate opacity based on transition state
  const getContainerOpacity = () => {
    if (!isActive) return 'opacity-0'
    if (transitionState === 'fade') return 'opacity-30' // Soft fade during transition
    return 'opacity-100'
  }

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ${getContainerOpacity()} ${
        isActive ? '' : 'pointer-events-none'
      }`}
      data-testid="slide-container"
      role="group"
      aria-label={`Slide ${index + 1} of ${totalSlides}: ${video.title || 'Untitled Video'}`}
      aria-hidden={!isActive}
    >
      {/* Video Element */}
      {video.hlsUrl ? (
        <video
          ref={videoRef}
          src={supportsNativeHls() ? video.hlsUrl : undefined}
          className="h-full w-full object-cover"
          muted={isMuted}
          playsInline
          preload="none" // We'll handle loading manually with HLS.js
          loop={false}
          aria-hidden="true"
          data-testid="video-element"
        />
      ) : (
        /* Fallback image when video not available */
        <div className="h-full w-full bg-neutral-900 flex items-center justify-center">
          <div className="text-white/50 text-center">
            <div className="text-6xl mb-4">🎥</div>
            <p aria-label="Video unavailable">Video unavailable</p>
          </div>
        </div>
      )}

      {/* Enhanced Gradient Overlay with theme alignment */}
      <div
        className={`absolute inset-0 transition-all duration-500 pointer-events-none ${
          transitionState === 'gradient'
            ? 'carousel-gradient-emphasis'
            : 'carousel-gradient-normal'
        }`}
        data-testid="gradient-overlay"
      />

      {/* Content Overlay */}
      <OverlayMeta
        video={video}
        watchUrl={watchUrl}
      />
    </div>
  )
}
