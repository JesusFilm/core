import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FC } from 'react'

export const BatchesTableHeader: FC = () => {
  return (
    <Stack
      sx={{
        p: 4
      }}
      spacing={2}
    >
      <Typography variant="h5">Batches</Typography>
      <Typography variant="subtitle3">
        Additional description if required
      </Typography>
    </Stack>
  )
}
