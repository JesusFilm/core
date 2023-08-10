import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

interface OverlayContentProps {
  children: ReactNode
  sx: SxProps
  hasFullscreenVideo?: boolean
}

export function OverlayContent({
  children,
  sx,
  hasFullscreenVideo = false
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
  const topBottomEdgeFadeEffect: SxProps = !hasFullscreenVideo
    ? {
        WebkitMask: `linear-gradient(transparent 0%, #0000001a 4%, #000000 8%, #000000 90%, #0000001a 98%, transparent 100%)`,
        mask: `linear-gradient(transparent 0%, #0000001a 4%, #000000 8%, #000000 90%, #0000001a 98%, transparent 100%)`
      }
    : {}
  // Add spacing to children so centered when scrolling to edge
  const topBottomMarginsOnContent: SxProps = !hasFullscreenVideo
    ? {
        '& > *': {
          '&:first-child': { mt: { xs: 8, lg: 12 } },
          '&:last-child': { mb: { xs: 6, lg: 12 } }
        }
      }
    : {}

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
