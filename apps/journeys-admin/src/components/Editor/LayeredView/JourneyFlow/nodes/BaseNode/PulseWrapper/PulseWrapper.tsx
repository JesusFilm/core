import { keyframes } from '@emotion/react'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import {
  HANDLE_DIAMETER,
  HANDLE_WITH_BORDER_DIAMETER,
  STEP_NODE_CARD_HEIGHT
} from '../../StepBlockNode/libs/sizes'

const pulse = keyframes`
  0%,10% {
    opacity: 0;
    transform: scale(1);
  }
  70% {
    opacity: 0.2;
    transform: scale(1.8);
  }
  80% {
    opacity: 0.05;
    transform: scale(1.8);
  }
  90 {
    opacity: 0.02;
    transform: scale(1.8);
  }
  
  100% {
    opacity: 0;
    transform: scale(2);
  }
`

interface PulseWrapperProps {
  show: boolean
  children: ReactElement
}

export function PulseWrapper({
  show,
  children
}: PulseWrapperProps): ReactElement {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex'
      }}
    >
      <Box sx={{ zIndex: 2 }}>{children}</Box>
      {show && (
        <Box
          sx={{
            background: 'red',
            position: 'absolute',
            left: -HANDLE_DIAMETER,
            top: STEP_NODE_CARD_HEIGHT / 2,
            borderRadius: '100%',
            height: HANDLE_WITH_BORDER_DIAMETER,
            width: HANDLE_WITH_BORDER_DIAMETER,
            animation: `${pulse} 0.8s infinite`
          }}
        />
      )}
    </Box>
  )
}
