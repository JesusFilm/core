import Box from '@mui/material/Box'
import { ReactElement } from 'react'

interface SwatchProps {
  id: string
  color: string
  variant?: 'rounded' | 'square'
}

export function Swatch({
  id,
  color,
  variant = 'square'
}: SwatchProps): ReactElement {
  return (
    <Box
      data-testid={`Swatch-${id}`}
      id={id}
      sx={{
        backgroundColor: color,
        minWidth: variant === 'rounded' ? 46 : 56,
        width: variant === 'rounded' ? 46 : 56,
        height: variant === 'rounded' ? 46 : 56,
        borderRadius: variant === 'rounded' ? '50%' : 2,
        border: '1px solid rgba(0, 0, 0, 0.2)'
      }}
    />
  )
}
