import videojs from 'video.js'
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
import { useTheme, styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import { VideoControls } from '@core/shared/ui/VideoControls'
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
import { VideoTriggerFields } from '../VideoTrigger/__generated__/VideoTriggerFields'
import { VideoFields } from './__generated__/VideoFields'

const VIDEO_BACKGROUND_COLOR = '#000'
const VIDEO_FOREGROUND_COLOR = '#FFF'

const StyledVideo = styled('video')(() => ({}))

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
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const { treeBlocks, activeBlock } = useBlocks()

  const eventVideoTitle = video?.title[0].value ?? title
  const eventVideoId = video?.id ?? videoId

  const endTimes = children
    .filter((block) => block.__typename === 'VideoTriggerBlock')
    .map((block) => (block as VideoTriggerFields).triggerStart)
  const progressEndTime = Math.min(
    ...endTimes,
    endAt ?? playerRef.current?.duration()
  )

  // Pause video if admin
  const {
    state: { selectedBlock }
  } = useEditor()
  useEffect(() => {
    if (selectedBlock !== undefined) {
      playerRef.current?.pause()
    }
  }, [selectedBlock])

  // Pause video if card not active
  useEffect(() => {
    if (isActiveBlockOrDescendant(blockId) && autoplay === true) {
      void playerRef.current?.play()
    } else {
      void playerRef.current?.pause()
    }
  }, [activeBlock, blockId, autoplay, treeBlocks])

  // Setup poster image
  const posterBlock = children.find(
    (block) => block.id === posterBlockId && block.__typename === 'ImageBlock'
  ) as TreeBlock<ImageFields> | undefined

  const videoImage = source === VideoBlockSource.internal ? video?.image : image

  const blurBackground = useMemo(() => {
    return posterBlock != null
      ? blurImage(posterBlock.blurhash, theme.palette.background.paper)
      : undefined
  }, [posterBlock, theme])

  // Initiate video player
  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        controls: false,
        controlBar: false,
        bigPlayButton: false,
        // Make video fill container instead of set aspect ratio
        fill: true,
        userActions: {
          hotkeys: true,
          doubleClick: true
        },
        responsive: true,
        muted: muted === true,
        startAt,
        endAt,
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

  // Set video layout
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

  //  Set video src
  useEffect(() => {
    if (playerRef.current != null) {
      if (source === VideoBlockSource.internal && video?.variant?.hls != null) {
        playerRef.current.src({
          src: video.variant?.hls ?? '',
          type: 'application/x-mpegURL'
        })
      } else if (source === VideoBlockSource.youTube && videoId != null) {
        playerRef.current.src({
          src: `https://www.youtube.com/watch?v=${videoId}`,
          type: 'video/youtube'
        })
      }
    }
  }, [playerRef, video, videoId])

  return (
    <Box
      data-testid={`video-${blockId}`}
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        minHeight: 'inherit',
        backgroundColor: VIDEO_BACKGROUND_COLOR,
        overflow: 'hidden',
        m: 0,
        position: 'absolute',
        top: 0,
        right: 0,
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
            source={source}
            videoId={eventVideoId}
            startAt={startAt}
            endAt={endAt}
          />
        )}
      {videoId != null ? (
        <>
          <StyledVideo
            ref={videoRef}
            className="video-js"
            playsInline
            sx={{
              '> .vjs-tech': {
                objectFit: videoFit,
                transform:
                  objectFit === VideoBlockObjectFit.zoomed
                    ? 'scale(1.33)'
                    : undefined
              },
              '> .vjs-poster': {
                backgroundColor: VIDEO_BACKGROUND_COLOR,
                backgroundSize: 'cover'
              }
            }}
          />
          {playerRef.current != null && (
            <VideoControls
              player={playerRef.current}
              startAt={startAt ?? 0}
              endAt={progressEndTime}
              isYoutube={source === VideoBlockSource.youTube}
            />
          )}
          {/* Trigger action on video midway */}
          {children?.map(
            (option) =>
              option.__typename === 'VideoTriggerBlock' && (
                <VideoTrigger
                  key={`video-trigger-${option.id}`}
                  player={playerRef.current}
                  {...option}
                />
              )
          )}
          {/* Default navigate to next card on video end */}
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
