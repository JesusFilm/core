import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
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
import { useTheme, styled, ThemeProvider } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import {
  VideoBlockObjectFit,
  VideoBlockSource
} from '../../../__generated__/globalTypes'
import { TreeBlock, useBlocks } from '../../libs/block'
import { useEditor } from '../../libs/EditorProvider'
import { blurImage } from '../../libs/blurImage'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { VideoTrigger } from '../VideoTrigger'
import 'videojs-youtube'
import 'video.js/dist/video-js.css'
import { VideoEvents } from '../VideoEvents'
import { VideoTriggerFields } from '../VideoTrigger/__generated__/VideoTriggerFields'
import { VideoControls } from './VideoControls'
import { VideoFields } from './__generated__/VideoFields'

const VIDEO_BACKGROUND_COLOR = '#000'
const VIDEO_FOREGROUND_COLOR = '#FFF'

const StyledVideo = styled('video')(() => ({}))

const StyledVideoGradient = styled(Box)`
  width: 100%;
  height: 25%;
  position: absolute;
  bottom: 0;
  z-index: 1;
  /* @noflip */
  background: linear-gradient(
    to top,
    #000000a6 0%,
    #00000080 15%,
    #00000000 95%
  );
`

function isIOS(): boolean {
  const userAgent = navigator.userAgent
  return /iPad|iPhone|iPod/.test(userAgent)
}

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
  const [player, setPlayer] = useState<Player>()
  const {
    state: { selectedBlock }
  } = useEditor()
  const { showHeaderFooter } = useBlocks()
  const [fullscreen, setFullscreen] = useState(showHeaderFooter)

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
          loadingSpinner: false,
          // Make video fill container instead of set aspect ratio
          fill: true,
          userActions: {
            hotkeys: true,
            doubleClick: true
          },
          responsive: true,
          muted: muted === true,
          loop: true,
          // This poster is displayed on an autoplay YT video on iOS. Video is no longer loading, but does not play due to YT device limitations.
          poster: posterBlock?.src,
          children: {
            bigPlayButton: false,
            loadingSpinner: false
          }
        })
      )
    }
  }, [startAt, endAt, muted, posterBlock])

  const triggerTimes = useMemo(() => {
    return children
      .filter((block) => block.__typename === 'VideoTriggerBlock')
      .map((block) => (block as VideoTriggerFields).triggerStart)
  }, [children])

  const endOfVideo = endAt ?? player?.duration() ?? 0
  const progressEndTime =
    player != null ? Math.min(...triggerTimes, endOfVideo) : 0

  useEffect(() => {
    if (player != null) {
      if (selectedBlock === undefined) {
        if (autoplay === true) {
          player.autoplay(true)
          void player.play()
        }
      }
    }
  })

  // Initiate video player listeners
  useEffect(() => {
    const handleStopLoading = (): void => {
      console.log('playing, canplay, canplaythrough triggered')
      setLoading(false)
    }
    const handleStopLoadingOnAutoplay = (): void => {
      console.log('seeked', autoplay)
      if (autoplay === true) handleStopLoading()
    }
    const handleVideoReady = (): void => {
      console.log('video ready', player, isIOS())
      player?.currentTime(startAt ?? 0)

      // iOS blocks youtube videos from loading or autoplaying properly
      if (source === VideoBlockSource.youTube) {
        void handleStopLoading()
        if (autoplay === true) {
          player?.autoplay(true)
          void player?.play()
        }
      }
    }
    const handleVideoEnd = (): void => {
      setLoading(false)
      if (player?.isFullscreen() === true && player != null) {
        void player.exitFullscreen()
      }
    }

    if (player != null) {
      if (selectedBlock === undefined) {
        console.log('turn on event listeners', video)
        // Video jumps to new time and finishes loading - occurs on autoplay
        player.on('seeked', handleStopLoadingOnAutoplay)
        player.on('ready', handleVideoReady)
        player.on('playing', handleStopLoading)
        player.on('canplay', handleStopLoading)
        player.on('canplaythrough', handleStopLoading)
        player.on('ended', handleVideoEnd)
      }
    }
    return () => {
      if (player != null) {
        console.log('turn off event listeners', video)
        player.off('seeked', handleStopLoadingOnAutoplay)
        player.off('ready', handleVideoReady)
        player.off('playing', handleStopLoading)
        player.off('canplay', handleStopLoading)
        player.off('canplaythrough', handleStopLoading)
        player.off('ended', handleVideoEnd)
      }
    }
  }, [
    video,
    player,
    selectedBlock,
    startAt,
    progressEndTime,
    autoplay,
    action,
    source
  ])

  // Pause video if admin
  useEffect(() => {
    if (selectedBlock !== undefined) {
      player?.pause()
    }
  }, [selectedBlock, player])

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

  useEffect(() => {
    setFullscreen(!showHeaderFooter)
  }, [showHeaderFooter])

  console.log('headerFooter', showHeaderFooter)

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
        m: '0px !important',
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
          <StyledVideoGradient />
          <StyledVideo
            ref={videoRef}
            className="video-js vjs-tech"
            playsInline
            sx={{
              '&.video-js.vjs-youtube.vjs-fill': {
                height: {
                  xs: fullscreen ? '100%' : 'calc(100% - 120px)',
                  lg: 'calc(100% - 46px)'
                },
                mt: { xs: fullscreen ? 0 : 5, lg: 1 }
              },
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
          >
            {source === VideoBlockSource.cloudflare && videoId != null && (
              <source
                src={`https://customer-${
                  process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ?? ''
                }.cloudflarestream.com/${videoId ?? ''}/manifest/video.m3u8`}
                type="application/x-mpegURL"
              />
            )}
            {source === VideoBlockSource.internal &&
              video?.variant?.hls != null && (
                <source src={video.variant.hls} type="application/x-mpegURL" />
              )}
            {source === VideoBlockSource.youTube && (
              <source
                src={`https://www.youtube.com/embed/${videoId}?start=${
                  startAt ?? 0
                }&end=${endAt ?? 0}`}
                type="video/youtube"
              />
            )}
          </StyledVideo>
          {player != null && (
            <ThemeProvider theme={{ ...theme, direction: 'ltr' }}>
              <VideoControls
                player={player}
                startAt={startAt ?? 0}
                endAt={progressEndTime}
                isYoutube={source === VideoBlockSource.youTube}
                loading={loading}
              />
            </ThemeProvider>
          )}
          {/* TODO: Add back VideoTriggers when we have a way to add them in admin */}
          {/* Default navigate to next card on video end */}
          {action != null && (
            <VideoTrigger
              player={player}
              triggerStart={progressEndTime}
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
