import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import Stack from '@mui/material/Stack'

export interface Props {
  value: string
  openDialog: () => void
}

export function ContainerDescription({
  value,
  openDialog
}: Props): ReactElement {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={4}
    >
      <Typography
        variant="subtitle1"
        component="h2"
        color="text.primary"
        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {value}
      </Typography>
      <Button
        startIcon={<ShareOutlinedIcon />}
        size="medium"
        variant="outlined"
        color="secondary"
        aria-label="collection-share-button"
        onClick={() => openDialog()}
        sx={{
          display: { xs: 'none', sm: 'flex' },
          minWidth: 220
        }}
      >
        Share
      </Button>
    </Stack>
  )
}
