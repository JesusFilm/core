import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { ReactElement, forwardRef } from 'react'

import ChevronLeft from '@core/shared/ui/icons/ChevronLeft'
import ChevronRight from '@core/shared/ui/icons/ChevronRight'

interface NavButtonProps {
  variant: 'prev' | 'next'
  disabled?: boolean
  start?: boolean
  end?: boolean
}

export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
  function NavButton(
    { variant, disabled = false, start, end },
    ref
  ): ReactElement {
    return (
      <>
        <Box
          sx={{
            position: 'absolute',
            left: variant === 'prev' ? 0 : undefined,
            right: variant === 'next' ? 0 : undefined,
            height: { xs: 225, lg: 240 },
            width: 30,
            zIndex: 1,
            background:
              variant === 'prev' && start !== true
                ? 'linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)'
                : variant === 'next' && end !== true
                ? 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)'
                : 'transparent'
          }}
        />
        <IconButton
          ref={ref}
          sx={{
            position: 'absolute',
            zIndex: 2,
            backgroundColor: 'background.paper',
            opacity: { xs: 0, lg: disabled ? 0 : 1 },
            '&.swiper-button-disabled': {
              opacity: 0,
              cursor: 'auto',
              pointerEvents: 'none'
            },
            boxShadow: (theme) => theme.shadows[2],
            cursor: 'pointer',
            left: variant === 'prev' ? 0 : undefined,
            right: variant === 'next' ? 0 : undefined,
            '&:hover': {
              backgroundColor: 'background.paper'
            }
          }}
        >
          {variant === 'prev' ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </>
    )
  }
)
