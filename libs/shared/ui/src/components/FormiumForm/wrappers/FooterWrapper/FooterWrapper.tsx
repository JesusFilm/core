import Box from '@mui/material/Box'
import { ReactElement } from 'react'

interface FooterWrapperProps {
  children: ReactElement
}

// Wraps around the footer component to render the buttons

export function FooterWrapper({ children }: FooterWrapperProps): ReactElement {
  return (
    <Box
      data-testid="FooterWrapper"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '1rem',
        width: '100%'
      }}
    >
      {children}
    </Box>
  )
}
