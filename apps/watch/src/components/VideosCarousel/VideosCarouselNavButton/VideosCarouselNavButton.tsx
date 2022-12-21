import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'

interface VideosCarouselNavButtonProps {
  variant: 'prev' | 'next'
}

const navOverlayBackground = (deg: number): string =>
  `linear-gradient(${deg}deg, rgba(3, 3, 3, 0.85) 0%, rgba(3, 3, 3, 0.4) 50%, rgba(3, 3, 3, 0.1) 80%, rgba(3, 3, 3, 0.04) 90%, rgba(3, 3, 3, 0.02) 95%, rgba(3, 3, 3, 0.01) 100%)`

const navOverlayHover = (deg: number): string =>
  `linear-gradient(${deg}deg, rgba(3, 3, 3, 0.85) 0%, rgba(3, 3, 3, 0.4) 50%, rgba(3, 3, 3, 0.1) 80%, rgba(3, 3, 3, 0.04) 90%, rgba(3, 3, 3, 0.02) 95%, rgba(3, 3, 3, 0.01) 100%)`

export function VideosCarouselNavButton({
  variant
}: VideosCarouselNavButtonProps): ReactElement {
  const navigationStyles = {
    width: 50,
    height: '100%',
    color: 'primary.contrastText',
    background: navOverlayBackground(90),
    '&.swiper-button-disabled': {
      display: 'none'
    },
    '&:hover': {
      background: navOverlayHover(90)
    }
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
          ? navigationStyles
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
