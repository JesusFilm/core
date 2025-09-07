'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { CarouselVideoItem } from '@/server/getCarouselVideos'
import { Slide } from './Slide'
import { ArrowNav } from './ArrowNav'
import { Bullets } from './Bullets'
import { MuteToggle } from './MuteToggle'
import { carouselTelemetry } from '@/lib/telemetry'

interface HomeVideoCarouselProps {
  videos: CarouselVideoItem[]
  watchUrl: string
}

/**
 * Home Video Carousel Component
 * Client-side carousel that auto-advances every 15 seconds with video playback
 */
export function HomeVideoCarousel({ videos, watchUrl }: HomeVideoCarouselProps) {
  // Load mute preference from sessionStorage
  const getInitialMuteState = () => {
    if (typeof window === 'undefined') return true // Default to muted on server
    try {
      const saved = sessionStorage.getItem('watch-modern-carousel-muted')
      return saved !== null ? JSON.parse(saved) : true // Default to muted
    } catch {
      return true // Default to muted if parsing fails
    }
  }

  const [activeIndex, setActiveIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(getInitialMuteState)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [transitionState, setTransitionState] = useState<'normal' | 'gradient' | 'fade'>('normal')
  const [liveRegionMessage, setLiveRegionMessage] = useState('')

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-advance timer with soft fade transitions (15 seconds per slide)
  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)

    setProgress(0)
    setTransitionState('normal')

    // Progress update every 100ms for smooth bullet fill and transitions
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + 0.1

        // Handle transition states based on time
        if (next >= 14.2 && next < 14.7) {
          setTransitionState('gradient')
        } else if (next >= 14.7 && next < 15) {
          setTransitionState('fade')
        } else if (next >= 15) {
          setTransitionState('normal')
          return 15
        }

        return next >= 15 ? 15 : next
      })
    }, 100)

    // Auto-advance after 15 seconds
    timerRef.current = setTimeout(() => {
      if (isPlaying) {
        setActiveIndex(prev => (prev + 1) % videos.length)
        setTransitionState('normal')
      }
    }, 15000)
  }, [videos.length, isPlaying])

  // Handle slide navigation with accessibility announcements and telemetry
  const goToSlide = useCallback((index: number) => {
    const previousIndex = activeIndex
    setActiveIndex(index)
    setProgress(0)
    setTransitionState('normal')

    // Announce slide change to screen readers
    const video = videos[index]
    if (video) {
      setLiveRegionMessage(`Slide ${index + 1} of ${videos.length}: ${video.title || 'Untitled Video'}`)

      // Send telemetry for slide advancement
      if (previousIndex !== index) {
        carouselTelemetry.videoAdvance(
          { id: video.id, title: video.title, slug: video.slug },
          previousIndex,
          index,
          videos.length
        )
      }
    }
  }, [videos, activeIndex])

  const goToNext = useCallback(() => {
    goToSlide((activeIndex + 1) % videos.length)
  }, [activeIndex, videos.length, goToSlide])

  const goToPrev = useCallback(() => {
    goToSlide(activeIndex === 0 ? videos.length - 1 : activeIndex - 1)
  }, [activeIndex, videos.length, goToSlide])

  // Handle play/pause with telemetry
  const togglePlayPause = useCallback(() => {
    const newPlayingState = !isPlaying
    setIsPlaying(newPlayingState)

    // Send telemetry for play/pause
    const activeVideo = videos[activeIndex]
    if (activeVideo) {
      if (newPlayingState) {
        carouselTelemetry.videoPlay(
          { id: activeVideo.id, title: activeVideo.title, slug: activeVideo.slug },
          activeIndex,
          videos.length,
          isMuted
        )
      } else {
        carouselTelemetry.videoPause(
          { id: activeVideo.id, title: activeVideo.title, slug: activeVideo.slug },
          activeIndex,
          videos.length,
          progress
        )
      }
    }
  }, [isPlaying, videos, activeIndex, isMuted, progress])

  // Handle mute toggle with persistence and telemetry
  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean) => {
      const newValue = !prev

      // Persist mute preference to sessionStorage
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('watch-modern-carousel-muted', JSON.stringify(newValue))
        } catch (error) {
          console.warn('Failed to save mute preference to sessionStorage:', error)
        }
      }

      // Send telemetry for mute/unmute
      const activeVideo = videos[activeIndex]
      if (activeVideo) {
        if (newValue) {
          carouselTelemetry.videoMute(
            { id: activeVideo.id, title: activeVideo.title, slug: activeVideo.slug },
            activeIndex,
            videos.length
          )
        } else {
          carouselTelemetry.videoUnmute(
            { id: activeVideo.id, title: activeVideo.title, slug: activeVideo.slug },
            activeIndex,
            videos.length
          )
        }
      }

      return newValue
    })
  }, [videos, activeIndex])

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Prevent default behavior for navigation keys when carousel is focused
    if (['ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(event.key)) {
      event.preventDefault()
    }

    switch (event.key) {
      case 'ArrowLeft':
        goToPrev()
        break
      case 'ArrowRight':
        goToNext()
        break
      case ' ': // Space key
      case 'Enter':
        togglePlayPause()
        break
    }
  }, [goToPrev, goToNext, togglePlayPause])

  // Setup keyboard event listeners
  useEffect(() => {
    const carouselElement = document.querySelector('[role="region"][aria-roledescription="carousel"]') as HTMLElement
    if (carouselElement) {
      carouselElement.addEventListener('keydown', handleKeyDown)
      // Make carousel focusable
      carouselElement.tabIndex = 0
      carouselElement.setAttribute('aria-label', 'Video carousel - use arrow keys to navigate, space to play/pause')

      return () => {
        carouselElement.removeEventListener('keydown', handleKeyDown)
      }
    }
    return () => {} // Ensure consistent return type
  }, [handleKeyDown])

  // Restart timer when active index changes or play state changes
  useEffect(() => {
    if (isPlaying) {
      startTimer()

      // Send telemetry for video play when carousel starts/resumes
      const activeVideo = videos[activeIndex]
      if (activeVideo) {
        carouselTelemetry.videoPlay(
          { id: activeVideo.id, title: activeVideo.title, slug: activeVideo.slug },
          activeIndex,
          videos.length,
          isMuted
        )
      }
    } else {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [activeIndex, isPlaying, videos, isMuted, startTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  if (videos.length === 0) {
    return null
  }

  return (
    <div
      className="relative h-[70vh] min-h-[500px] w-full overflow-hidden carousel-bg z-30"
      role="region"
      aria-roledescription="carousel"
      aria-label="Video carousel - use arrow keys to navigate, space to play/pause"
      tabIndex={0}
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      {/* Video Slides */}
      <div className="relative h-full w-full">
        {videos.map((video, index) => (
          <Slide
            key={video.id}
            video={video}
            index={index}
            totalSlides={videos.length}
            isActive={index === activeIndex}
            isMuted={isMuted}
            watchUrl={watchUrl}
            transitionState={index === activeIndex ? transitionState : 'normal'}
          />
        ))}
      </div>

      {/* Navigation Controls */}
      <ArrowNav onPrev={goToPrev} onNext={goToNext} />

      {/* Bullet Indicators */}
      <Bullets
        total={videos.length}
        activeIndex={activeIndex}
        progress={progress}
        onBulletClick={goToSlide}
      />

      {/* Mute Toggle */}
      <MuteToggle isMuted={isMuted} onToggle={toggleMute} />

      {/* Live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {liveRegionMessage}
      </div>
    </div>
  )
}
