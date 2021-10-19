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
  const ref = useRef<HTMLDivElement>(null)
  const theme = useTheme()

  useEffect(() => {
    if (ref.current != null) {
      const divisor = gcd(coverBlock.width, coverBlock.height)
      const width = coverBlock.width / divisor
      const height = coverBlock.height / divisor
      const pixels = decode(coverBlock.blurhash, width, height, 5)

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
        ref.current.style.backgroundImage = `url(${dataURL})`
      }
    }
  }, [coverBlock, ref, theme])

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundImage: `url(${coverBlock.src})`
        }}
      />
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: 7,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          clipPath: {
            xs: 'polygon(0 6vw, 100% 0, 100% 100%, 0 100%)',
            sm: 'polygon(6vh 0, 100% 0, 100% 100%, 0 100%)'
          },
          marginTop: { xs: '-6vw', sm: 0 },
          paddingTop: {
            xs: `calc(6vw + ${theme.spacing(7)})`,
            sm: theme.spacing(7)
          },
          marginLeft: { xs: 0, sm: '-6vh' },
          paddingLeft: {
            xs: theme.spacing(7),
            sm: `calc(6vh + ${theme.spacing(7)})`
          },
          width: { xs: 'auto', sm: '50%' }
        }}
      >
        <Box sx={{ margin: 'auto' }}>{children}</Box>
      </Box>
    </>
  )
}
