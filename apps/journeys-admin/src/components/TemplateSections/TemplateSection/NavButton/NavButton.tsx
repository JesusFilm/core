import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import { ReactElement, forwardRef } from 'react'

import ChevronLeft from '@core/shared/ui/icons/ChevronLeft'
import ChevronRight from '@core/shared/ui/icons/ChevronRight'

interface NavButtonProps {
  variant: 'prev' | 'next'
  disabled?: boolean
}

export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
  function NavButton({ variant, disabled = false }, ref): ReactElement {
    const theme = useTheme()

    return (
      <IconButton
        ref={ref}
        sx={{
          zIndex: 2,
          cursor: 'pointer',
          position: 'absolute',
          boxShadow: theme.shadows[2],
          opacity: { xs: 0, lg: disabled ? 0 : 1 },
          left: variant === 'prev' ? 0 : undefined,
          right: variant === 'next' ? 0 : undefined,
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            backgroundColor: theme.palette.background.paper
          },
          '&.swiper-button-disabled': {
            opacity: 0,
            cursor: 'auto',
            pointerEvents: 'none'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: variant === 'prev' ? 0 : undefined,
            right: variant === 'next' ? 0 : undefined,
            mt: 5,
            height: { xs: 225, lg: 270 },
            width: 30,
            zIndex: 1,
            background:
              variant === 'prev'
                ? 'linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)'
                : variant === 'next'
                ? 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)'
                : 'transparent'
          }
        }}
      >
        {variant === 'prev' ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>
    )
  }
)
