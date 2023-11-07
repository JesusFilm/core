import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import { ReactElement, forwardRef } from 'react'

import ChevronLeft from '@core/shared/ui/icons/ChevronLeft'
import ChevronRight from '@core/shared/ui/icons/ChevronRight'

interface NavButtonProps {
  variant: 'prev' | 'next'
  show?: boolean
}

export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
  function NavButton({ variant, show = false }, ref): ReactElement {
    const theme = useTheme()

    return (
      <IconButton
        ref={ref}
        aria-label={`${variant}-button`}
        sx={{
          zIndex: 2,
          cursor: 'pointer',
          position: 'absolute',
          boxShadow: theme.shadows[2],
          opacity: { xs: 0, md: show ? 1 : 0 },
          left: variant === 'prev' ? -20 : undefined,
          right: variant === 'next' ? -20 : undefined,
          top: '35%',
          transition: 'opacity 0.2s ease-out',
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
            opacity: { xs: 0, md: 1 }
          }
        }}
      >
        {variant === 'prev' ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>
    )
  }
)
