import { Box, keyframes, Typography } from '@mui/material'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import { type ReactElement } from 'react'

const floatUp = keyframes`
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    transform: scale(0.8) rotate(-10deg);
    opacity: 0.8;
  }
  20% {
    transform: scale(1.1) rotate(-15deg);
    opacity: 1;
  }
  35% {
    transform: scale(1.2) rotate(8deg);
    opacity: 1;
  }
  45% {
    transform: scale(1.2) rotate(-3deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(0deg);
    opacity: 1;
  }
  75% {
    transform: translateY(-50%) scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: translateY(-150%) scale(1);
    opacity: 0;
  }
`

const fadeInOut = keyframes`
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`

const fadeText = keyframes`
  0% {
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`

export function LikeAnimation(): ReactElement {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 9998,
        animation: `${fadeInOut} 1s ease-in-out forwards`
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            animation: `${floatUp} 1s ease-out forwards`,
            color: 'white'
          }}
        >
          <ThumbUpIcon sx={{ fontSize: 60 }} />
        </Box>
        <Typography
          sx={{
            mt: 5,
            px: 3,
            py: 0.5,
            fontWeight: 600,
            fontSize: '14px',
            color: 'white',
            bgcolor: 'black',
            borderRadius: '100px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            animation: `${fadeText} 1s ease-in-out forwards`
          }}
        >
          relevant
        </Typography>
      </Box>
    </Box>
  )
}
