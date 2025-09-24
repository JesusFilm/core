import FullscreenExitOutlined from '@mui/icons-material/FullscreenExitOutlined'
import FullscreenOutlined from '@mui/icons-material/FullscreenOutlined'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import SubtitlesOutlined from '@mui/icons-material/SubtitlesOutlined'
import VolumeDownOutlined from '@mui/icons-material/VolumeDownOutlined'
import VolumeMuteOutlined from '@mui/icons-material/VolumeMuteOutlined'
import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { sendGTMEvent } from '@next/third-parties/google'
import fscreen from 'fscreen'
import debounce from 'lodash/debounce'
import last from 'lodash/last'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { MouseEventHandler, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { isMobile } from '@core/shared/ui/deviceUtils'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { usePlayer } from '../../../../../libs/playerContext'
import { useVideo } from '../../../../../libs/videoContext'
import { useLanguageActions } from '../../../../../libs/watchContext'
import { HeroOverlay } from '../../../../HeroOverlay/HeroOverlay'
import { AudioLanguageButton } from '../../../AudioLanguageButton'
import { VideoTitle } from '../VideoTitle'

import { handleVideoTitleClick } from './utils/handleVideoTitleClick'

const DynamicLanguageSwitchDialog = dynamic<{
  open: boolean
  handleClose: () => void
}>(
  async () =>
    await import(
      /* webpackChunkName: "LanguageSwitchDialog" */
      '../../../../LanguageSwitchDialog'
    ).then((mod) => mod.LanguageSwitchDialog),
  {
    ssr: false,
    loading: () => <Box role="dialog" aria-label="Language Settings" />
  }
)

interface VideoControlProps {
  player?: Player
  onVisibleChanged?: (active: boolean) => void
  isPreview?: boolean
  onMuteToggle?: (isMuted: boolean) => void
  customDuration?: number
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
  customDuration
}: VideoControlProps): ReactElement {
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
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
  const videoLabel = label?.replace(/_/g, ' ')
  const videoDescription = last(description)?.value
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
    const percent = durationSeconds > 0 ? Math.round((player?.currentTime() ?? 0) / durationSeconds * 100) : 0
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
        durationSeconds > 0 ? Math.round(
          ((player?.currentTime() ?? 0) / durationSeconds) * 100
        ) : 0
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
        durationSeconds > 0 ? Math.round(
          ((player?.currentTime() ?? 0) / durationSeconds) * 100
        ) : 0
      )
    }
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
        durationSeconds > 0 ? Math.round(
          ((player?.currentTime() ?? 0) / durationSeconds) * 100
        ) : 0
      )
    }
    dispatchPlayer({
      type: 'SetPlay',
      play: false
    })
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
      progress: durationSeconds > 0 ? Math.round(
        ((player?.currentTime() ?? 0) / durationSeconds) * 100
      ) : 0
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

  const handleUserActive = useCallback(() =>
    dispatchPlayer({
      type: 'SetActive',
      active: true
    }), [dispatchPlayer])

  const handleUserInactive = useCallback(() =>
    dispatchPlayer({
      type: 'SetActive',
      active: false
    }), [dispatchPlayer])

  const handleWaiting = useCallback(() =>
    dispatchPlayer({
      type: 'SetLoading',
      loading: true
    }), [dispatchPlayer])

  const handlePlaying = useCallback(() => {
    setInitialLoadComplete(true)
    dispatchPlayer({
      type: 'SetLoading',
      loading: false
    })
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
        durationSeconds > 0 ? Math.round(
          ((player?.currentTime() ?? 0) / durationSeconds) * 100
        ) : 0
      )
  }, [player, id, variant, title, durationSeconds])

  const handleCanPlay = useCallback(() =>
    dispatchPlayer({
      type: 'SetLoading',
      loading: false
    }), [dispatchPlayer])

  const handleCanPlayThrough = useCallback(() =>
    dispatchPlayer({
      type: 'SetLoading',
      loading: false
    }), [dispatchPlayer])


  useEffect(() => {
    dispatchPlayer({
      type: 'SetVolume',
      volume: (player?.volume() ?? 1) * 100
    })

    // Attach handlers
    player?.on('play', handlePlay)
    player?.on('pause', handlePause)
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
          durationSeconds > 0 ? Math.round(
            ((player?.currentTime() ?? 0) / durationSeconds) * 100
          ) : 0
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
          durationSeconds > 0 ? Math.round(
            ((player?.currentTime() ?? 0) / durationSeconds) * 100
          ) : 0
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
      player?.off('play', handlePlay)
      player?.off('pause', handlePause)
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
    handleTimeUpdate,
    handleVolumeChange,
    handleFullscreenChange,
    handleUserActive,
    handleUserInactive,
    handleWaiting,
    handlePlaying,
    handleEnded,
    handleCanPlay,
    handleCanPlayThrough
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
      dispatchPlayer({
        type: 'SetProgress',
        progress: value
      })
      player?.currentTime(value)
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
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        cursor: visible ? undefined : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 2
      }}
      onClick={getClickHandler(handlePlay, () => {
        void handleFullscreen()
      })}
      onMouseMove={() => player?.userActive(true)}
      data-testid="VideoControls"
    >
      {!loading || isPreview ? (
        <div className="responsive-container">
          <VideoTitle
            videoTitle={videoTitle}
            variant="unmute"
            showButton
            isPreview={isPreview}
            videoLabel={videoLabel}
            videoDescription={videoDescription}
            containerSlug={containerSlug}
            collectionTitle={collectionTitle}
            onMuteToggle={() => {
              handleMute()
            }}
            onClick={(e) => {
              e.stopPropagation()
              handleVideoTitleClick({
                player,
                dispatch: dispatchPlayer,
                mute,
                volume,
                play
              })
            }}
          />
        </div>
      ) : null}
      {loading && !isPreview && (
        <>
          <Box
            sx={{
              display: 'flex',
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '104px',
              zIndex: 2
            }}
          >
            <CircularProgress size={65} />
          </Box>
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
          <Container maxWidth="xxl" sx={{ zIndex: 2 }}>
            <VideoTitle
              showButton={!initialLoadComplete}
              videoTitle={videoTitle}
              isPreview={isPreview}
              videoLabel={videoLabel}
              videoDescription={videoDescription}
              containerSlug={containerSlug}
              collectionTitle={collectionTitle}
              onMuteToggle={() => {
                handleMute()
              }}
              onClick={(e) => {
                e.stopPropagation()
                handleVideoTitleClick({
                  player,
                  dispatch: dispatchPlayer,
                  mute,
                  volume,
                  play
                })
              }}
            />
          </Container>
          <Box
            sx={{
              zIndex: 0,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          >
            <HeroOverlay />
          </Box>
        </>
      )}
      {!isPreview && (
        <Fade
          in={visible}
          style={{
            transitionDelay: visible ? undefined : '2s',
            transitionDuration: '225ms'
          }}
          timeout={{ exit: 2225 }}
        >
          <Box>
            <Box
              sx={{
                background:
                  'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%)'
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <Container
                data-testid="vjs-jfp-custom-controls"
                maxWidth="xxl"
                sx={{
                  zIndex: 5,
                  pb: 4,
                  transitionDelay: visible ? undefined : '0.5s'
                }}
              >
                <Slider
                  aria-label="mobile-progress-control"
                  min={0}
                  max={durationSeconds}
                  value={progress}
                  valueLabelFormat={(value) => {
                    return secondsToTimeFormat(value, { trimZeroes: true })
                  }}
                  valueLabelDisplay="auto"
                  onChange={handleSeek}
                  sx={{
                    height: 8.4,
                    display: { xs: 'flex', md: 'none' },
                    '& .MuiSlider-thumb': {
                      width: 13,
                      height: 13
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'secondary.main'
                    }
                  }}
                />
                <Stack
                  direction="row"
                  gap={5}
                  justifyContent={{ xs: 'space-between', md: 'none' }}
                  alignItems="center"
                  className="responsive-container"
                >
                  <IconButton
                    id={play ? 'pause-button' : 'play-button'}
                    onClick={handlePlay}
                    sx={{ display: { xs: 'none', md: 'flex' } }}
                  >
                    {!play ? (
                      <PlayArrowRounded fontSize="large" />
                    ) : (
                      <PauseRounded fontSize="large" />
                    )}
                  </IconButton>
                  <Slider
                    aria-label="desktop-progress-control"
                    min={0}
                    max={durationSeconds}
                    value={progress}
                    valueLabelFormat={(value) => {
                      return secondsToTimeFormat(value, { trimZeroes: true })
                    }}
                    valueLabelDisplay="auto"
                    onChange={handleSeek}
                    sx={{
                      height: 8.4,
                      display: { xs: 'none', md: 'flex' },
                      '& .MuiSlider-thumb': {
                        width: 13,
                        height: 13
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: 'secondary.main'
                      }
                    }}
                  />
                  {player != null && (
                    <Typography
                      variant="body2"
                      color="secondary.contrastText"
                      sx={{ display: 'flex', gap: 1, zIndex: 2 }}
                    >
                      <span className="font-sans">{currentTime ?? '0:00'}</span>
                      <span>/</span>
                      {duration === '0:00' ? (
                        <Skeleton width={27} sx={{ bgcolor: 'grey.800' }} />
                      ) : (
                        <span className="font-sans">{duration}</span>
                      )}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={2}>
                    <Stack
                      alignItems="center"
                      spacing={2}
                      direction="row"
                      sx={{
                        display: { xs: 'flex', md: 'none' }
                      }}
                    >
                      <IconButton onClick={handleMute}>
                        {mute || volume === 0 ? (
                          <VolumeOffOutlined />
                        ) : volume > 60 ? (
                          <VolumeUpOutlined />
                        ) : volume > 30 ? (
                          <VolumeDownOutlined />
                        ) : (
                          <VolumeMuteOutlined />
                        )}
                      </IconButton>
                    </Stack>
                    <Stack
                      alignItems="center"
                      spacing={2}
                      direction="row"
                      sx={{
                        display: { xs: 'none', md: 'flex' },
                        '> .MuiSlider-root': {
                          width: 0,
                          opacity: 0,
                          transition: 'all 0.2s ease-out'
                        },
                        '&:hover': {
                          '> .MuiSlider-root': {
                            width: 70,
                            opacity: 1
                          }
                        }
                      }}
                    >
                      <IconButton onClick={handleMute}>
                        {mute || volume === 0 ? (
                          <VolumeOffOutlined />
                        ) : volume > 60 ? (
                          <VolumeUpOutlined />
                        ) : volume > 30 ? (
                          <VolumeDownOutlined />
                        ) : (
                          <VolumeMuteOutlined />
                        )}
                      </IconButton>
                      <Slider
                        aria-label="volume-control"
                        min={0}
                        max={100}
                        value={mute ? 0 : volume}
                        valueLabelFormat={(value) => {
                          return `${value}%`
                        }}
                        valueLabelDisplay="auto"
                        onChange={handleVolume}
                        sx={{
                          width: 70,
                          '& .MuiSlider-thumb': {
                            width: 10,
                            height: 10
                          },
                          '& .MuiSlider-rail': {
                            backgroundColor: 'secondary.main'
                          }
                        }}
                      />
                    </Stack>
                    <AudioLanguageButton componentVariant="icon" />
                    <IconButton
                      onClick={handleClick}
                      disabled={
                        variant?.subtitleCount === undefined ||
                        variant?.subtitleCount < 1
                      }
                    >
                      <SubtitlesOutlined />
                    </IconButton>
                    <IconButton
                      onClick={handleFullscreen}
                      data-testid="FullscreenButton"
                      aria-pressed={fullscreen}
                    >
                      {fullscreen ? (
                        <FullscreenExitOutlined />
                      ) : (
                        <FullscreenOutlined />
                      )}
                    </IconButton>
                  </Stack>
                </Stack>
                {openLanguageSwitchDialog != null && (
                  <DynamicLanguageSwitchDialog
                    open={openLanguageSwitchDialog}
                    handleClose={() => setOpenLanguageSwitchDialog(false)}
                  />
                )}
              </Container>
            </Box>
          </Box>
        </Fade>
      )}
    </Box>
  )
}
