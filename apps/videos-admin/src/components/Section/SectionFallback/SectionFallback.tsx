import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

export function SectionFallback({
  loading,
  message
}: {
  loading: boolean
  message: string
}): ReactElement {
  return (
    <Box
      sx={{ display: 'grid', placeItems: 'center', padding: 2, height: 240 }}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Typography variant="subtitle2" fontWeight={500}>
          {message}
        </Typography>
      )}
    </Box>
  )
}
