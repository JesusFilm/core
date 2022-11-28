import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import Stack from '@mui/material/Stack'

export interface Props {
  value: string
}

export function Description({ value }: Props): ReactElement {
  return (
    <Stack direction="row" spacing={4}>
      <Typography
        variant="subtitle1"
        color="text.primary"
        sx={{ maxWidth: '70%' }}
      >
        {value}
      </Typography>
      <Button
        sx={
          {
            // width: 2220,
            // height: 60
          }
        }
        variant="outlined"
        startIcon={<ShareOutlinedIcon sx={{ color: 'text.secondary' }} />}
      >
        <Typography variant="h6">Share</Typography>
      </Button>
    </Stack>
  )
}
