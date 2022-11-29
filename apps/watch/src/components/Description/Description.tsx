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
    <Stack direction="row" spacing={4} alignItems="flex-start">
      <Typography variant="subtitle1" color="text.primary">
        {value}
      </Typography>
      <Button
        size="medium"
        variant="outlined"
        color="secondary"
        aria-label="collection-share-button"
        sx={{
          display: { xs: 'none', sm: 'flex' },
          minWidth: 220,
          gap: '11px'
        }}
      >
        <ShareOutlinedIcon />
        <Typography variant="subtitle1" color="text.secondary">
          Share
        </Typography>
      </Button>
    </Stack>
  )
}
