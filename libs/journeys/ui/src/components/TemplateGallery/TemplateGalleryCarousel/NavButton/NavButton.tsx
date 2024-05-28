import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import { ReactElement, forwardRef } from 'react'

import ChevronLeft from '@core/shared/ui/icons/ChevronLeft'
import ChevronRight from '@core/shared/ui/icons/ChevronRight'

interface NavButtonProps {
  variant: 'prev' | 'next'
  hovered?: boolean
  disabled?: boolean
}

export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
  function NavButton(
    { variant, hovered = false, disabled = true },
    ref
  ): ReactElement {
    const theme = useTheme()

    return (
      <IconButton
        ref={ref}
        aria-label={`${variant}-${!disabled ? 'button' : 'button-disabled'}`}
        sx={{
          zIndex: 2,
          cursor: 'pointer',
          position: 'absolute',
          boxShadow: theme.shadows[2],
          opacity: {
            xs: 0,
            md: hovered && !disabled ? 1 : 0
          },
          left: variant === 'prev' ? -20 : undefined,
          right: variant === 'next' ? -20 : undefined,
          top: '37%',
          transition: 'opacity 0.2s ease-out',
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
            opacity: { xs: 0, md: 1 }
          },
          '&.swiper-button-disabled': {
            display: 'none'
          }
        }}
      >
        {variant === 'prev' ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>
    )
  }
)
