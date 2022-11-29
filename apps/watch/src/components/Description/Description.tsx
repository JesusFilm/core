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
        aria-label="collection-share-button"
        size="medium"
        variant="outlined"
        sx={{
          display: { xs: 'none', sm: 'flex' },
          borderColor: 'secondary.main', // TODO: #BBBCBC
          minWidth: 220,
          gap: '11px'
        }}
      >
        <ShareOutlinedIcon sx={{ color: 'text.secondary' }} />
        <Typography variant="subtitle1" color="text.secondary">
          Share
        </Typography>
      </Button>
    </Stack>
  )
}
