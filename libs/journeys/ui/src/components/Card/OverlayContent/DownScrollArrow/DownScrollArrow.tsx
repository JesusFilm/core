import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { keyframes } from '@mui/material/styles'
import { ReactElement, useEffect, useState } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

interface DownScrollArrowProps {
  trigger: boolean
}
export function DownScrollArrow({
  trigger
}: DownScrollArrowProps): ReactElement {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const bounce = keyframes`
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-30px); }
    60% { transform: translateY(-15px); }
  `
  return (
    <Box
      data-testid="DownArrowBox"
      sx={{
        position: 'fixed',
        bottom: 88,
        left: 'calc(50% - 12px)',
        animation: shouldAnimate ? `${bounce} 2s` : 'none'
      }}
    >
      <Fade
        appear={false}
        in={!trigger}
        style={{
          transitionDuration: '500ms'
        }}
      >
        <ChevronDownIcon />
      </Fade>
    </Box>
  )
}
