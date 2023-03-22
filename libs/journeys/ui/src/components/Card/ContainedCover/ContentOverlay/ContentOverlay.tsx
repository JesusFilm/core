import { ReactElement, ReactNode } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'

interface ContentOverlayProps {
  children: ReactNode
  backgroundColor: string
  backgroundSrc?: string
}

export function ContentOverlay({
  children,
  backgroundColor,
  backgroundSrc
}: ContentOverlayProps): ReactElement {
  const theme = useTheme()

  return (
    <>
      {/*  Mobile overlay */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',

          bottom: 0,
          overflow: 'hidden',
          position: 'absolute',
          // Set to maintain RTL
          marginRight: 0,
          paddingRight: 0,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0
        }}
      >
        <Box
          sx={{
            background:
              // Ease out gradient
              'linear-gradient(to bottom,hsla(0, 0%, 0%, 0) 0%,hsla(0, 0%, 0%, 0.013) 10.6%,hsla(0, 0%, 0%, 0.049) 19.6%,hsla(0, 0%, 0%, 0.104) 27.3%,hsla(0, 0%, 0%, 0.175) 33.9%,hsla(0, 0%, 0%, 0.352) 44.8%,hsla(0, 0%, 0%, 0.45) 49.6%,hsla(0, 0%, 0%, 0.55) 54.1%,hsla(0, 0%, 0%, 0.648) 58.8%,hsla(0, 0%, 0%, 0.741) 63.6%,hsla(0, 0%, 0%, 0.825) 69%,hsla(0, 0%, 0%, 0.896) 75.1%,hsla(0, 0%, 0%, 0.951) 82.2%,hsla(0, 0%, 0%, 0.987) 90.4%,hsl(0, 0%, 0%) 100%)',
            p: `${theme.spacing(100)} ${theme.spacing(7)} ${theme.spacing(7)}`
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  )
}
