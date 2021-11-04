import { TreeBlock } from '../../../../libs/transformer/transformer'
import { ReactElement, ReactNode, useEffect, useRef } from 'react'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { Box, useTheme } from '@mui/material'
import videojs from 'video.js'

interface ImageCoverProps {
  children: ReactNode
  coverBlock: TreeBlock<VideoBlock>
}

export function VideoCover({
  children,
  coverBlock
}: ImageCoverProps): ReactElement {
  const videoNode = useRef<HTMLVideoElement>(null)
  const theme = useTheme()

  useEffect(() => {
    if (videoNode.current != null) {
      videojs(videoNode.current)
    }
  }, [videoNode])

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <video ref={videoNode} autoPlay muted loop>
          <source src={coverBlock.src} type="application/x-mpegURL" />
        </video>
      </Box>
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
            margin: 'auto',
            p: {
              xs: `calc(6vw + ${theme.spacing(4)}) ${theme.spacing(
                7
              )} ${theme.spacing(7)}`,
              sm: theme.spacing(7, 8, 7, 4)
            },
            overflow: 'auto'
          }}
        >
          {children}
        </Box>
        <Box
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
              <Box sx={{ transform: 'skewY(10deg)', px: 7 }}>{children}</Box>
              <Box
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
