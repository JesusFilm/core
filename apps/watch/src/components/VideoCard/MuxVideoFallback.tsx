import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactElement } from 'react'

import type { InsertOverlay } from '../../types/inserts'

interface MuxVideoFallbackProps {
  overlay: InsertOverlay
  variant?: 'contained' | 'expanded'
}

export function MuxVideoFallback({
  overlay,
  variant = 'expanded'
}: MuxVideoFallbackProps): ReactElement {
  return (
    <Box
      data-testid="MuxVideoFallback"
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        aspectRatio: '16 / 9',
        background:
          'linear-gradient(140deg, rgba(20, 30, 48, 0.95), rgba(36, 59, 85, 0.85))',
        color: variant === 'contained' ? 'primary.contrastText' : 'text.primary',
        display: 'flex',
        alignItems: 'flex-end'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 6px)'
        }}
      />
      <Stack spacing={1} sx={{ position: 'relative', p: 4 }}>
        <Typography variant="overline2" sx={{ opacity: 0.8 }}>
          {overlay.label}
        </Typography>
        <Typography component="h3" variant="h6" fontWeight="bold">
          {overlay.title}
        </Typography>
        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
          {overlay.collection}
        </Typography>
        <Typography variant="body2" sx={{ maxWidth: 420 }}>
          {overlay.description}
        </Typography>
      </Stack>
    </Box>
  )
}
