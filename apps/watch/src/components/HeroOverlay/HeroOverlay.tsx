import Box from '@mui/material/Box'
import { ComponentProps, ReactElement } from 'react'

const GrainTexture = { src: '/assets/overlay.svg' }

interface HeroOverlayProps {
  sx?: ComponentProps<typeof Box>['sx']
}

export function HeroOverlay({ sx }: HeroOverlayProps): ReactElement {
  return (
    <>
      <Box
        sx={{
          zIndex: 1,
          position: 'absolute',
          height: '100%',
          width: '100%',
          background:
            'linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), linear-gradient(180.21deg, rgba(50, 50, 51, 0) 52.73%, rgba(38, 38, 38, 0.174648) 68.58%, rgba(27, 27, 28, 0.321668) 81.42%, rgba(0, 0, 0, 0.7) 99.82%), linear-gradient(89.75deg, rgba(20, 20, 20, 0.3) 7.11%, rgba(10, 10, 10, 0.148691) 27.28%, rgba(4, 4, 4, 0.0587687) 44.45%, rgba(0, 0, 0, 0) 66.08%)',
          ...sx
        }}
      />
      <Box
        sx={{
          zIndex: 1,
          position: 'absolute',
          height: '100%',
          width: '100%',
          backgroundImage: `url(${GrainTexture.src})`,
          backgroundRepeat: 'repeat'
        }}
      />
    </>
  )
}
