import fscreen from 'fscreen'
import { sendGTMEvent } from '@next/third-parties/google'
import { useRouter } from 'next/router'
import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { usePlayer } from '../../../libs/playerContext/PlayerContext'
import { useVideo } from '../../../libs/videoContext'

import { ContentHeader } from './ContentHeader'
import { HeroVideo } from './HeroVideo'
import { UpNextPanel } from './UpNextPanel'
import { useCountdown } from './hooks/useCountdown'
import { NextUpVideo } from './types'

const PANEL_REVEAL_REMAINING_SECONDS = 20
const PANEL_REVEAL_PERCENT = 0.9
const COUNTDOWN_SECONDS = 5

interface VideoContentHeroProps {
  isFullscreen?: boolean
  setIsFullscreen?: (isFullscreen: boolean) => void
  nextUpVideo?: NextUpVideo | null
}

export function VideoContentHero({
  isFullscreen = false,
  setIsFullscreen,
  nextUpVideo
}: VideoContentHeroProps): ReactElement {
  const { id, variant } = useVideo()
  const {
    state: { progress, durationSeconds, play }
  } = usePlayer()
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [autoplayCanceled, setAutoplayCanceled] = useState(false)
  const hasLoggedPanelOpenRef = useRef(false)
  const autoplayTriggeredRef = useRef(false)
  const hasInitializedResetRef = useRef(false)
  /**
   * Effect to handle fullscreen changes.
   * Adds and removes event listeners for fullscreen state changes.
   */
  useEffect(() => {
    /**
     * Handler for fullscreen change events.
     * Updates component state and scrolls to top when entering fullscreen.
     */
    function fullscreenchange(): void {
      const isFullscreen = fscreen.fullscreenElement != null
      setIsFullscreen?.(isFullscreen)
      if (isFullscreen) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    fscreen.addEventListener('fullscreenchange', fullscreenchange)

    return () =>
      fscreen.removeEventListener('fullscreenchange', fullscreenchange)
  }, [setIsFullscreen])

  const languageSlug = variant?.slug?.split('/')[1]

  const remainingSeconds = useMemo(() => {
    if (durationSeconds <= 0) return null
    return Math.max(durationSeconds - progress, 0)
  }, [durationSeconds, progress])

  const shouldRevealPanel = useMemo(() => {
    if (nextUpVideo == null || autoplayCanceled || isFullscreen) return false
    if (durationSeconds <= 0 || remainingSeconds == null) return false
    const percentComplete = progress / durationSeconds
    const thresholdMet =
      remainingSeconds <= PANEL_REVEAL_REMAINING_SECONDS ||
      percentComplete >= PANEL_REVEAL_PERCENT
    return thresholdMet && progress > 0
  }, [
    autoplayCanceled,
    durationSeconds,
    isFullscreen,
    nextUpVideo,
    progress,
    remainingSeconds
  ])

  useEffect(() => {
    setIsPanelOpen(shouldRevealPanel)
  }, [shouldRevealPanel])

  useEffect(() => {
    if (!isPanelOpen) return
    panelRef.current?.focus({ preventScroll: true })
  }, [isPanelOpen])

  useEffect(() => {
    if (isPanelOpen && nextUpVideo != null && !hasLoggedPanelOpenRef.current) {
      hasLoggedPanelOpenRef.current = true
      sendGTMEvent({
        event: 'watch_up_next_panel_shown',
        videoId: id,
        nextVideoId: nextUpVideo.id
      })
    }
  }, [id, isPanelOpen, nextUpVideo])

  useEffect(() => {
    if (!hasInitializedResetRef.current) {
      hasInitializedResetRef.current = true
      return
    }
    setIsPanelOpen(false)
    setAutoplayCanceled(false)
    hasLoggedPanelOpenRef.current = false
    autoplayTriggeredRef.current = false
  }, [variant?.id, nextUpVideo?.id])

  useEffect(() => {
    if (isPanelOpen && nextUpVideo?.href != null) {
      void router.prefetch(nextUpVideo.href)
    }
  }, [isPanelOpen, nextUpVideo?.href, router])

  const handleAutoplay = useCallback(() => {
    if (nextUpVideo == null || autoplayCanceled || autoplayTriggeredRef.current)
      return
    autoplayTriggeredRef.current = true
    sendGTMEvent({
      event: 'watch_up_next_autoplay_start',
      videoId: id,
      nextVideoId: nextUpVideo.id
    })
    void router.push(nextUpVideo.href)
  }, [autoplayCanceled, id, nextUpVideo, router])

  const handlePlayNow = useCallback(() => {
    if (nextUpVideo == null) return
    autoplayTriggeredRef.current = true
    sendGTMEvent({
      event: 'watch_up_next_play_now',
      videoId: id,
      nextVideoId: nextUpVideo.id
    })
    void router.push(nextUpVideo.href)
  }, [id, nextUpVideo, router])

  const handleCancel = useCallback(() => {
    if (nextUpVideo == null) return
    setAutoplayCanceled(true)
    setIsPanelOpen(false)
    sendGTMEvent({
      event: 'watch_up_next_autoplay_cancel',
      videoId: id,
      nextVideoId: nextUpVideo.id
    })
  }, [id, nextUpVideo])

  const countdownActive =
    isPanelOpen &&
    !autoplayCanceled &&
    nextUpVideo != null &&
    play &&
    !isFullscreen &&
    remainingSeconds != null &&
    remainingSeconds <= COUNTDOWN_SECONDS

  const countdownStartValue = useMemo(() => {
    if (remainingSeconds == null) return COUNTDOWN_SECONDS
    return Math.min(Math.max(Math.ceil(remainingSeconds), 0), COUNTDOWN_SECONDS)
  }, [remainingSeconds])

  const countdown = useCountdown({
    isRunning: countdownActive,
    initialCount: countdownStartValue,
    onComplete: handleAutoplay
  })

  return (
    <div
      className={`${
        isFullscreen ? 'h-[100svh]' : 'h-[90svh] md:h-[80svh]'
      } w-full flex items-end relative bg-[#131111] z-[1] transition-all duration-300 ease-out`}
      data-testid="ContentHero"
    >
      <ContentHeader
        languageSlug={languageSlug?.replace('.html', '')}
        sidePanelOpen={isPanelOpen && !isFullscreen}
      />
      <HeroVideo
        isFullscreen={isFullscreen}
        key={variant?.hls}
        sidePanelOpen={isPanelOpen && !isFullscreen}
      />
      <div
        data-testid="ContainerHeroTitleContainer"
        className="w-full relative flex flex-col sm:flex-row max-w-[1920px] mx-auto pb-4"
      >
        <div
          className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none block md:hidden"
          style={{
            backdropFilter: 'brightness(.6) blur(40px)',
            maskImage:
              'linear-gradient(0deg, rgba(2,0,36,1) 46%, rgba(2,0,36,1) 53%, rgba(0,0,0,0) 100%)'
          }}
        />
      </div>
      <UpNextPanel
        open={isPanelOpen && !isFullscreen}
        countdown={countdown}
        nextVideo={nextUpVideo ?? null}
        onCancel={handleCancel}
        onPlayNow={handlePlayNow}
        panelRef={panelRef}
      />
    </div>
  )
}
