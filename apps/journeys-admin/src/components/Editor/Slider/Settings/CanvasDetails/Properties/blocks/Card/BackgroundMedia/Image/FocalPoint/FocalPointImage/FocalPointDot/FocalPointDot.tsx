import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { Position } from '../../FocalPoint'

interface FocalPointDotProps {
  localPosition: Position
  onDragStart: () => void
}

export function FocalPointDot({
  localPosition,
  onDragStart
}: FocalPointDotProps): ReactElement {
  function handleMouseDown(e: React.MouseEvent): void {
    e.preventDefault()
    onDragStart()
  }

  return (
    <Box
      data-testid="focal-point-dot"
      sx={{
        width: 30,
        height: 30,
        cursor: 'move',
        borderRadius: '50%',
        position: 'absolute',
        pointerEvents: 'auto',
        top: `${localPosition.y}%`,
        left: `${localPosition.x}%`,
        transform: 'translate(-50%, -50%)',
        backdropFilter: 'blur(4px)',
        border: '2px solid white',
        boxShadow: (theme) => theme.shadows[3]
      }}
      onMouseDown={handleMouseDown}
    />
  )
}
