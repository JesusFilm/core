import { sendGTMEvent } from '@next/third-parties/google'
import fscreen from 'fscreen'
import debounce from 'lodash/debounce'
import last from 'lodash/last'
import {
  Globe,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  Subtitles,
  Volume,
  Volume1,
  Volume2,
  VolumeX
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import {
  MouseEventHandler,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import Player from 'video.js/dist/types/player'

import { isMobile } from '@core/shared/ui/deviceUtils'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'
import { Button } from '@core/shared/ui-modern/components/button'
import { Skeleton } from '@core/shared/ui-modern/components/skeleton'

import { cn } from '../../../../../libs/cn'
import { usePlayer } from '../../../../../libs/playerContext'
import { useVideo } from '../../../../../libs/videoContext'
import { useLanguageActions } from '../../../../../libs/watchContext'
import type { InsertAction, InsertOverlay } from '../../../../../types/inserts'
import { HeroOverlay } from '../../../../HeroOverlay/HeroOverlay'
import { handleVideoTitleClick } from '../../../../VideoControls/utils/handleVideoTitleClick/handleVideoTitleClick'
import { VideoSlider } from '../../../../VideoControls/VideoSlider'
import { VideoTitle } from '../../../../VideoControls/VideoTitle/VideoTitle'

const DynamicLanguageSwitchDialog = dynamic<{
  open: boolean
  handleClose: () => void
}>(
  async () =>
    await import(
      /* webpackChunkName: "DialogLangSwitch" */
      '../../../../DialogLangSwitch'
    ).then((mod) => mod.DialogLangSwitch),
  {
    ssr: false,
    loading: () => <div role="dialog" aria-label="Language Settings" />
  }
)

interface VideoControlProps {
  player?: Player
  onVisibleChanged?: (active: boolean) => void
  isPreview?: boolean
  onMuteToggle?: (isMuted: boolean) => void
  customDuration?: number
  action?: InsertAction
  isMuxInsert?: boolean
  muxOverlay?: InsertOverlay
  onSkip?: () => void
  placement?: 'carouselItem' | 'singleVideo'
  wasUnmuted?: boolean
}

function evtToDataLayer(
  eventType,
  mcId,
  langId,
  title,
  language,
  seconds,
  percent
): void {
  sendGTMEvent({
    event: eventType,
    mcId,
    langId,
    title,
    language,
    percent,
    seconds,
    dateTimeUTC: new Date().toISOString()
  })
}
const eventToDataLayer = debounce(evtToDataLayer, 500)

export function VideoControls({
  player,
  onVisibleChanged,
  isPreview = false,
  onMuteToggle,
  customDuration,
  action,
  isMuxInsert = false,
  muxOverlay,
  onSkip,
  placement,
  wasUnmuted = false
}: VideoControlProps): ReactElement {
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const isSeekingRef = useRef(false)
  const [isSeekLoading, setIsSeekLoading] = useState(false)
  const {
    state: {
      play,
      active,
      loading,
      currentTime,
      progress,
      volume,
      mute,
      fullscreen,
      duration,
      durationSeconds,
      progressPercentNotYetEmitted
    },
    dispatch: dispatchPlayer
  } = usePlayer()
  const [openLanguageSwitchDialog, setOpenLanguageSwitchDialog] =
    useState<boolean>()

  const { updateSubtitlesOn } = useLanguageActions()
  const {
    id,
    title,
    variant,
    images,
    imageAlt,
    label,
    description,
    container,
    slug
  } = useVideo()
  const visible = !play || active || loading

  const videoTitle = last(title)?.value ?? ''
  const videoLabel =
    isMuxInsert && muxOverlay ? muxOverlay.label : label?.replace(/_/g, ' ')
  const videoDescription =
    isMuxInsert && muxOverlay
      ? muxOverlay.description
      : last(description)?.value
  const containerSlug = container?.slug ?? slug
  const collectionTitle = last(container?.title)?.value

  useEffect(() => {
    onVisibleChanged?.(!play || active || loading)
  }, [play, active, loading, onVisibleChanged])

  // Set duration from custom duration, variant data, or try to detect from HLS stream
  useEffect(() => {
    if (customDuration != null && customDuration > 0) {
      const roundedDuration = Math.round(customDuration)
      dispatchPlayer({
        type: 'SetDurationSeconds',
        durationSeconds: roundedDuration
      })
      dispatchPlayer({
        type: 'SetDuration',
        duration: secondsToTimeFormat(roundedDuration, { trimZeroes: true })
      })
    } else if (variant?.duration != null && variant.duration > 0) {
      const roundedDuration = Math.round(variant.duration)
      dispatchPlayer({
        type: 'SetDurationSeconds',
        durationSeconds: roundedDuration
      })
      dispatchPlayer({
        type: 'SetDuration',
        duration: secondsToTimeFormat(roundedDuration, { trimZeroes: true })
      })
    } else {
      // Fallback to player detection for edge cases
      let retryCount = 0
      const maxRetries = 3
      let retryTimeout: NodeJS.Timeout | undefined

      const updateDuration = (state: string): void => {
        const playerDuration = player?.duration()

        if (
          playerDuration != null &&
          !isNaN(playerDuration) &&
          playerDuration > 0
        ) {
          const roundedDuration = Math.round(playerDuration)
          dispatchPlayer({
            type: 'SetDurationSeconds',
            durationSeconds: roundedDuration
          })
          dispatchPlayer({
            type: 'SetDuration',
            duration: secondsToTimeFormat(roundedDuration, { trimZeroes: true })
          })
          if (retryTimeout) {
            clearTimeout(retryTimeout)
            retryTimeout = undefined
          }
        } else if (playerDuration === Infinity) {
          dispatchPlayer({
            type: 'SetDurationSeconds',
            durationSeconds: 0
          })
          dispatchPlayer({
            type: 'SetDuration',
            duration: 'Live'
          })
        } else if (state === 'retry' && retryCount < maxRetries) {
          retryCount++
          const delay = 1000 * retryCount

          retryTimeout = setTimeout(() => {
            updateDuration('retry')
          }, delay)
        }
      }
      // Only add fallback listeners if variant duration is not available
      const events = ['durationchange', 'loadedmetadata', 'canplay']
      const durationHandlers: { [key: string]: () => void } = {}

      events.forEach((event) => {
        durationHandlers[event] = () => updateDuration(event)
        player?.on(event, durationHandlers[event])
      })

      updateDuration('initial')

      return () => {
        if (retryTimeout) {
          clearTimeout(retryTimeout)
        }
        events.forEach((event) => {
          player?.off(event, durationHandlers[event])
        })
      }
    }
  }, [player, variant?.duration, customDuration])

  useEffect(() => {
    const percent =
      durationSeconds > 0
        ? Math.round(((player?.currentTime() ?? 0) / durationSeconds) * 100)
        : 0
    if (percent > progressPercentNotYetEmitted[0]) {
      eventToDataLayer(
        `video_time_update_${progressPercentNotYetEmitted[0]}`,
        id,
        variant?.language.id,
        title[0].value,
        variant?.language?.name.find(({ primary }) => !primary)?.value ??
          variant?.language?.name[0]?.value,
        Math.round(player?.currentTime() ?? 0),
        percent
      )
      const [, ...rest] = progressPercentNotYetEmitted
      dispatchPlayer({
        type: 'SetProgressPercentNotYetEmitted',
        progressPercentNotYetEmitted: rest
      })
    }
  }, [
    id,
    progress,
    durationSeconds,
    progressPercentNotYetEmitted,
    title,
    variant
  ])

  // Define stable event handlers using useCallback
  const handlePlay = useCallback(() => {
    if ((player?.currentTime() ?? 0) < 0.02) {
      eventToDataLayer(
        'video_start',
        id,
        variant?.language.id,
        title[0].value,
        variant?.language?.name.find(({ primary }) => !primary)?.value ??
          variant?.language?.name[0]?.value,
        Math.round(player?.currentTime() ?? 0),
        durationSeconds > 0
          ? Math.round(((player?.currentTime() ?? 0) / durationSeconds) * 100)
          : 0
      )
    } else {
      eventToDataLayer(
        'video_play',
        id,
        variant?.language.id,
        title[0].value,
        variant?.language?.name.find(({ primary }) => !primary)?.value ??
          variant?.language?.name[0]?.value,
        Math.round(player?.currentTime() ?? 0),
        durationSeconds > 0
          ? Math.round(((player?.currentTime() ?? 0) / durationSeconds) * 100)
          : 0
      )
    }
    void player?.play()
    dispatchPlayer({
      type: 'SetPlay',
      play: true
    })
  }, [player, id, variant, title, durationSeconds, dispatchPlayer])

  const handlePause = useCallback(() => {
    if ((player?.currentTime() ?? 0) > 0.02) {
      eventToDataLayer(
        'video_pause',
        id,
        variant?.language.id,
        title[0].value,
        variant?.language?.name.find(({ primary }) => !primary)?.value ??
          variant?.language?.name[0]?.value,
        Math.round(player?.currentTime() ?? 0),
        durationSeconds > 0
          ? Math.round(((player?.currentTime() ?? 0) / durationSeconds) * 100)
          : 0
      )
    }
    player?.pause()
    dispatchPlayer({
      type: 'SetPlay',
      play: false
    })
  }, [player, id, variant, title, durationSeconds, dispatchPlayer])

  // Separate handlers for player events - sync state with actual player state
  const handlePlayerEventPlay = useCallback(() => {
    // Sync global state with actual player state
    dispatchPlayer({
      type: 'SetPlay',
      play: true
    })
    // Analytics for player events
    if ((player?.currentTime() ?? 0) < 0.02) {
      eventToDataLayer(
        'video_start',
        id,
        variant?.language.id,
        title[0].value,
        variant?.language?.name.find(({ primary }) => !primary)?.value ??
          variant?.language?.name[0]?.value,
        Math.round(player?.currentTime() ?? 0),
        durationSeconds > 0
          ? Math.round(((player?.currentTime() ?? 0) / durationSeconds) * 100)
          : 0
      )
    } else {
      eventToDataLayer(
        'video_play',
        id,
        variant?.language.id,
        title[0].value,
        variant?.language?.name.find(({ primary }) => !primary)?.value ??
          variant?.language?.name[0]?.value,
        Math.round(player?.currentTime() ?? 0),
        durationSeconds > 0
          ? Math.round(((player?.currentTime() ?? 0) / durationSeconds) * 100)
          : 0
      )
    }
  }, [player, id, variant, title, durationSeconds, dispatchPlayer])

  const handlePlayerEventPause = useCallback(() => {
    if (!(player?.paused() ?? false)) {
      // Firefox occasionally emits pause events even though playback continues;
      // ignore them so we don't thrash global player state.
      return
    }
    // Sync global state with actual player state
    dispatchPlayer({
      type: 'SetPlay',
      play: false
    })
    // Analytics for player events
    if ((player?.currentTime() ?? 0) > 0.02) {
      eventToDataLayer(
        'video_pause',
        id,
        variant?.language.id,
        title[0].value,
        variant?.language?.name.find(({ primary }) => !primary)?.value ??
          variant?.language?.name[0]?.value,
        Math.round(player?.currentTime() ?? 0),
        durationSeconds > 0
          ? Math.round(((player?.currentTime() ?? 0) / durationSeconds) * 100)
          : 0
      )
    }
  }, [player, id, variant, title, durationSeconds, dispatchPlayer])

  const handleTimeUpdate = useCallback(() => {
    dispatchPlayer({
      type: 'SetCurrentTime',
      currentTime: secondsToTimeFormat(player?.currentTime() ?? 0, {
        trimZeroes: true
      })
    })
    dispatchPlayer({
      type: 'SetProgress',
      progress:
        durationSeconds > 0
          ? Math.round(((player?.currentTime() ?? 0) / durationSeconds) * 100)
          : 0
    })
  }, [player, durationSeconds, dispatchPlayer])

  const handleVolumeChange = useCallback(() => {
    dispatchPlayer({
      type: 'SetMute',
      mute: player?.muted() ?? false
    })
    dispatchPlayer({
      type: 'SetVolume',
      volume: (player?.volume() ?? 1) * 100
    })
  }, [player, dispatchPlayer])

  const handleFullscreenChange = useCallback(() => {
    dispatchPlayer({
      type: 'SetFullscreen',
      fullscreen: player?.isFullscreen() ?? false
    })
  }, [player, dispatchPlayer])

  const handleUserActive = useCallback(
    () =>
      dispatchPlayer({
        type: 'SetActive',
        active: true
      }),
    [dispatchPlayer]
  )

  const handleUserInactive = useCallback(
    () =>
      dispatchPlayer({
        type: 'SetActive',
        active: false
      }),
    [dispatchPlayer]
  )

  const handleWaiting = useCallback(() => {
    // Don't show loading state during user-initiated seeks
    if (!isSeekingRef.current) {
      dispatchPlayer({
        type: 'SetLoading',
        loading: true
      })
    } else {
      // Show seek loading spinner in play/pause button
      setIsSeekLoading(true)
    }
  }, [dispatchPlayer])

  const handlePlaying = useCallback(() => {
    setInitialLoadComplete(true)
    dispatchPlayer({
      type: 'SetLoading',
      loading: false
    })
    // Clear seeking flag when video starts playing
    isSeekingRef.current = false
    setIsSeekLoading(false)
  }, [dispatchPlayer])

  const handleEnded = useCallback(() => {
    eventToDataLayer(
      'video_ended',
      id,
      variant?.language.id,
      title[0].value,
      variant?.language?.name.find(({ primary }) => !primary)?.value ??
        variant?.language?.name[0]?.value,
      Math.round(player?.currentTime() ?? 0),
      durationSeconds > 0
        ? Math.round(((player?.currentTime() ?? 0) / durationSeconds) * 100)
        : 0
    )
  }, [player, id, variant, title, durationSeconds])

  const handleCanPlay = useCallback(() => {
    dispatchPlayer({
      type: 'SetLoading',
      loading: false
    })
    // Clear seeking flag when video can play
    isSeekingRef.current = false
    setIsSeekLoading(false)
  }, [dispatchPlayer])

  const handleCanPlayThrough = useCallback(() => {
    dispatchPlayer({
      type: 'SetLoading',
      loading: false
    })
    // Clear seeking flag when video can play through
    isSeekingRef.current = false
    setIsSeekLoading(false)
  }, [dispatchPlayer])

  const handleSeeked = useCallback(() => {
    // Clear seeking flag when seek completes
    isSeekingRef.current = false
    setIsSeekLoading(false)
    dispatchPlayer({
      type: 'SetLoading',
      loading: false
    })
  }, [dispatchPlayer])

  useEffect(() => {
    dispatchPlayer({
      type: 'SetVolume',
      volume: (player?.volume() ?? 1) * 100
    })

    // Attach handlers - use separate handlers for player events vs user interactions
    player?.on('play', handlePlayerEventPlay)
    player?.on('pause', handlePlayerEventPause)
    player?.on('timeupdate', handleTimeUpdate)
    player?.on('volumechange', handleVolumeChange)
    player?.on('fullscreenchange', handleFullscreenChange)
    player?.on('useractive', handleUserActive)
    player?.on('userinactive', handleUserInactive)
    player?.on('waiting', handleWaiting)
    player?.on('playing', handlePlaying)
    player?.on('ended', handleEnded)
    player?.on('canplay', handleCanPlay)
    player?.on('canplaythrough', handleCanPlayThrough)
    player?.on('seeked', handleSeeked)

    const fscreenHandler = () => {
      if (fscreen.fullscreenElement != null) {
        eventToDataLayer(
          'video_enter_full_screen',
          id,
          variant?.language.id,
          title[0].value,
          variant?.language?.name.find(({ primary }) => !primary)?.value ??
            variant?.language?.name[0]?.value,
          Math.round(player?.currentTime() ?? 0),
          durationSeconds > 0
            ? Math.round(((player?.currentTime() ?? 0) / durationSeconds) * 100)
            : 0
        )
      } else {
        eventToDataLayer(
          'video_exit_full_screen',
          id,
          variant?.language.id,
          title[0].value,
          variant?.language?.name.find(({ primary }) => !primary)?.value ??
            variant?.language?.name[0]?.value,
          Math.round(player?.currentTime() ?? 0),
          durationSeconds > 0
            ? Math.round(((player?.currentTime() ?? 0) / durationSeconds) * 100)
            : 0
        )
      }
      dispatchPlayer({
        type: 'SetFullscreen',
        fullscreen: fscreen.fullscreenElement != null
      })
    }

    fscreen.addEventListener('fullscreenchange', fscreenHandler)

    return () => {
      // Clean up player event handlers
      player?.off('play', handlePlayerEventPlay)
      player?.off('pause', handlePlayerEventPause)
      player?.off('timeupdate', handleTimeUpdate)
      player?.off('volumechange', handleVolumeChange)
      player?.off('fullscreenchange', handleFullscreenChange)
      player?.off('useractive', handleUserActive)
      player?.off('userinactive', handleUserInactive)
      player?.off('waiting', handleWaiting)
      player?.off('playing', handlePlaying)
      player?.off('ended', handleEnded)
      player?.off('canplay', handleCanPlay)
      player?.off('canplaythrough', handleCanPlayThrough)
      player?.off('seeked', handleSeeked)

      // Clean up fscreen handler
      fscreen.removeEventListener('fullscreenchange', fscreenHandler)
    }
  }, [
    id,
    player,
    dispatchPlayer,
    loading,
    title,
    variant,
    durationSeconds,
    handlePlay,
    handlePause,
    handlePlayerEventPlay,
    handlePlayerEventPause,
    handleTimeUpdate,
    handleVolumeChange,
    handleFullscreenChange,
    handleUserActive,
    handleUserInactive,
    handleWaiting,
    handlePlaying,
    handleEnded,
    handleCanPlay,
    handleCanPlayThrough,
    handleSeeked
  ])

  async function handleFullscreen(): Promise<void> {
    if (fullscreen) {
      fscreen.exitFullscreen()
      dispatchPlayer({
        type: 'SetFullscreen',
        fullscreen: false
      })
    } else {
      if (isMobile()) {
        void player?.requestFullscreen()
        dispatchPlayer({
          type: 'SetFullscreen',
          fullscreen: true
        })
      } else {
        await fscreen.requestFullscreen(document.documentElement)
        dispatchPlayer({
          type: 'SetFullscreen',
          fullscreen: true
        })
      }
    }
  }

  function handleSeek(_event: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      // Value is in seconds (from slider with min=0, max=durationSeconds)
      const timeInSeconds = value
      const progressPercent =
        durationSeconds > 0
          ? Math.round((timeInSeconds / durationSeconds) * 100)
          : 0

      // Mark that we're performing a user-initiated seek
      isSeekingRef.current = true
      // Reset seek loading state for new seek
      setIsSeekLoading(false)

      dispatchPlayer({
        type: 'SetProgress',
        progress: progressPercent
      })
      player?.currentTime(timeInSeconds)
    }
  }

  function handleSeekValueChange(value: number[]): void {
    if (value.length > 0) {
      handleSeek({} as Event, value[0])
    }
  }

  function handleMute(): void {
    const newMuteState = !mute
    player?.muted(newMuteState)
    dispatchPlayer({
      type: 'SetMute',
      mute: newMuteState
    })
    if (onMuteToggle) {
      onMuteToggle(newMuteState)
    }
  }

  function handleVolume(_event: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      if (mute === true) handleMute()
      dispatchPlayer({
        type: 'SetVolume',
        volume: value
      })
      player?.volume(value / 100)
    }
  }

  function handleVolumeValueChange(value: number[]): void {
    if (value.length > 0) {
      handleVolume({} as Event, value[0])
    }
  }

  function getClickHandler(
    onClick: MouseEventHandler,
    onDblClick: MouseEventHandler,
    delay = 250
  ): MouseEventHandler {
    let timeoutID: NodeJS.Timeout | undefined
    return (event) => {
      if (timeoutID == null) {
        timeoutID = setTimeout(() => {
          onClick(event)
          timeoutID = undefined
        }, delay)
      } else {
        clearTimeout(timeoutID)
        timeoutID = undefined
        onDblClick(event)
      }
    }
  }

  function handleClick(): void {
    // Set subtitles on when opening language dialog
    updateSubtitlesOn(true)

    setOpenLanguageSwitchDialog(true)
  }

  return (
    <div
      className={cn(
        'absolute top-0 right-0 bottom-0 left-0 z-[2] flex flex-col justify-end',
        visible ? 'cursor-default' : 'cursor-none'
      )}
      onClick={getClickHandler(handlePlay, () => {
        void handleFullscreen()
      })}
      onMouseMove={() => player?.userActive(true)}
      data-testid="VideoControls"
    >
      {/* Show title overlay only once on a single page */}
      {(!loading && mute && !wasUnmuted) || placement == 'carouselItem' ? (
        <div className="responsive-container">
          <VideoTitle
            videoTitle={videoTitle}
            videoLabel={videoLabel}
            videoDescription={videoDescription}
            variant="unmute"
            showButton
            isPreview={placement == 'carouselItem'}
            containerSlug={containerSlug}
            collectionTitle={collectionTitle}
            action={action}
            isMuxInsert={isMuxInsert}
            onMuteToggle={handleMute}
            onSkip={onSkip}
            onClick={(e) => {
              e.stopPropagation()
              handleVideoTitleClick({
                player,
                dispatch: dispatchPlayer,
                mute,
                volume,
                play,
                onMuteToggle
              })
            }}
          />
        </div>
      ) : null}
      {/* Loading State */}
      {loading && placement == 'singleVideo' && (
        <>
          <div className="z-[2] flex flex-grow items-center justify-center pt-[104px]">
            <div className="border-secondary border-t-primary h-[65px] w-[65px] animate-spin rounded-full border-4" />
          </div>
          {images[0]?.mobileCinematicHigh != null && (
            <Image
              src={images[0].mobileCinematicHigh}
              alt={imageAlt[0].value}
              fill
              sizes="100vw"
              style={{
                objectFit: 'cover'
              }}
            />
          )}
          <div className="responsive-container z-[2] mx-auto max-w-7xl">
            <VideoTitle
              showButton={!initialLoadComplete}
              videoTitle={videoTitle}
              onClick={(e) => {
                e.stopPropagation()
                handleVideoTitleClick({
                  player,
                  dispatch: dispatchPlayer,
                  mute,
                  volume,
                  play,
                  onMuteToggle
                })
              }}
            />
          </div>
          <div className="absolute top-0 right-0 bottom-0 left-0 z-0">
            <HeroOverlay />
          </div>
        </>
      )}
      {/* Video Controls */}
      {placement == 'singleVideo' && wasUnmuted && (
        <div
          className={cn(
            'transition-opacity duration-[225ms]',
            visible ? 'opacity-100 delay-0' : 'opacity-0 delay-[2000ms]'
          )}
        >
          <div>
            <div
              className="bg-gradient-to-b from-transparent via-stone-900/10 via-[30%] to-stone-900/80 pt-5 mix-blend-multiply"
              onClick={(event) => event.stopPropagation()}
            >
              <div
                data-testid="vjs-jfp-custom-controls"
                className={cn(
                  'padded z-[5] mx-auto w-full max-w-7xl pb-4',
                  visible ? 'delay-0' : 'delay-[500ms]'
                )}
                style={{ transitionDelay: visible ? undefined : '0.5s' }}
              >
                <VideoSlider
                  aria-label="mobile-progress-control"
                  min={0}
                  max={durationSeconds}
                  value={[
                    durationSeconds > 0 ? (progress / 100) * durationSeconds : 0
                  ]}
                  onValueChange={handleSeekValueChange}
                  className="flex h-[8.4px] md:hidden [&>button]:h-[13px] [&>button]:w-[13px] [&>span]:h-[8.4px] [&>span>span]:h-[8.4px]"
                />
                <div className="flex flex-row items-center justify-between gap-5 md:justify-start">
                  <Button
                    id={play ? 'pause-button' : 'play-button'}
                    onClick={play ? handlePause : handlePlay}
                    variant="ghost"
                  >
                    {isSeekLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : !play ? (
                      <Play className="h-6 w-6" fill="currentColor" />
                    ) : (
                      <Pause className="h-6 w-6" fill="currentColor" />
                    )}
                  </Button>
                  <VideoSlider
                    aria-label="desktop-progress-control"
                    min={0}
                    max={durationSeconds}
                    value={[
                      durationSeconds > 0
                        ? (progress / 100) * durationSeconds
                        : 0
                    ]}
                    onValueChange={handleSeekValueChange}
                    className="hidden h-[8.4px] md:flex [&>button]:h-[13px] [&>button]:w-[13px] [&>span]:h-[8.4px] [&>span>span]:h-[8.4px]"
                  />
                  {player != null && (
                    <div className="text-secondary-foreground z-[2] flex gap-1 text-sm">
                      <span className="font-sans">{currentTime ?? '0:00'}</span>
                      <span>/</span>
                      {duration === '0:00' ? (
                        <Skeleton className="bg-muted w-[27px]" />
                      ) : (
                        <span className="font-sans">{duration}</span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-row gap-2">
                    <div className="flex flex-row items-center gap-2 md:hidden">
                      <Button onClick={handleMute} variant="ghost" size="icon">
                        {mute || volume === 0 ? (
                          <VolumeX className="h-5 w-5" />
                        ) : volume > 60 ? (
                          <Volume2 className="h-5 w-5" />
                        ) : volume > 30 ? (
                          <Volume1 className="h-5 w-5" />
                        ) : (
                          <Volume className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    <div className="group hidden flex-row items-center gap-2 md:flex">
                      <VideoSlider
                        aria-label="volume-control"
                        min={0}
                        max={100}
                        value={[mute ? 0 : volume]}
                        onValueChange={handleVolumeValueChange}
                        className="w-0 opacity-0 transition-all duration-200 ease-out group-hover:w-[70px] group-hover:opacity-100 [&>button]:h-[10px] [&>button]:w-[10px] [&>span]:h-2 [&>span>span]:h-2"
                      />
                      <Button onClick={handleMute} variant="ghost" size="icon">
                        {mute || volume === 0 ? (
                          <VolumeX className="h-5 w-5" />
                        ) : volume > 60 ? (
                          <Volume2 className="h-5 w-5" />
                        ) : volume > 30 ? (
                          <Volume1 className="h-5 w-5" />
                        ) : (
                          <Volume className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={handleClick}
                      variant="ghost"
                      size="icon"
                      aria-label="select audio language"
                      data-testid="AudioLanguageButton"
                    >
                      <Globe className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={handleClick}
                      variant="ghost"
                      size="icon"
                      disabled={
                        variant?.subtitleCount === undefined ||
                        variant?.subtitleCount < 1
                      }
                    >
                      <Subtitles className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={handleFullscreen}
                      data-testid="FullscreenButton"
                      aria-pressed={fullscreen}
                      variant="ghost"
                      size="icon"
                    >
                      {fullscreen ? (
                        <Minimize className="h-5 w-5" />
                      ) : (
                        <Maximize className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
                {openLanguageSwitchDialog != null && (
                  <DynamicLanguageSwitchDialog
                    open={openLanguageSwitchDialog}
                    handleClose={() => setOpenLanguageSwitchDialog(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
