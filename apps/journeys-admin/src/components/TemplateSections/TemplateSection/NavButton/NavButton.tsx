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
          left: variant === 'prev' ? -20 : undefined,
          right: variant === 'next' ? -20 : undefined,
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            backgroundColor: theme.palette.background.paper
          },
          '&.swiper-button-disabled': {
            opacity: 0,
            cursor: 'auto',
            pointerEvents: 'none'
          }
        }}
      >
        {variant === 'prev' ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>
    )
  }
)
