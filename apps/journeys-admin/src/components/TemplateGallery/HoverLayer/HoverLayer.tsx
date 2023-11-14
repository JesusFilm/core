import Box from '@mui/material/Box'
import { ReactElement } from 'react'

interface HoverLayerProps {
  className?: string
}

export function HoverLayer({ className }: HoverLayerProps): ReactElement {
  return (
    <Box
      data-testid="hoverLayer"
      className={className}
      sx={{
        transition: (theme) => theme.transitions.create('opacity'),
        content: '""',
        opacity: 0,
        backgroundColor: 'secondary.dark',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 2
      }}
    />
  )
}
