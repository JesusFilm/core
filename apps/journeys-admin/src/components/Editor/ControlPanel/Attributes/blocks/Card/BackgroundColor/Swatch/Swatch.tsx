import Box from '@mui/material/Box'
import { ReactElement } from 'react'

interface SwatchProps {
  id: string
  color: string
}

export function Swatch({ id, color }: SwatchProps): ReactElement {
  return (
    <Box
      data-testid={id}
      id={id}
      sx={{
        backgroundColor: color,
        minWidth: 56,
        width: 56,
        height: 56,
        borderRadius: 2,
        border: '1px solid rgba(0, 0, 0, 0.2)'
      }}
    />
  )
}
