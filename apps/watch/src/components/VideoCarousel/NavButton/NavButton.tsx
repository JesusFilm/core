import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import { ReactElement, forwardRef } from 'react'

interface NavButtonProps {
  variant: 'prev' | 'next'
  disabled?: boolean
}

export const NavButton = forwardRef<HTMLDivElement, NavButtonProps>(
  function NavButton({ variant, disabled = false }, ref): ReactElement {
    return (
      <Stack
        ref={ref}
        justifyContent="center"
        alignItems="center"
        sx={{
          position: 'absolute',
          zIndex: 1,
          color: 'primary.contrastText',
          opacity: { xs: 0, xl: disabled ? 0 : 1 },
          cursor: disabled ? 'none' : 'pointer',
          pointerEvents: disabled ? 'none' : undefined,
          '&.swiper-button-disabled': {
            opacity: 0,
            cursor: 'auto',
            pointerEvents: 'none'
          },
          top: 0,
          bottom: 0,
          left: variant === 'prev' ? 0 : undefined,
          right: variant === 'next' ? 0 : undefined,
          transition: 'opacity 0.2s ease-out',
          width: 42,
          background: (theme) =>
            `linear-gradient(${variant === 'next' ? 90 : 270}deg, ${alpha(
              theme.palette.background.default,
              0
            )} 0%, ${alpha(theme.palette.background.default, 1)} 100%)`
        }}
        data-testid="NavButton"
      >
        {variant === 'prev' ? (
          <NavigateBeforeIcon
            data-testid="NavigateBeforeIcon"
            fontSize="large"
          />
        ) : (
          <NavigateNextIcon data-testid="NavigateNextIcon" fontSize="large" />
        )}
      </Stack>
    )
  }
)
