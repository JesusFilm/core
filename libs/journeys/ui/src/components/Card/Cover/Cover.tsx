import { ReactElement, ReactNode, useEffect, useRef } from 'react'
import videojs from 'video.js'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { TreeBlock, blurImage } from '../../..'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'

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
  const xsRef = useRef<HTMLDivElement>(null)
  const lgRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const theme = useTheme()

  useEffect(() => {
    if (imageBlock?.src != null) {
      if (xsRef.current != null && lgRef.current != null) {
        const dataURL = blurImage(
          imageBlock.width,
          imageBlock.height,
          imageBlock.blurhash,
          theme.palette.background.paper
        )

        if (dataURL != null) {
          // We need double image to get better image blending results.
          xsRef.current.style.backgroundImage = `url(${dataURL}), url(${dataURL})`
          lgRef.current.style.backgroundImage = `url(${dataURL}), url(${dataURL})`
        }
      }
    }
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: 'muted',
        controls: false,
        userActions: {
          hotkeys: false,
          doubleClick: false
        },
        muted: true,
        loop: true
      })
      playerRef.current.on('ready', () => {
        playerRef.current?.currentTime(videoBlock?.startAt ?? 0)
      })
    }
  }, [imageBlock, theme, videoBlock])

  return (
    <>
      {videoBlock != null ? (
        <Box
          sx={{
            flexGrow: 1,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundImage:
              imageBlock?.src != null ? `url(${imageBlock.src})` : undefined,
            '> .video-js': {
              width: '100%',
              height: '100%',
              '> .vjs-tech': {
                objectFit: 'cover'
              }
            }
          }}
          data-testid="CardVideoCover"
        >
          {videoBlock.video?.variant?.hls != null && (
            <video
              ref={videoRef}
              className="video-js"
              playsInline
              poster={imageBlock?.src ?? undefined}
            >
              <source
                src={videoBlock.video.variant.hls}
                type="application/x-mpegURL"
              />
            </video>
          )}
        </Box>
      ) : (
        imageBlock?.src != null && (
          <Box
            data-testid="CardImageCover"
            sx={{
              flexGrow: 1,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundImage: `url(${imageBlock.src})`
            }}
          />
        )
      )}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          clipPath: {
            xs: 'polygon(0 6vw, 100% 0, 100% 100%, 0 100%)',
            sm: 'polygon(6vh 0, 100% 0, 100% 100%, 0 100%)'
          },
          marginTop: { xs: '-6vw', sm: 0 },
          marginLeft: { xs: 0, sm: '-6vh' },
          paddingLeft: {
            sm: `6vh`
          },
          width: { xs: 'auto', sm: '50%' },
          overflow: 'hidden',
          position: 'relative',
          borderTopRightRadius: { sm: theme.spacing(4) },
          borderBottomRightRadius: { sm: theme.spacing(4) }
        }}
      >
        <Box
          sx={{
            my: 'auto',
            p: {
              xs: `calc(6vw + ${theme.spacing(4)}) ${theme.spacing(
                7
              )} ${theme.spacing(7)}`,
              sm: theme.spacing(7, 8, 7, 4)
            },
            overflow: 'auto',
            '& > *': {
              '&:first-child': { mt: 0 },
              '&:last-child': { mb: 0 }
            }
          }}
        >
          {children}
        </Box>
        <Box
          ref={xsRef}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '110%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            backgroundPosition: '0% 0%',
            left: 0,
            top: '-10%',
            zIndex: -1,
            transform: 'scaleY(-1)',
            backgroundBlendMode: 'hard-light'
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column'
        }}
      >
        <Box
          sx={{
            margin: 'auto',
            overflow: 'auto',
            pr: 9,
            py: 7,
            width: 300
          }}
        >
          <Box
            sx={{
              margin: 'auto',
              borderRadius: theme.spacing(4),
              overflow: 'hidden'
            }}
            className="box"
          >
            <Box
              sx={{
                backgroundSize: 'cover',
                position: 'relative',
                marginTop: '-40px',
                marginBottom: '40px',
                borderRadius: theme.spacing(4),
                paddingTop: `calc(40px + ${theme.spacing(7)})`,
                paddingBottom: `calc(20px + ${theme.spacing(4)})`,
                transform: 'skewY(-10deg)',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  transform: 'skewY(10deg)',
                  px: 7,
                  '& > *': {
                    '&:first-child': { mt: 0 },
                    '&:last-child': { mb: 0 }
                  }
                }}
              >
                {children}
              </Box>
              <Box
                ref={lgRef}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '110%',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '100% 100%',
                  backgroundPosition: '0% 0%',
                  left: 0,
                  top: '-10%',
                  zIndex: -1,
                  transform: 'scaleY(-1)',
                  backgroundBlendMode: 'hard-light',
                  opacity: 0.9
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
