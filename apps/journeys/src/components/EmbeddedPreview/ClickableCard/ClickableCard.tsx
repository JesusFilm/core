import Box from '@mui/material/Box'
import NoSsr from '@mui/material/NoSsr'
import { ReactElement, ReactNode } from 'react'

import { isIPhone } from '@core/shared/ui/deviceUtils'

interface ClickableCardProps {
  children: ReactNode
  onClick?: () => void
  fullscreen?: boolean
  disableFullscreen?: boolean
}

export function ClickableCard({
  children,
  onClick,
  fullscreen,
  disableFullscreen
}: ClickableCardProps): ReactElement {
  return (
    <>
      <NoSsr>
        {!isIPhone() && disableFullscreen !== true && (
          <Box
            data-testid="clickable-card-embed"
            onClick={onClick}
            sx={{
              display: fullscreen === true ? 'none' : 'block',
              cursor: 'pointer',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 11
            }}
          />
        )}
      </NoSsr>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          height: '100%'
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: '100%',
            borderRadius: fullscreen === true ? 0 : '16px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  )
}
