import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FC } from 'react'

interface BatchesTableHeaderProps {
  onTableView: () => void
}

export const BatchesTableHeader: FC<BatchesTableHeaderProps> = ({
  onTableView
}) => {
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
