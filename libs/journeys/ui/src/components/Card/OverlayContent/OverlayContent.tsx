import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import { useJourney } from '../../../libs/JourneyProvider'
import { getFooterMobileSpacing } from '../utils/getFooterElements'
import { showHeader } from '../utils/getHeaderElements'

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
  const { journey, variant } = useJourney()
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
        WebkitMask: {
          xs: `linear-gradient(transparent 0px, #0000001a 12px, #000000 32px, #000000 calc(100% - 24px), #0000001a calc(100% - 8px), transparent 100%)`,
          lg: `linear-gradient(transparent 0px, #0000001a 12px, #000000 32px, #000000 calc(100% - 32px), #0000001a calc(100% - 12px), transparent 100%)`
        },
        mask: {
          xs: `linear-gradient(transparent 0px, #0000001a 12px, #000000 32px, #000000 calc(100% - 24px), #0000001a calc(100% - 8px), transparent 100%)`,
          lg: `linear-gradient(transparent 0px, #0000001a 12px, #000000 32px, #000000 calc(100% - 32px), #0000001a calc(100% - 12px), transparent 100%)`
        }
      }
    : {}

  // Add spacing to children so centered when scrolling to edge
  const topBottomMarginsOnContent: SxProps = !hasFullscreenVideo
    ? {
        '& > *': {
          '&:first-child': { mt: { xs: 8, sm: 5, lg: 12 } },
          '&:last-child': { mb: { xs: 6, lg: 12 } }
        }
      }
    : {}

  // Adds padding with notch calculations when applicable
  const mobileNotchPadding: SxProps =
    variant === 'default'
      ? {
          pl: {
            xs: 'calc(16px + env(safe-area-inset-left))',
            lg: 'calc(40px + env(safe-area-inset-left))'
          },
          pr: {
            xs: 'calc(16px + env(safe-area-inset-right))',
            lg: 'calc(40px + env(safe-area-inset-right))'
          }
        }
      : {
          pl: { xs: 4, sm: 10 },
          pr: { xs: 4, sm: 10 }
        }

  const footerMobileSpacing = getFooterMobileSpacing({ journey, variant })
  const footerSpacing: SxProps = {
    mb: { xs: footerMobileSpacing, sm: 10 }
  }

  const hasHeader = showHeader(journey, variant)

  const conditionalWebsiteStyles =
    journey?.website === true
      ? {
          mb: 0,
          '& > *': {
            '&:first-child': { mt: hasHeader ? 20 : 6 },
            '&:last-child': { mb: 20 }
          }
        }
      : {
          ...topBottomMarginsOnContent,
          ...footerSpacing
        }

  return (
    <Box
      data-testid="CardOverlayContent"
      sx={{
        ...enableVerticalScroll,
        ...topBottomEdgeFadeEffect,
        ...conditionalWebsiteStyles,
        ...mobileNotchPadding,
        ...sx
      }}
    >
      {children}
    </Box>
  )
}
