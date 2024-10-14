import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { SxProps, keyframes } from '@mui/material/styles'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import { ReactElement, ReactNode, useRef } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { useJourney } from '../../../libs/JourneyProvider'

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
  const { variant } = useJourney()
  const cardOverlayRef = useRef<any>()
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    target: cardOverlayRef.current,
    threshold: 20
  })
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
          '&:first-child': { mt: { xs: 8, sm: 5, lg: 12 } },
          '&:last-child': { mb: { xs: 8, lg: 12 } }
        }
      }
    : {}

  // Adds padding with notch calculations when applicable
  const mobileNotchPadding: SxProps =
    variant === 'default'
      ? {
          pl: {
            xs: 'calc(24px + env(safe-area-inset-left))',
            lg: 'calc(40px + env(safe-area-inset-left))'
          },
          pr: {
            xs: 'calc(24px + env(safe-area-inset-right))',
            lg: 'calc(40px + env(safe-area-inset-right))'
          }
        }
      : {
          pl: { xs: 6, sm: 10 },
          pr: { xs: 6, sm: 10 }
        }

  const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
`

  console.log(trigger)

  const isScrollable = (): boolean => {
    const box = cardOverlayRef.current
    return box != null ? box.scrollHeight > box.clientHeight : false
  }
  return (
    <Box>
      <Box
        data-testid="CardOverlayContent"
        ref={cardOverlayRef}
        sx={{
          ...enableVerticalScroll,
          ...topBottomEdgeFadeEffect,
          ...topBottomMarginsOnContent,
          ...mobileNotchPadding,
          ...sx,
          position: 'relative'
          // border: '2px solid white'
        }}
      >
        {children}
      </Box>
      {isScrollable() && variant === 'default' && (
        <Box
          data-testid="DownArrowBox"
          sx={{
            position: 'fixed',
            bottom: 88,
            left: 'calc(50% - 12px)',
            animation: `${bounce} 2s infinite`
          }}
        >
          <Fade
            appear={false}
            in={!trigger}
            style={{
              transitionDuration: '500ms'
            }}
            data-testid="DownArrow"
          >
            <ChevronDownIcon />
          </Fade>
        </Box>
      )}
    </Box>
  )
}
