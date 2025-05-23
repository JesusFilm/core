import { Box, LinearProgress, Typography } from '@mui/material'
import { ReactElement } from 'react'

interface TranslationProgressBarProps {
  progress: number
  message: string
  variant?: 'determinate' | 'indeterminate'
  showPercentage?: boolean
}

export function TranslationProgressBar({
  progress,
  message,
  variant = 'determinate',
  showPercentage = true
}: TranslationProgressBarProps): ReactElement {
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ minWidth: 35 }}>
          {showPercentage && (
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}%
            </Typography>
          )}
        </Box>
        <Box sx={{ width: '100%', ml: 1 }}>
          <LinearProgress
            variant={variant}
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: progress === 100 ? '#4caf50' : '#2196f3'
              }
            }}
          />
        </Box>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontStyle: 'italic' }}
      >
        {message}
      </Typography>
    </Box>
  )
}
