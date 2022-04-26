import {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useMemo
} from 'react'
import videojs from 'video.js'
import { NextImage } from '@core/shared/ui'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { TreeBlock, blurImage } from '../../..'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'
import { ContentOverlay } from './ContentOverlay'

import 'video.js/dist/video-js.css'

interface CoverProps {
  children: ReactNode
  imageBlock?: TreeBlock<ImageFields>
  videoBlock?: TreeBlock<VideoFields>
}

export function Cover({
  children,
  imageBlock,
  videoBlock
}: CoverProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const theme = useTheme()
  const [loading, setLoading] = useState(true)

  const blurBackground = useMemo(() => {
    return imageBlock != null
      ? blurImage(
          imageBlock.width,
          imageBlock.height,
          imageBlock.blurhash,
          theme.palette.background.paper
        )
      : undefined
  }, [imageBlock, theme])

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: 'muted',
        controls: false,
        preload: 'metadata',
        userActions: {
          hotkeys: false,
          doubleClick: false
        },
        muted: true,
        loop: true,
        poster: blurBackground
      })
      playerRef.current.on('ready', () => {
        playerRef.current?.currentTime(videoBlock?.startAt ?? 0)
      })
      // Video jumps to new time and finishes loading
      playerRef.current.on('seeked', () => {
        setLoading(false)
      })
    }
  }, [imageBlock, theme, videoBlock, blurBackground])

  return (
    <>
      <Box
        data-testid="CardCover"
        sx={{
          position: 'relative',
          flexGrow: 1,
          width: { xs: '100%', sm: 'calc(50% + 6vh)', md: '100%' },
          height: { xs: 'auto', sm: '100%' },
          '> .video-js': {
            width: '100%',
            height: '100%',
            '> .vjs-tech': {
              objectFit: 'cover'
            },
            '> .vjs-loading-spinner': {
              zIndex: 1
            },
            '> .vjs-poster': {
              backgroundSize: 'cover'
            }
          }
        }}
      >
        {videoBlock?.video?.variant?.hls != null && (
          <video ref={videoRef} className="video-js" playsInline>
            <source
              src={videoBlock?.video.variant.hls}
              type="application/x-mpegURL"
            />
          </video>
        )}
        {loading && imageBlock != null && blurBackground != null && (
          <NextImage
            data-testid={
              videoBlock != null ? 'VideoPosterCover' : 'CardImageCover'
            }
            src={imageBlock?.src ?? blurBackground}
            alt={imageBlock.alt}
            placeholder="blur"
            blurDataURL={blurBackground}
            layout="fill"
            objectFit="cover"
          />
        )}
      </Box>
      <ContentOverlay backgroundSrc={blurBackground}>{children}</ContentOverlay>
    </>
  )
}
