import Box from '@mui/material/Box'
import { ReactElement } from 'react'

export function HoverLayer(): ReactElement {
  return (
    <Box
      data-testid="hoverLayer"
      sx={{
        '&:hover': {
          opacity: 0.3
        },
        transition: (theme) => theme.transitions.create('opacity'),
        content: '""',
        opacity: 0,
        backgroundColor: 'secondary.dark',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1
      }}
    />
  )
}
