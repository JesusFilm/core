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
        minWidth: {
          xs: 56,
          sm: variant === 'rounded' ? 49 : 56
        },
        width: {
          xs: 56,
          sm: variant === 'rounded' ? 49 : 56
        },
        height: {
          xs: 56,
          sm: variant === 'rounded' ? 49 : 56
        },
        borderRadius: variant === 'rounded' ? '50%' : 2,
        border: '1px solid rgba(0, 0, 0, 0.2)'
      }}
    />
  )
}
