import { ReactElement, ReactNode } from 'react'
// import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'

interface ContentOverlayProps {
  children: ReactNode
}

export function ContentOverlay({
  children
}: ContentOverlayProps): ReactElement {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background:
          // Ease out gradient
          'linear-gradient(to bottom,hsla(0, 0%, 0%, 0) 0%,hsla(0, 0%, 0%, 0.013) 10.6%,hsla(0, 0%, 0%, 0.049) 19.6%,hsla(0, 0%, 0%, 0.104) 27.3%,hsla(0, 0%, 0%, 0.175) 33.9%,hsla(0, 0%, 0%, 0.352) 44.8%,hsla(0, 0%, 0%, 0.45) 49.6%,hsla(0, 0%, 0%, 0.55) 54.1%,hsla(0, 0%, 0%, 0.648) 58.8%,hsla(0, 0%, 0%, 0.741) 63.6%,hsla(0, 0%, 0%, 0.825) 69%,hsla(0, 0%, 0%, 0.896) 75.1%,hsla(0, 0%, 0%, 0.951) 82.2%,hsla(0, 0%, 0%, 0.987) 90.4%,hsl(0, 0%, 0%) 100%)'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          bottom: 0,
          position: 'absolute',
          p: 4,
          '& > *': {
            '&:first-child': { mt: 0 },
            '&:last-child': { mb: 0 }
          }
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
