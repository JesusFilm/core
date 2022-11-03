import React, { ReactElement, ReactNode } from 'react'
import Box from '@mui/material/Box'

interface PageWrapperProps {
  header?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  isStory?: boolean
}

export function PageWrapper({
  header,
  footer,
  children,
  isStory = false
}: PageWrapperProps): ReactElement {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        backgroundColor: isStory ? '#c9cfd4' : ''
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: '100%'
        }}
      >
        {header}
      </Box>
      <Box sx={{ width: '100%' }}>{children}</Box>
      <Box
        sx={{
          height: 380
        }}
      >
        {footer}
      </Box>
    </Box>
  )
}
