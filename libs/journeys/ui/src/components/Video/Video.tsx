import videojs, { VideoJsPlayer } from 'video.js'
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
  startAt = 0,
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
  const [player, setPlayer] = useState<VideoJsPlayer>()
  const {
    state: { selectedBlock }
  } = useEditor()
  const { blockHistory } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]

  const eventVideoTitle = video?.title[0].value ?? title
  const eventVideoId = video?.id ?? videoId

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
      setPlayer(
        videojs(videoRef.current, {
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
          // VideoJS blur background persists so we cover video when using png poster on non-autoplay videos
          poster: blurBackground
        })
      )
    }
  }, [startAt, endAt, muted, blurBackground])

  // Initiate video player listeners
  useEffect(() => {
    if (player != null) {
      if (selectedBlock === undefined) {
        player.on('ready', () => {
          player.currentTime(startAt ?? 0)
          // plays youTube videos at the start time
          if (source === VideoBlockSource.youTube && autoplay === true)
            void player?.play()
        })

        // Video jumps to new time and finishes loading - occurs on autoplay
        player.on('seeked', () => {
          if (autoplay === true) setLoading(false)
        })
        player.on('playing', () => {
          if (autoplay !== true) setLoading(false)
        })
        player.on('ended', () => {
          if (player.isFullscreen()) player.exitFullscreen()
        })
        player.on('timeupdate', () => {
          if (player != null) {
            if (
              action == null &&
              endAt != null &&
              player.currentTime() >= endAt
            ) {
              player.pause()
            }
          }
        })
      }
    }
  }, [player, selectedBlock, startAt, endAt, autoplay, action, source])

  const endTimes = children
    .filter((block) => block.__typename === 'VideoTriggerBlock')
    .map((block) => (block as VideoTriggerFields).triggerStart)
  const progressEndTime =
    player != null ? Math.min(...endTimes, endAt ?? player.duration()) : 0

  // Pause video if admin
  useEffect(() => {
    if (selectedBlock !== undefined && player != null) {
      player.pause()
    }
  }, [selectedBlock, player])

  // Pause video if card not active
  useEffect(() => {
    if (player != null) {
      if (isActiveBlockOrDescendant(blockId) && autoplay === true) {
        void player.play()
      } else {
        void player.pause()
      }
    }
  }, [activeBlock, blockId, autoplay, player])

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
    if (player != null) {
      if (source === VideoBlockSource.internal && video?.variant?.hls != null) {
        player.src({
          src: video.variant?.hls ?? '',
          type: 'application/x-mpegURL'
        })
      } else if (source === VideoBlockSource.youTube && videoId != null) {
        player.src({
          src: `https://www.youtube.com/watch?v=${videoId}`,
          type: 'video/youtube'
        })
      }
    }
  }, [player, video, videoId])

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
      {player != null && eventVideoTitle != null && eventVideoId != null && (
        <VideoEvents
          player={player}
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
          {player != null && (
            <VideoControls
              player={player}
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
                  player={player}
                  {...option}
                />
              )
          )}
          {/* Default navigate to next card on video end */}
          {action != null && endAt != null && endAt > 0 && (
            <VideoTrigger
              player={player}
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
