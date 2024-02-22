import Box from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'

interface ClickableCardProps {
  children: ReactNode
  onClick?: () => void
  fullscreen?: boolean
}

export function ClickableCard({
  children,
  onClick,
  fullscreen
}: ClickableCardProps): ReactElement {
  return (
    <>
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
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          height: '100%'
        }}
      >
        {fullscreen === false && (
          <>
            <Box
              sx={{
                mx: 'auto',
                mb: 0,
                height: 6.5,
                width: '82.5%',
                backgroundColor: '#AAACBB',
                borderRadius: '16px 16px 0 0',
                opacity: 0.3
              }}
            />
            <Box
              sx={{
                mx: 'auto',
                mb: 0,
                height: 6.5,
                width: '90%',
                backgroundColor: '#AAACBB',
                borderRadius: '16px 16px 0 0',
                opacity: 0.6
              }}
            />
          </>
        )}
        <Box
          sx={{
            height: '100%',
            width: '100%',
            borderRadius: '16px',
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
