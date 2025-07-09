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
import dynamic from 'next/dynamic'
import Image from 'next/image'
import {
  MouseEventHandler,
  ReactElement,
  useCallback,
  useEffect,
  useState
} from 'react'
import Player from 'video.js/dist/types/player'

import { isMobile } from '@core/shared/ui/deviceUtils'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { usePlayer } from '../../../../../libs/playerContext'
import { useVideo } from '../../../../../libs/videoContext'
import { HeroOverlay } from '../../../../HeroOverlay/HeroOverlay'
import { SubtitleDialogProps } from '../../../../SubtitleDialog/SubtitleDialog'
import { AudioLanguageButton } from '../../../AudioLanguageButton'
import { VideoTitle } from '../VideoTitle'

import { handleVideoTitleClick } from './utils/handleVideoTitleClick'

const DynamicSubtitleDialog = dynamic<SubtitleDialogProps>(
  async () =>
    await import(
      /* webpackChunkName: "SubtitleDialog" */
      '../../../../SubtitleDialog'
    ).then((mod) => mod.SubtitleDialog)
)

interface VideoControlProps {
  player: Player
  onVisibleChanged?: (active: boolean) => void
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
  onVisibleChanged
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
      openSubtitleDialog,
      loadSubtitleDialog,
      duration,
      durationSeconds,
      progressPercentNotYetEmitted
    },
    dispatch
  } = usePlayer()

  const { id, title, variant, images, imageAlt } = useVideo()
  const visible = !play || active || loading

  const videoTitle = title?.[0]?.value ?? ''

  useEffect(() => {
    onVisibleChanged?.(!play || active || loading)
  }, [play, active, loading, onVisibleChanged])

  // Set duration from variant data instead of trying to detect from HLS stream
  useEffect(() => {
    if (variant?.duration != null && variant.duration > 0) {
      const roundedDuration = Math.round(variant.duration)
      dispatch({
        type: 'SetDurationSeconds',
        durationSeconds: roundedDuration
      })
      dispatch({
        type: 'SetDuration',
        duration: secondsToTimeFormat(roundedDuration, { trimZeroes: true })
      })
    } else {
      // Fallback to player detection for edge cases
      let retryCount = 0
      const maxRetries = 3
      let retryTimeout: NodeJS.Timeout | undefined

      const updateDuration = (state: string): void => {
        const playerDuration = player.duration()

        if (
          playerDuration != null &&
          !isNaN(playerDuration) &&
          playerDuration > 0
        ) {
          const roundedDuration = Math.round(playerDuration)
          dispatch({
            type: 'SetDurationSeconds',
            durationSeconds: roundedDuration
          })
          dispatch({
            type: 'SetDuration',
            duration: secondsToTimeFormat(roundedDuration, { trimZeroes: true })
          })
          if (retryTimeout) {
            clearTimeout(retryTimeout)
            retryTimeout = undefined
          }
        } else if (playerDuration === Infinity) {
          dispatch({
            type: 'SetDurationSeconds',
            durationSeconds: 0
          })
          dispatch({
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
      events.forEach((event) => {
        player.on(event, () => updateDuration(event))
      })

      updateDuration('initial')

      return () => {
        if (retryTimeout) {
          clearTimeout(retryTimeout)
        }
        events.forEach((event) => {
          player.off(event, updateDuration)
        })
      }
    }
  }, [player, variant?.duration])

  useEffect(() => {
    if ((progress / durationSeconds) * 100 > progressPercentNotYetEmitted[0]) {
      eventToDataLayer(
        `video_time_update_${progressPercentNotYetEmitted[0]}`,
        id,
        variant?.language.id,
        title[0].value,
        variant?.language?.name.find(({ primary }) => !primary)?.value ??
          variant?.language?.name[0]?.value,
        Math.round(player.currentTime() ?? 0),
        Math.round((progress / durationSeconds) * 100)
      )
      const [, ...rest] = progressPercentNotYetEmitted
      dispatch({
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
    variant,
    player
  ])

  useEffect(() => {
    dispatch({
      type: 'SetVolume',
      volume: (player.volume() ?? 1) * 100
    })
    player.on('play', () => {
      if ((player.currentTime() ?? 0) < 0.02) {
        eventToDataLayer(
          'video_start',
          id,
          variant?.language.id,
          title[0].value,
          variant?.language?.name.find(({ primary }) => !primary)?.value ??
            variant?.language?.name[0]?.value,
          Math.round(player.currentTime() ?? 0),
          Math.round(
            ((player.currentTime() ?? 0) / (player.duration() ?? 1)) * 100
          )
        )
      } else {
        eventToDataLayer(
          'video_play',
          id,
          variant?.language.id,
          title[0].value,
          variant?.language?.name.find(({ primary }) => !primary)?.value ??
            variant?.language?.name[0]?.value,
          Math.round(player.currentTime() ?? 0),
          Math.round(
            ((player.currentTime() ?? 0) / (player.duration() ?? 1)) * 100
          )
        )
      }
      dispatch({
        type: 'SetPlay',
        play: true
      })
    })
    player.on('pause', () => {
      if ((player.currentTime() ?? 0) > 0.02) {
        eventToDataLayer(
          'video_pause',
          id,
          variant?.language.id,
          title[0].value,
          variant?.language?.name.find(({ primary }) => !primary)?.value ??
            variant?.language?.name[0]?.value,
          Math.round(player.currentTime() ?? 0),
          Math.round(
            ((player.currentTime() ?? 0) / (player.duration() ?? 1)) * 100
          )
        )
      }
      dispatch({
        type: 'SetPlay',
        play: false
      })
    })
    player.on('timeupdate', () => {
      dispatch({
        type: 'SetCurrentTime',
        currentTime: secondsToTimeFormat(player.currentTime() ?? 0, {
          trimZeroes: true
        })
      })
      dispatch({
        type: 'SetProgress',
        progress: Math.round(player.currentTime() ?? 0)
      })
    })
    player.on('volumechange', () => {
      dispatch({
        type: 'SetMute',
        mute: player.muted() ?? false
      })
      dispatch({
        type: 'SetVolume',
        volume: (player.volume() ?? 1) * 100
      })
    })
    player.on('fullscreenchange', () => {
      dispatch({
        type: 'SetFullscreen',
        fullscreen: player.isFullscreen() ?? false
      })
    })
    player.on('useractive', () =>
      dispatch({
        type: 'SetActive',
        active: true
      })
    )
    player.on('userinactive', () =>
      dispatch({
        type: 'SetActive',
        active: false
      })
    )
    player.on('waiting', () =>
      dispatch({
        type: 'SetLoading',
        loading: true
      })
    )
    player.on('playing', () => {
      setInitialLoadComplete(true)
      dispatch({
        type: 'SetLoading',
        loading: false
      })
    })
    player.on('ended', () => {
      eventToDataLayer(
        'video_ended',
        id,
        variant?.language.id,
        title[0].value,
        variant?.language?.name.find(({ primary }) => !primary)?.value ??
          variant?.language?.name[0]?.value,
        Math.round(player.currentTime() ?? 0),
        Math.round(
          ((player.currentTime() ?? 0) / (player.duration() ?? 1)) * 100
        )
      )
    })
    player.on('canplay', () =>
      dispatch({
        type: 'SetLoading',
        loading: false
      })
    )
    player.on('canplaythrough', () =>
      dispatch({
        type: 'SetLoading',
        loading: false
      })
    )
    fscreen.addEventListener('fullscreenchange', () => {
      if (fscreen.fullscreenElement != null) {
        eventToDataLayer(
          'video_enter_full_screen',
          id,
          variant?.language.id,
          title[0].value,
          variant?.language?.name.find(({ primary }) => !primary)?.value ??
            variant?.language?.name[0]?.value,
          Math.round(player.currentTime() ?? 0),
          Math.round(
            ((player.currentTime() ?? 0) / (player.duration() ?? 1)) * 100
          )
        )
      } else {
        eventToDataLayer(
          'video_exit_full_screen',
          id,
          variant?.language.id,
          title[0].value,
          variant?.language?.name.find(({ primary }) => !primary)?.value ??
            variant?.language?.name[0]?.value,
          Math.round(player.currentTime() ?? 0),
          Math.round(
            ((player.currentTime() ?? 0) / (player.duration() ?? 1)) * 100
          )
        )
      }
      dispatch({
        type: 'SetFullscreen',
        fullscreen: fscreen.fullscreenElement != null
      })
    })
  }, [id, player, dispatch, loading, title, variant])

  function handlePlay(): void {
    if (!play) {
      void player.play()
    } else {
      void player.pause()
    }
  }

  async function handleFullscreen(): Promise<void> {
    if (fullscreen) {
      fscreen.exitFullscreen()
      dispatch({
        type: 'SetFullscreen',
        fullscreen: false
      })
    } else {
      if (isMobile()) {
        void player.requestFullscreen()
        dispatch({
          type: 'SetFullscreen',
          fullscreen: true
        })
      } else {
        await fscreen.requestFullscreen(document.documentElement)
        dispatch({
          type: 'SetFullscreen',
          fullscreen: true
        })
      }
    }
  }

  function handleSeek(_event: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      dispatch({
        type: 'SetProgress',
        progress: value
      })
      player.currentTime(value)
    }
  }

  function handleMute(): void {
    player.muted(!mute)
    dispatch({
      type: 'SetMute',
      mute: !mute
    })
  }

  function handleVolume(_event: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      if (mute === true) handleMute()
      dispatch({
        type: 'SetVolume',
        volume: value
      })
      player.volume(value / 100)
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
    dispatch({
      type: 'SetOpenSubtitleDialog',
      openSubtitleDialog: true
    })
    dispatch({
      type: 'SetLoadSubtitleDialog',
      loadSubtitleDialog: true
    })
  }

  const handleSubtitleDialogClose = useCallback(() => {
    dispatch({
      type: 'SetOpenSubtitleDialog',
      openSubtitleDialog: false
    })
  }, [dispatch])

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        cursor: visible ? undefined : 'none',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }}
      onClick={getClickHandler(handlePlay, () => {
        void handleFullscreen()
      })}
      onMouseMove={() => player.userActive(true)}
      data-testid="VideoControls"
    >
      {!loading ? (
        <Container maxWidth="xxl" sx={{ zIndex: 2 }}>
          <VideoTitle
            videoTitle={videoTitle}
            variant="unmute"
            showButton
            onClick={(e) => {
              e.stopPropagation()
              handleVideoTitleClick({
                player,
                dispatch,
                mute,
                volume,
                play
              })
            }}
          />
        </Container>
      ) : (
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
              onClick={(e) => {
                e.stopPropagation()
                handleVideoTitleClick({
                  player,
                  dispatch,
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
                    <span>
                      <p className="font-sans">{currentTime ?? '0:00'}</p>
                    </span>
                    <span>/</span>
                    {duration === '0:00' ? (
                      <Skeleton width={27} sx={{ bgcolor: 'grey.800' }} />
                    ) : (
                      <span>
                        <p className="font-sans">{duration}</p>
                      </span>
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
                  >
                    {fullscreen ? (
                      <FullscreenExitOutlined />
                    ) : (
                      <FullscreenOutlined />
                    )}
                  </IconButton>
                </Stack>
              </Stack>
              {loadSubtitleDialog && (
                <DynamicSubtitleDialog
                  open={openSubtitleDialog}
                  player={player}
                  onClose={handleSubtitleDialogClose}
                />
              )}
            </Container>
          </Box>
        </Box>
      </Fade>
    </Box>
  )
}
