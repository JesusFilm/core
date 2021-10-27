import { TreeBlock } from '../../../../libs/transformer/transformer'
import { ReactElement, ReactNode, useEffect, useRef } from 'react'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../__generated__/GetJourney'
import { useTheme, Box } from '@mui/material'
import { decode } from 'blurhash'

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

interface WithCoverProps extends Pick<CardBlock, 'themeMode' | 'themeName'> {
  children: ReactNode
  coverBlock: TreeBlock<ImageBlock>
}

export function WithCover({
  children,
  coverBlock
}: WithCoverProps): ReactElement {
  const xsRef = useRef<HTMLDivElement>(null)
  const lgRef = useRef<HTMLDivElement>(null)
  const theme = useTheme()

  useEffect(() => {
    if (xsRef.current != null && lgRef.current != null) {
      const divisor = gcd(coverBlock.width, coverBlock.height)
      const width = coverBlock.width / divisor
      const height = coverBlock.height / divisor
      const pixels = decode(coverBlock.blurhash, width, height, 1)

      const canvas = document.createElement('canvas')
      canvas.setAttribute('width', `${width}px`)
      canvas.setAttribute('height', `${height}px`)
      const context = canvas.getContext('2d')
      if (context != null) {
        const imageData = context.createImageData(width, height)
        imageData.data.set(pixels)
        context.putImageData(imageData, 0, 0)
        context.fillStyle = `${theme.palette.background.paper}88`
        context.fillRect(0, 0, width, height)
        const dataURL = canvas.toDataURL('image/webp')
        // We need double image to get better image blending results.
        xsRef.current.style.backgroundImage = `url(${dataURL}), url(${dataURL})`
        lgRef.current.style.backgroundImage = `url(${dataURL}), url(${dataURL})`
      }
    }
  }, [coverBlock, xsRef, lgRef, theme])

  return (
    <>
      <Box
        data-testid="CardWithCoverImage"
        sx={{
          flexGrow: 1,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundImage: `url(${coverBlock.src})`
        }}
      />
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
          position: 'relative'
        }}
      >
        <Box sx={{ margin: 'auto', 
          p: {
            xs: `calc(6vw + ${theme.spacing(4)}) ${theme.spacing(7)} ${theme.spacing(7)}`,
            sm: theme.spacing(7, 8, 7 , 4)
          }, 
          overflow: 'auto',
          }}>{children}</Box>
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
              <Box sx={{ transform: 'skewY(10deg)', px: 7 }}>{children}</Box>
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
