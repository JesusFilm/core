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
import MuiButton from '@mui/material/Button'
import { Icon } from '@core/journeys/ui/Icon'

// Used to resolve dynamic viewport height on Safari
import Div100vh from 'react-div-100vh'
import useFullscreenStatus from '../../libs/useFullscreenStatus/useFullscreenStatus'
import { Conductor } from '../Conductor'
import {
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock
} from '../../../__generated__/GetJourney'
import { IconFields } from '../../../__generated__/IconFields'
import { ButtonVariant } from '../../../__generated__/globalTypes'

export interface EmbeddedPreviewProps {
  blocks: TreeBlock[]
}

export function EmbeddedPreview({
  blocks
}: EmbeddedPreviewProps): ReactElement {
  const maximizableElement = useRef(null)
  const [allowFullscreen, setAllowFullscreen] = useState(true)
  let isFullscreen: boolean, setIsFullscreen
  const [isFullContainer, setIsFullContainer] = useState(false)
  let canFullscreen = true
  try {
    ;[isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement)
  } catch {
    isFullscreen = false
    canFullscreen = false
  }
  const [previousContainerDimensions, setPreviousContainerDimensions] =
    useState({
      width: 0,
      height: 0
    })

  const maximizeView = useCallback(
    (value: boolean) => {
      if (canFullscreen) {
        setIsFullscreen(value)
      } else {
        setIsFullContainer(value)
        const iframeContainer = window.parent.document.getElementById(
          'jfm-iframe-container'
        )
        if (iframeContainer != null) {
          if (value) {
            setPreviousContainerDimensions({
              width: iframeContainer.offsetWidth,
              height: iframeContainer.offsetHeight
            })
            iframeContainer.style.height = '100vh'
            iframeContainer.style.width = '100vw'
          } else {
            iframeContainer.style.height =
              previousContainerDimensions.height.toString() + 'px'
            iframeContainer.style.width =
              previousContainerDimensions.width.toString() + 'px'
          }
        }
      }
    },
    [
      canFullscreen,
      setIsFullscreen,
      setIsFullContainer,
      previousContainerDimensions
    ]
  )

  // use router internally on this component as it does not function properly when passed as prop
  const router = useRouter()
  const once = useRef(false)

  const handleClick = useCallback((): void => {
    if (allowFullscreen) maximizeView(true)
  }, [allowFullscreen, maximizeView])

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
      <style jsx global>{`
        body {
          background: transparent;
        }
      `}</style>
      <style jsx>{`
        .MuiPaper-elevation {
          box-shadow: none !important;
        }
      `}</style>
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
              flexDirection: 'column',
              cursor: allowFullscreen ? 'pointer' : 'default',
              zindex: 10
            }}
            onClick={() => handleClick()}
          >
            <Box
              sx={{
                mx: 'auto',
                mb: '-3.5px',
                height: 10,
                width: 'calc(100% - 17.5%)',
                backgroundColor: 'rgba(220,222,229,0.5)',
                borderRadius: '16px 16px 0 0'
              }}
            />
            <Box
              sx={{
                mx: 'auto',
                mb: '-3.5px',
                height: 10,
                width: 'calc(100% - 10%)',
                backgroundColor: 'rgba(170,172,287,0.5)',
                borderRadius: '16px 16px 0 0'
              }}
            />
            <Box
              sx={{
                height: '100%',
                width: '100%',
                borderRadius: '16px',
                border: '1px solid rgba(186, 186, 187, 0.5)'
              }}
            >
              {!(isFullscreen || isFullContainer) && (
                <BlockRenderer
                  data-testid="embedded-preview-block-renderer"
                  block={blocks?.[0]}
                  wrappers={{
                    ButtonWrapper: ButtonWrapper,
                    ImageWrapper: NullWrapper,
                    VideoWrapper: EmbeddedVideoWrapper
                  }}
                />
              )}
            </Box>
          </Box>
          <Box
            ref={maximizableElement}
            sx={{
              backgroundColor: (theme) => theme.palette.background.default
            }}
          >
            {(isFullscreen || isFullContainer) && (
              <>
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 1000,
                    color: (theme) => theme.palette.text.primary
                  }}
                  onClick={() => maximizeView(false)}
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

export function ButtonWrapper({
  block
}: {
  block: TreeBlock<ButtonBlock>
}): ReactElement {
  const startIcon = block.children.find(
    (child) => child.id === block.startIconId
  ) as TreeBlock<IconFields> | undefined

  const endIcon = block.children.find(
    (child) => child.id === block.endIconId
  ) as TreeBlock<IconFields> | undefined

  return (
    // Margin added via Box so it's ignored by admin selection border outline
    <Box
      sx={{
        mb: 4,
        mt:
          block.size === 'large'
            ? 6
            : block.size === 'medium'
            ? 5
            : block.size === 'small'
            ? 4
            : 5
      }}
    >
      <MuiButton
        variant={block.buttonVariant ?? ButtonVariant.contained}
        color={block.buttonColor ?? undefined}
        size={block.size ?? undefined}
        startIcon={startIcon != null ? <Icon {...startIcon} /> : undefined}
        endIcon={endIcon != null ? <Icon {...endIcon} /> : undefined}
        fullWidth
        disableRipple
        sx={{
          '&.MuiButtonBase-root': { pointerEvents: 'none' }
        }}
      >
        {block.label}
      </MuiButton>
    </Box>
  )
}
