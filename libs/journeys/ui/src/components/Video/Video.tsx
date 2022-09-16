import videojs from 'video.js'
import { ReactElement, useEffect, useRef, useState, useMemo } from 'react'
import { NextImage } from '@core/shared/ui/NextImage'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import { VideoBlockSource } from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { useEditor } from '../../libs/EditorProvider'
import { blurImage } from '../../libs/blurImage'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { VideoTrigger } from '../VideoTrigger'
import 'videojs-youtube'
import 'video.js/dist/video-js.css'
import { VideoEvents } from '../VideoEvents'
import { VideoFields } from './__generated__/VideoFields'

const VIDEO_BACKGROUND_COLOR = '#000'
const VIDEO_FOREGROUND_COLOR = '#FFF'

export function Video({
  id: blockId,
  video,
  source,
  videoId,
  title,
  autoplay,
  startAt,
  endAt,
  muted,
  posterBlockId,
  children,
  action
}: TreeBlock<VideoFields>): ReactElement {
  const [loading, setLoading] = useState(true)
  const theme = useTheme()
  const {
    state: { selectedBlock }
  } = useEditor()
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()

  const posterBlock = children.find(
    (block) => block.id === posterBlockId && block.__typename === 'ImageBlock'
  ) as TreeBlock<ImageFields> | undefined

  const blurBackground = useMemo(() => {
    return posterBlock != null
      ? blurImage(posterBlock.blurhash, theme.palette.background.paper)
      : undefined
  }, [posterBlock, theme])

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
        controlBar: {
          playToggle: true,
          captionsButton: true,
          subtitlesButton: true,
          remainingTimeDisplay: true,
          progressControl: {
            seekBar: true
          },
          fullscreenToggle: true,
          volumePanel: {
            inline: true
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
          playerRef.current?.play()
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

  return (
    <Box
      data-testid={`video-${blockId}`}
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        minHeight: 'inherit',
        backgroundColor: VIDEO_BACKGROUND_COLOR,
        borderRadius: 4,
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
            objectFit: 'cover'
          },
          '> .vjs-loading-spinner': {
            zIndex: 1
          },
          '> .vjs-big-play-button': {
            zIndex: 1
          },
          '> .vjs-poster': {
            backgroundColor: VIDEO_BACKGROUND_COLOR,
            backgroundSize: 'cover'
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
              borderRadius: (theme) => theme.spacing(4),
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
      {/* Lazy load higher res poster */}
      {posterBlock?.src != null && loading && (
        <NextImage
          src={posterBlock.src}
          alt={posterBlock.alt}
          placeholder={blurBackground != null ? 'blur' : 'empty'}
          blurDataURL={blurBackground ?? posterBlock.src}
          layout="fill"
          objectFit="cover"
        />
      )}
    </Box>
  )
}
