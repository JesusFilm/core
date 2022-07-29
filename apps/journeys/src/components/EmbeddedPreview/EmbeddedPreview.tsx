import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import videojs from 'video.js'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useRouter } from 'next/router'
import IconButton from '@mui/material/IconButton'
import Close from '@mui/icons-material/Close'
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import { blurImage } from '@core/journeys/ui/blurImage'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import { NextImage } from '@core/shared/ui/NextImage'

// Used to resolve dynamic viewport height on Safari
import Div100vh from 'react-div-100vh'
import useFullscreenStatus from '../../libs/useFullscreenStatus/useFullscreenStatus'
import { Conductor } from '../Conductor'
import {
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../__generated__/GetJourney'

export interface EmbeddedPreviewProps {
  blocks: TreeBlock[]
}

export function EmbeddedPreview({
  blocks
}: EmbeddedPreviewProps): ReactElement {
  const maximizableElement = useRef(null)
  const [allowFullscreen, setAllowFullscreen] = useState(true)
  let isFullscreen: boolean, setIsFullscreen
  try {
    ;[isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement)
  } catch {
    isFullscreen = false
  }

  // use router internally on this component as it does not function properly when passed as prop
  const router = useRouter()
  const once = useRef(false)

  const handleClick = useCallback((): void => {
    if (allowFullscreen) setIsFullscreen(true)
  }, [allowFullscreen, setIsFullscreen])

  useEffect(() => {
    if (!once.current) {
      if (router?.query?.preview === 'true') {
        setAllowFullscreen(false)
        once.current = true
      }
      if (router?.query?.autoexpand === 'true') {
        handleClick()
        once.current = true
      }
    }
  }, [setAllowFullscreen, handleClick, router?.query])

  return (
    <>
      <Div100vh data-testid="embedded-preview">
        <Stack
          sx={{
            justifyContent: 'center',
            height: '100%'
          }}
        >
          <Box
            sx={{
              p: 8,
              flexGrow: 1,
              display: 'flex',
              cursor: allowFullscreen ? 'pointer' : 'default',
              zindex: 10
            }}
            onClick={() => handleClick()}
          >
            {!isFullscreen && (
              <BlockRenderer
                data-testid="embedded-preview-block-renderer"
                block={blocks?.[0]}
                wrappers={{
                  ImageWrapper: NullWrapper,
                  VideoWrapper: EmbeddedVideoWrapper
                }}
              />
            )}
          </Box>
          <Box
            ref={maximizableElement}
            sx={{
              backgroundColor: (theme) => theme.palette.background.default
            }}
          >
            {isFullscreen && (
              <>
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 1000,
                    color: (theme) => theme.palette.text.primary
                  }}
                  onClick={() => setIsFullscreen(false)}
                >
                  <Close />
                </IconButton>
                <Box sx={{ paddingTop: '12px' }}>
                  <Conductor blocks={blocks} />
                </Box>
              </>
            )}
          </Box>
        </Stack>
      </Div100vh>
    </>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}

const VIDEO_BACKGROUND_COLOR = '#000'
const VIDEO_FOREGROUND_COLOR = '#FFF'

export function EmbeddedVideoWrapper({
  block
}: {
  block: TreeBlock<VideoBlock>
}): ReactElement {
  const theme = useTheme()
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()

  const posterBlock = block.children.find(
    (child) =>
      child.id === block.posterBlockId && child.__typename === 'ImageBlock'
  ) as TreeBlock<ImageBlock> | undefined

  const blurBackground = useMemo(() => {
    return posterBlock != null
      ? blurImage(posterBlock.blurhash, theme.palette.background.paper)
      : undefined
  }, [posterBlock, theme])

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: false,
        controls: false,
        responsive: true,
        muted: true,

        // VideoJS blur background persists so we cover video when using png poster on non-autoplay videos
        poster: blurBackground
      })
      playerRef.current.on('ready', () => {
        playerRef.current?.currentTime(block.startAt ?? 0)
      })
    }
  }, [block, blurBackground])

  return (
    <Box
      data-testid={`video-${block.id}`}
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
      {/* If poster, show  poster. If not show paused video, if no video show placeholder */}
      {posterBlock?.src != null ? (
        <NextImage
          src={posterBlock.src}
          alt={posterBlock.alt}
          placeholder={blurBackground != null ? 'blur' : 'empty'}
          blurDataURL={blurBackground ?? posterBlock.src}
          layout="fill"
          objectFit="cover"
        />
      ) : block.video?.variant?.hls != null ? (
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          playsInline
        >
          <source src={block.video.variant.hls} type="application/x-mpegURL" />
        </video>
      ) : (
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
            outline: 'none',
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
      )}
    </Box>
  )
}
