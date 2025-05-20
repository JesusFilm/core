import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactNode } from 'react'

interface SlideWrapperProps {
  children: ReactNode
  bgImage?: string
}

export function SlideWrapper({ children, bgImage }: SlideWrapperProps) {
  return (
    <Stack
      role="region"
      sx={{
        minHeight: '100%',
        width: '100%',
        alignItems: 'center',
        gap: 10,
        transition: 'opacity 100ms',
        transitionDelay: '600ms',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* <Box
        role="presentation"
        sx={{
          position: 'absolute',
          inset: 0,
          transition: 'opacity 100ms',
          transitionDelay: '600ms',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      /> */}
      <Stack
        sx={{
          alignItems: 'center',
          width: '100%',
          pt: 32,
          maxWidth: '48rem'
        }}
      >
        {children}
      </Stack>
    </Stack>
  )
}
