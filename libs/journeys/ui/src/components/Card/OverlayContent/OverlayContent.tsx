import { ReactElement, ReactNode } from 'react'
import { SxProps } from '@mui/material/styles'
import Box from '@mui/material/Box'

interface OverlayContentProps {
  children: ReactNode
  sx: SxProps
}

export default function OverlayContent({
  children,
  sx
}: OverlayContentProps): ReactElement {
  const enableVerticalScroll: SxProps = {
    overflowY: 'scroll',
    // Hide on Firefox https://caniuse.com/?search=scrollbar-width
    scrollbarWidth: 'none',
    // Hide on all others https://caniuse.com/?search=webkit-scrollbar
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  }
  const topBottomEdgeFadeEffect: SxProps = {
    WebkitMask: `linear-gradient(transparent 0%, #0000001a 4%, #000000 8%, #000000 90%, #0000001a 98%, transparent 100%)`,
    mask: `linear-gradient(transparent 0%, #0000001a 4%, #000000 8%, #000000 90%, #0000001a 98%, transparent 100%)`
  }
  // Add spacing to children so centered when scrolling to edge
  const topBottomMarginsOnContent: SxProps = {
    '& > *': {
      '&:first-child': { mt: { xs: 8, lg: 12 } },
      '&:last-child': { mb: { xs: 6, lg: 12 } }
    }
  }
  return (
    <Box
      data-testid="overlay-content"
      sx={{
        ...enableVerticalScroll,
        ...topBottomEdgeFadeEffect,
        ...topBottomMarginsOnContent,
        ...sx
      }}
    >
      {children}
    </Box>
  )
}
