import { Stack, Typography } from '@mui/material'
import { FC } from 'react'

export const TableHeader: FC = () => {
  return (
    <Stack
      sx={{
        p: 4
      }}
      spacing={2}
    >
      <Typography variant="h5">Channels created</Typography>
      <Typography variant="subtitle3">
        Additional description if required
      </Typography>
    </Stack>
  )
}
