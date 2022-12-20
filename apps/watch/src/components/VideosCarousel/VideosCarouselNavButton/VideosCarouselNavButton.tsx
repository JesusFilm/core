import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'

interface VideosCarouselNavButtonProps {
  variant: 'prev' | 'next'
  disabled?: boolean
}

const navOverlayBackground = (deg: number): string =>
  `linear-gradient(${deg}deg, rgba(3, 3, 3, 0.85) 0%, rgba(3, 3, 3, 0.4) 50%, rgba(3, 3, 3, 0.1) 80%, rgba(3, 3, 3, 0.04) 90%, rgba(3, 3, 3, 0.02) 95%, rgba(3, 3, 3, 0.01) 100%)`

const navOverlayHover = (deg: number): string =>
  `linear-gradient(${deg}deg, rgba(3, 3, 3, 0.85) 0%, rgba(3, 3, 3, 0.4) 50%, rgba(3, 3, 3, 0.1) 80%, rgba(3, 3, 3, 0.04) 90%, rgba(3, 3, 3, 0.02) 95%, rgba(3, 3, 3, 0.01) 100%)`

export function VideosCarouselNavButton({
  variant,
  disabled = false
}: VideosCarouselNavButtonProps): ReactElement {
  const navigationStyles = {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    width: 50,
    // Prefer fixed heights over using callbacks to retrieve dynamic carousel item image height.
    height: { xl: '146px' },
    color: 'primary.contrastText',
    background: navOverlayBackground(90),
    opacity: { xs: 0, xl: disabled ? 0 : 1 },
    '&.swiper-button-disabled': {
      opacity: 0
    },
    '&:hover': {
      background: navOverlayHover(90)
    },
    cursor: 'pointer'
  }

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      alignSelf={variant === 'prev' ? 'flex-start' : 'flex-end'}
      // Classname hooks component to swiper navigation functions
      className={`jfp-button-${variant}`}
      sx={
        variant === 'prev'
          ? { ...navigationStyles, left: 0 }
          : {
              ...navigationStyles,
              background: navOverlayBackground(270),
              '&:hover': {
                background: navOverlayHover(270)
              },
              position: 'absolute',
              right: 0
            }
      }
    >
      {variant === 'prev' ? (
        <NavigateBeforeIcon fontSize="large" />
      ) : (
        <NavigateNextIcon fontSize="large" />
      )}
    </Stack>
  )
}
