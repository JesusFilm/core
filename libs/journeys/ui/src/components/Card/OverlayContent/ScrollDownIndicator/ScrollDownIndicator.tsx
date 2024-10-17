import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { keyframes } from '@mui/material/styles'
import { ReactElement, useEffect, useState } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { TreeBlock, useBlocks } from '@core/journeys/ui/block'

import { StepFields } from '../../../Step/__generated__/StepFields'
import { cardHasBackground } from '../utils'

import FacebookLogoIcon from '@core/shared/ui/icons/FacebookLogo'

const BOUNCE_DELAY = 5000

interface ScrollDownIndicatorProps {
  trigger: boolean
  bounceDelay?: number
  icon?: ReactElement
}

export function ScrollDownIndicator({
  trigger,
  bounceDelay = BOUNCE_DELAY,
  icon = <ChevronDownIcon fontSize="large" />
}: // icon = <FacebookLogoIcon fontSize="large" />
ScrollDownIndicatorProps): ReactElement {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true)
    }, bounceDelay)
    return () => clearTimeout(timer)
  }, [bounceDelay])

  const bounce = keyframes`
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-30px); }
    60% { transform: translateY(-15px); }
  `
  return (
    <Box
      data-testid="DownArrowBox"
      sx={
        {
          // position: 'fixed',
          // left: 'calc(50% - 12px)',
          // bottom: 80, // 112,
          //  position: 'relative',
          // zIndex: 1
          // animation: shouldAnimate ? `${bounce} 2s` : 'none'
        }
      }
    >
      <Fade
        appear={false}
        in={!trigger}
        style={{
          transitionDuration: '500ms'
        }}
      >
        {icon}
      </Fade>
    </Box>
  )
}
