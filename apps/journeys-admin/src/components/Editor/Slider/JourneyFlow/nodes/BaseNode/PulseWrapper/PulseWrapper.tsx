import { ReactElement } from 'react'
import { keyframes } from '@emotion/react'
import Box from '@mui/material/Box'
import { STEP_NODE_HEIGHT } from '../../StepBlockNode'

const pulse = keyframes`
  0%,10% {
    opacity: 0;
    transform: scale(1);
  }
  80% {
    opacity: 0.3;
    transform: scale(2);
  }
  81%,100% {
    opacity: 0;
    transform: scale(1);
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
            ml: '-6.25px',
            top: STEP_NODE_HEIGHT / 2 + 1,
            borderRadius: '100%',
            height: '10px',
            width: '10px',
            animation: `${pulse} 0.8s infinite`
          }}
        />
      )}
    </Box>
  )
}
