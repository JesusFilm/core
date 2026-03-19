import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

type ToolCallStatus = 'running' | 'complete'

interface ToolCallCardProps {
  label: string
  status: ToolCallStatus
}

export function ToolCallCard({
  label,
  status
}: ToolCallCardProps): ReactElement {
  return (
    <Stack
      data-testid="ToolCallCard"
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        bgcolor: '#F5F5F5',
        borderRadius: '8px',
        px: 1.5,
        py: 1,
        display: 'inline-flex'
      }}
    >
      {status === 'running' ? (
        <CircularProgress size={14} sx={{ color: 'text.secondary' }} />
      ) : (
        <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
      )}
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontSize: 12 }}
      >
        {label}
      </Typography>
    </Stack>
  )
}
