import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ButtonBase from '@mui/material/ButtonBase'
import { alpha } from '@mui/material/styles'
import { ReactElement, forwardRef } from 'react'

interface NavButtonProps {
  variant: 'prev' | 'next'
  disabled?: boolean
}

export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
  function NavButton({ variant, disabled = false }, ref): ReactElement {
    return (
      <ButtonBase
        ref={ref}
        type="button"
        disabled={disabled}
        aria-label={variant === 'prev' ? 'Previous slide' : 'Next slide'}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          zIndex: 1,
          color: 'primary.contrastText',
          opacity: { xs: 0, xl: disabled ? 0 : 1 },
          cursor: disabled ? 'not-allowed' : 'pointer',
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
              '#131111',
              0
            )} 0%, ${alpha('#131111', 1)} 100%)`
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
      </ButtonBase>
    )
  }
)
