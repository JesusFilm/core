import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { BaseNode } from '../BaseNode'

export function LinkNode(): ReactElement {
  return (
    <BaseNode id="id">
      <Box
        sx={{
          px: 3,
          transition: (theme) => theme.transitions.create('opacity'),
          margin: 0,
          border: (theme) =>
            `1px solid ${alpha(theme.palette.secondary.dark, 0.1)}`,
          borderRadius: 2,
          height: 45,
          width: 200
        }}
      >
        <Typography
          align="left"
          noWrap
          sx={{
            fontWeight: 'bold',
            fontSize: 10
          }}
          variant="body2"
        >
          Link Node
        </Typography>
      </Box>
    </BaseNode>
  )
}
