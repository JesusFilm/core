import VideocamRounded from '@mui/icons-material/VideocamRounded'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { ThemeProvider, styled, useTheme } from '@mui/material/styles'
import MuxPlayer from '@mux/mux-player-react'
import get from 'lodash/get'
import {
  CSSProperties,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { use100vh } from 'react-div-100vh'
import Player from 'video.js/dist/types/player'

import { NextImage } from '@core/shared/ui/NextImage'

import {
  VideoBlockObjectFit,
  VideoBlockSource
} from '../../../__generated__/globalTypes'
import {
  TreeBlock,
  isActiveBlockOrDescendant,
  useBlocks
} from '../../libs/block'
import { blurImage } from '../../libs/blurImage'
import { useEditor } from '../../libs/EditorProvider'
import { useJourney } from '../../libs/JourneyProvider'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { VideoEvents } from '../VideoEvents'
import { VideoTrigger } from '../VideoTrigger'
import { VideoTriggerFields } from '../VideoTrigger/__generated__/VideoTriggerFields'

import { VideoFields } from './__generated__/VideoFields'
import { InitAndPlay } from './InitAndPlay'
import { VideoControls } from './VideoControls'

import 'videojs-youtube'
import 'video.js/dist/video-js.css'

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

export function Video({
  id: blockId,
  mediaVideo,
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
  objectFit,
  videoVariantLanguageId
}: TreeBlock<VideoFields>): ReactElement {
  const theme = useTheme()
  const hundredVh = use100vh()

  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [player, setPlayer] = useState<Player>()
  const [showPoster, setShowPoster] = useState(true)
  const [activeStep, setActiveStep] = useState(false)

  const { blockHistory } = useBlocks()
  const { variant } = useJourney()
  const {
    state: { selectedBlock }
  } = useEditor()

  const eventVideoTitle =
    mediaVideo?.__typename == 'Video' ? mediaVideo?.title[0].value : title
  const eventVideoId = get(mediaVideo, 'id') ?? videoId

  // Setup poster image
  const posterBlock = children.find(
    (block) => block.id === posterBlockId && block.__typename === 'ImageBlock'
  ) as TreeBlock<ImageFields> | undefined

  const videoImage =
    mediaVideo?.__typename == 'Video'
      ? mediaVideo?.images[0]?.mobileCinematicHigh
      : image

  const blurBackground = useMemo(() => {
    return posterBlock != null
      ? blurImage(posterBlock.blurhash, theme.palette.background.paper)
      : undefined
  }, [posterBlock, theme])

  const triggerTimes = useMemo(() => {
    return children
      .filter((block) => block.__typename === 'VideoTriggerBlock')
      .map((block) => (block as VideoTriggerFields).triggerStart)
  }, [children])

  const [videoEndTime, setVideoEndTime] = useState(
    Math.min(...triggerTimes, endAt ?? 10000)
  )

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

  const isFillAndNotYoutube = (): boolean =>
    videoFit === 'cover' && source !== VideoBlockSource.youTube

  const showVideoImage =
    (variant === 'admin' && source === VideoBlockSource.youTube) ||
    source === VideoBlockSource.internal ||
    source === VideoBlockSource.mux

  const effectiveStartAt = startAt ?? 0
  const effectiveEndAt = endAt ?? 10000
  // Mux video clipping handles timestamps internally, so videos must start at 0 to avoid extra clipping
  const videoControlsStartAt =
    mediaVideo?.__typename === 'MuxVideo' ? 0 : effectiveStartAt

  const isMuxVideo =
    mediaVideo?.__typename === 'MuxVideo' || source === VideoBlockSource.mux

  // Update activeStep when block becomes active
  useEffect(() => {
    setActiveStep(isActiveBlockOrDescendant(blockId))
  }, [blockId, blockHistory])

  // Control MuxVideo playback based on activeStep
  useEffect(() => {
    if (!videoContainerRef.current || !isMuxVideo) return

    const mediaElement = videoContainerRef.current.querySelector(
      'mux-player video'
    ) as HTMLVideoElement | null

    if (mediaElement) {
      if (activeStep && autoplay) {
        mediaElement.play().catch(() => {
          // Autoplay might be blocked by browser policy
          console.log('Autoplay was prevented by browser policy')
        })
      } else if (!activeStep) {
        mediaElement.pause()
      }
    }
  }, [activeStep, isMuxVideo, autoplay])

  return (
    <Box
      data-testid={`JourneysVideo-${blockId}`}
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        minHeight: 'inherit',
        backgroundColor: VIDEO_BACKGROUND_COLOR,
        overflow: 'hidden',
        my: '0px !important',
        mx: isFillAndNotYoutube() ? 'inherit' : '0px !important',
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
      {!isMuxVideo && (
        <InitAndPlay
          videoRef={videoRef}
          player={player}
          setPlayer={setPlayer}
          triggerTimes={triggerTimes}
          videoEndTime={videoEndTime}
          selectedBlock={selectedBlock}
          blockId={blockId}
          muted={muted}
          startAt={videoControlsStartAt}
          endAt={effectiveEndAt}
          autoplay={autoplay}
          posterBlock={posterBlock}
          setLoading={setLoading}
          setShowPoster={setShowPoster}
          setVideoEndTime={setVideoEndTime}
          source={source}
          activeStep={activeStep}
          title={title}
          mediaVideo={mediaVideo}
          videoVariantLanguageId={videoVariantLanguageId}
        />
      )}
      {activeStep &&
        player != null &&
        eventVideoTitle != null &&
        eventVideoId != null &&
        !isMuxVideo && (
          <VideoEvents
            player={player}
            blockId={blockId}
            videoTitle={eventVideoTitle}
            source={source}
            videoId={eventVideoId}
            startAt={videoControlsStartAt}
            endAt={videoEndTime}
            action={action}
          />
        )}

      {videoId != null ? (
        <>
          <StyledVideoGradient />
          <Box
            ref={videoContainerRef}
            height={{
              xs: isFillAndNotYoutube() ? hundredVh : '100%',
              sm: '100%'
            }}
            width="100%"
            minHeight="-webkit-fill-available"
            overflow="hidden"
            marginX={0}
            position={isFillAndNotYoutube() ? 'absolute' : 'inherit'}
            data-testid="video-container"
          >
            {isMuxVideo &&
            mediaVideo?.__typename === 'MuxVideo' &&
            mediaVideo?.playbackId != null ? (
              <Box sx={{ width: '100%', height: '100%' }}>
                <MuxPlayer
                  streamType="on-demand"
                  playbackId={mediaVideo.playbackId}
                  metadata={{
                    video_id: mediaVideo.id || videoId || '',
                    video_title: title || '',
                    player_name: 'journeys'
                  }}
                  autoPlay={activeStep && (autoplay ?? false)}
                  muted={muted ?? false}
                  playsInline
                  startTime={effectiveStartAt}
                  style={{
                    height: '100%',
                    width: '100%',
                    objectFit: videoFit,
                    transform:
                      objectFit === VideoBlockObjectFit.zoomed
                        ? 'scale(1.33)'
                        : undefined,
                    // @ts-ignore - CSS variables are valid in style but TypeScript doesn't recognize them
                    '--controls-backdrop-color': 'rgb(0 0 0 / 60%)'
                  }}
                  onLoadedData={() => {
                    setLoading(false)
                    setShowPoster(false)
                  }}
                  onClick={(event: MouseEvent) => event.stopPropagation()}
                  onEnded={() => {
                    if (action != null) {
                      // Handle action on video end without using triggerAction
                      // This will be handled by the VideoTrigger component for non-Mux videos
                    }
                  }}
                  poster={
                    posterBlock?.src || (videoImage ? videoImage : undefined)
                  }
                />
              </Box>
            ) : (
              <StyledVideo
                ref={videoRef}
                className="video-js vjs-tech"
                playsInline
                preload="auto"
                sx={{
                  '&.video-js.vjs-youtube.vjs-fill': {
                    transform: 'scale(1.01)'
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
                    backgroundSize: 'cover',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                {mediaVideo?.__typename == 'Video' &&
                  mediaVideo?.variant?.hls != null && (
                    <source
                      src={mediaVideo.variant.hls}
                      type="application/x-mpegURL"
                    />
                  )}
                {source === VideoBlockSource.youTube && (
                  <source
                    src={`https://www.youtube.com/embed/${videoId}?start=${
                      effectiveStartAt
                    }&end=${effectiveEndAt}`}
                    type="video/youtube"
                  />
                )}
              </StyledVideo>
            )}
          </Box>
          {player != null && !isMuxVideo && (
            <ThemeProvider theme={{ ...theme, direction: 'ltr' }}>
              <VideoControls
                player={player}
                startAt={videoControlsStartAt}
                endAt={videoEndTime}
                isYoutube={source === VideoBlockSource.youTube}
                loading={loading}
                autoplay={autoplay ?? false}
                muted={muted ?? false}
                activeStep={activeStep}
              />
            </ThemeProvider>
          )}
          {/* TODO: Add back VideoTriggers when we have a way to add them in admin */}
          {/* Default navigate to next card on video end */}
          {action != null && !isMuxVideo && (
            <VideoTrigger
              blockId={blockId}
              player={player}
              triggerStart={videoEndTime}
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
                selectedBlock?.id === blockId ? '2px solid #C52D3A' : 'none',
              outlineOffset: '-3px',
              borderRadius: '24px'
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
      {videoImage != null &&
        showVideoImage &&
        posterBlock?.src == null &&
        showPoster && (
          <NextImage
            src={videoImage}
            alt="video image"
            layout="fill"
            objectFit={videoFit}
            unoptimized
            style={{
              transform:
                objectFit === VideoBlockObjectFit.zoomed
                  ? 'scale(1.33)'
                  : undefined
            }}
          />
        )}
      {/* Lazy load higher res poster */}
      {posterBlock?.src != null && showPoster && (
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
