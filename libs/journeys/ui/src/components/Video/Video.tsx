// import videojs from 'video.js'
import dynamic from 'next/dynamic'

import {
  ReactElement,
  useEffect,
  useRef,
  useState,
  useMemo,
  CSSProperties
} from 'react'
import { NextImage } from '@core/shared/ui/NextImage'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import {
  VideoBlockObjectFit,
  VideoBlockSource
} from '../../../__generated__/globalTypes'
import {
  isActiveBlockOrDescendant,
  TreeBlock,
  useBlocks
} from '../../libs/block'
import { useEditor } from '../../libs/EditorProvider'
import { blurImage } from '../../libs/blurImage'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { VideoTrigger } from '../VideoTrigger'
import 'videojs-youtube'
import 'video.js/dist/video-js.css'
import { VideoEvents } from '../VideoEvents'
import { VideoFields } from './__generated__/VideoFields'

const videojs = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "videojs" */
      'video.js'
    )
)

const VIDEO_BACKGROUND_COLOR = '#000'
const VIDEO_FOREGROUND_COLOR = '#FFF'

export function Video({
  id: blockId,
  video,
  source,
  videoId,
  image,
  title,
  autoplay,
  startAt,
  endAt,
  muted,
  posterBlockId,
  children,
  action,
  objectFit
}: TreeBlock<VideoFields>): ReactElement {
  const [loading, setLoading] = useState(true)
  const theme = useTheme()
  const {
    state: { selectedBlock }
  } = useEditor()
  const { activeBlock } = useBlocks()

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()

  // const videoEnd = useMemo(() => {
  //   const videoTrigger = children.filter((child) => {
  //     return child.__typename === 'VideoTriggerBlock'
  //   })
  //   return (
  //     endAt ??
  //     (videoTrigger.length > 0
  //       ? (videoTrigger[0] as VideoTriggerFields).triggerStart
  //       : null)
  //   )
  // }, [endAt, children])

  const posterBlock = children.find(
    (block) => block.id === posterBlockId && block.__typename === 'ImageBlock'
  ) as TreeBlock<ImageFields> | undefined

  const blurBackground = useMemo(() => {
    return posterBlock != null
      ? blurImage(posterBlock.blurhash, theme.palette.background.paper)
      : undefined
  }, [posterBlock, theme])

  useEffect(() => {
    if (!isActiveBlockOrDescendant(blockId)) {
      playerRef.current?.pause()
    }
  }, [activeBlock])

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: autoplay === true,
        controls: true,
        nativeControlsForTouch: true,
        userActions: {
          hotkeys: true,
          doubleClick: true
        },

        inactivityTimeout: 0,
        controlBar: {
          playToggle: true,
          captionsButton: false,
          subtitlesButton: false,
          remainingTimeDisplay: false,
          progressControl: {
            seekBar: true
          },
          fullscreenToggle: true,
          volumePanel: {
            inline: false
          }
        },
        responsive: true,
        muted: muted === true,
        // VideoJS blur background persists so we cover video when using png poster on non-autoplay videos
        poster: blurBackground
      })

      playerRef.current.on('ready', () => {
        playerRef.current?.currentTime(startAt ?? 0)
        // plays youTube videos at the start time
        if (source === VideoBlockSource.youTube && autoplay === true)
          void playerRef.current?.play()
      })

      if (selectedBlock === undefined) {
        // Video jumps to new time and finishes loading - occurs on autoplay
        playerRef.current.on('seeked', () => {
          if (autoplay === true) setLoading(false)
        })
        playerRef.current.on('playing', () => {
          if (autoplay !== true) setLoading(false)
        })
        playerRef.current.on('ended', () => {
          if (playerRef?.current?.isFullscreen() === true)
            playerRef.current?.exitFullscreen()
        })
        playerRef.current.on('timeupdate', () => {
          // const start = startAt ?? 0
          // const end = videoEnd ?? playerRef.current?.duration() ?? 0
          // const currentTime = playerRef.current?.currentTime() ?? end

          // console.log(
          //   'current time',
          //   start,
          //   endAt,
          //   end,
          //   playerRef.current?.currentTime()
          // )
          // const progression = ((currentTime - start) / (end - start)) * 100

          // console.log(
          //   'width',
          //   playerRef.current?.controlBar.children_[5]
          //     .el()
          //     .getElementsByClassName('vjs-play-progress vjs-slider-bar')[0]
          //     .style.width.slice(0, -1)
          // )

          if (playerRef.current != null) {
            if (
              action == null &&
              endAt != null &&
              playerRef.current.currentTime() >= endAt
            ) {
              playerRef.current.pause()
            }
          }
        })
      }
    }
  }, [
    startAt,
    endAt,
    muted,
    autoplay,
    action,
    blockId,
    posterBlock,
    selectedBlock,
    blurBackground,
    source
  ])

  useEffect(() => {
    if (selectedBlock !== undefined) {
      playerRef.current?.pause()
    }
  }, [selectedBlock])

  const eventVideoTitle = video?.title[0].value ?? title
  const eventVideoId = video?.id ?? videoId

  const videoImage = source === VideoBlockSource.internal ? video?.image : image

  let videoFit: CSSProperties['objectFit']
  if (source === VideoBlockSource.youTube) {
    videoFit = 'contain'
  } else {
    switch (objectFit) {
      case VideoBlockObjectFit.fill:
        videoFit = 'cover'
        break
      case VideoBlockObjectFit.fit:
        videoFit = 'contain'
        break
      case VideoBlockObjectFit.zoomed:
        videoFit = 'contain'
        break
      default:
        videoFit = 'cover'
        break
    }
  }

  return (
    <Box
      data-testid={`video-${blockId}`}
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        minHeight: 'inherit',
        backgroundColor: VIDEO_BACKGROUND_COLOR,
        // borderRadius: { xs: 0, sm: 4 },
        borderRadius: 0,
        overflow: 'hidden',
        m: 0,
        position: 'absolute',
        top: 0,
        right: 0,
        '> .video-js': {
          width: '100%',
          display: 'flex',
          alignSelf: 'center',
          height: '100%',
          minHeight: 'inherit',
          '> .vjs-tech': {
            objectFit: videoFit,
            transform:
              objectFit === VideoBlockObjectFit.zoomed
                ? 'scale(1.33)'
                : undefined
          },
          '> .vjs-loading-spinner': {
            zIndex: 1,
            display: source === VideoBlockSource.youTube ? 'none' : 'block'
          },
          '> .vjs-poster': {
            backgroundColor: VIDEO_BACKGROUND_COLOR,
            backgroundSize: 'cover'
          },
          '.vjs-control-bar': {
            backgroundColor: 'transparent',
            height: 'auto'
            // top: '0'
          },
          '.vjs-play-control': {
            display: 'none'
          },
          '.vjs-volume-panel': {
            display: 'none'
          },
          '.vjs-remaining-time': {
            display: 'none'
          },
          '.vjs-picture-in-picture-control': {
            display: 'none'
          },
          '.vjs-fullscreen-control': {
            display: 'none'
          },
          '.vjs-progress-control': {
            '.vjs-progress-holder': {
              m: 0,
              height: '6px'
            },
            '.vjs-play-progress': {
              '::before': {
                content: '""'
              }
            },
            '.vjs-load-progress': {
              display: 'none'
            }
          }
        },
        '> .MuiIconButton-root': {
          color: VIDEO_FOREGROUND_COLOR,
          position: 'absolute',
          bottom: 12,
          zIndex: 1,
          '&:hover': {
            color: VIDEO_FOREGROUND_COLOR
          }
        },
        // renders big play button for youtube videos on iOS devices
        'video::-webkit-media-controls-start-playback-button': {
          display: 'none'
        },
        '> .video-js.vjs-controls-enabled .vjs-big-play-button': {
          display: 'none'
        },
        '> .video-js.vjs-controls-enabled.vjs-paused .vjs-big-play-button': {
          display: 'block',
          border: 'none',
          backgroundColor: 'transparent',
          fontSize: '80px',
          '.vjs-icon-placeholder': {
            display: { xs: 'none', md: 'block' }
          }
        }
      }}
    >
      {playerRef.current != null &&
        eventVideoTitle != null &&
        eventVideoId != null && (
          <VideoEvents
            player={playerRef.current}
            blockId={blockId}
            videoTitle={eventVideoTitle}
            source={source}
            videoId={eventVideoId}
            startAt={startAt}
            endAt={endAt}
          />
        )}
      {videoId != null ? (
        <>
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            playsInline
          >
            {source === VideoBlockSource.internal &&
              video?.variant?.hls != null && (
                <source src={video.variant.hls} type="application/x-mpegURL" />
              )}
            {source === VideoBlockSource.youTube && (
              <source
                src={`https://www.youtube.com/watch?v=${videoId}`}
                type="video/youtube"
              />
            )}
          </video>
          {children?.map(
            (option) =>
              option.__typename === 'VideoTriggerBlock' && (
                <VideoTrigger player={playerRef.current} {...option} />
              )
          )}
          {action != null && endAt != null && endAt > 0 && (
            <VideoTrigger
              player={playerRef.current}
              triggerStart={endAt}
              triggerAction={action}
            />
          )}
        </>
      ) : (
        <>
          <Paper
            sx={{
              backgroundColor: 'transparent',
              borderRadius: { xs: 0, sm: 4 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              fontSize: 100,
              zIndex: 1,
              outline:
                selectedBlock?.id === blockId ? '3px solid #C52D3A' : 'none',
              outlineOffset: '-3px'
            }}
            elevation={0}
            variant="outlined"
          >
            <VideocamRounded
              fontSize="inherit"
              sx={{
                color: VIDEO_FOREGROUND_COLOR,
                filter: `drop-shadow(-1px 0px 5px ${VIDEO_BACKGROUND_COLOR})`
              }}
            />
          </Paper>
        </>
      )}
      {/* Video Image  */}
      {videoImage != null && posterBlock?.src == null && loading && (
        <NextImage
          src={videoImage}
          alt="video image"
          layout="fill"
          objectFit="cover"
        />
      )}
      {/* Lazy load higher res poster */}
      {posterBlock?.src != null && loading && (
        <NextImage
          src={posterBlock.src}
          alt={posterBlock.alt}
          placeholder={blurBackground != null ? 'blur' : 'empty'}
          blurDataURL={blurBackground}
          layout="fill"
          objectFit="cover"
        />
      )}
    </Box>
  )
}
