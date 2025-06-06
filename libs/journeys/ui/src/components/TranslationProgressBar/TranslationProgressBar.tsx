import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
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
  showPercentage = false
}: TranslationProgressBarProps): ReactElement {
  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      <Typography
        variant="h6"
        sx={{
          mb: 4,
          color: 'text.primary',
          fontWeight: 500
        }}
      >
        {message}
      </Typography>
      <LinearProgress
        variant={variant}
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: 'primary.main'
          }
        }}
      />
    </Box>
  )
}
