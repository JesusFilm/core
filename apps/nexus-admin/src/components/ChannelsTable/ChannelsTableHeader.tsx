import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Button, Stack, Typography } from '@mui/material'
import { FC } from 'react'

export const ChannelsTableHeader: FC = () => {
  return (
    <Stack
      sx={{
        p: 4
      }}
      spacing={2}
    >
      <Typography variant="h5">Channels</Typography>
      <Typography variant="subtitle3">Additional description if required</Typography>
    </Stack>
  )
}
