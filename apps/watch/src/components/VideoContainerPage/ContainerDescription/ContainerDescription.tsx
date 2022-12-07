import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import Stack from '@mui/material/Stack'

export interface Props {
  value: string
  setOpenShare: (isOpen: boolean) => void
}

export function ContainerDescription({
  value,
  setOpenShare
}: Props): ReactElement {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={4}
      sx={{
        pt: { xs: 7, sm: 10 },
        pb: { xs: '32px', sm: '44px' },
        pt: { xs: '28px', sm: '68px' }
      }}
    >
      <Typography variant="subtitle1" color="text.primary">
        {value}
      </Typography>
      <Button
        startIcon={<ShareOutlinedIcon />}
        size="medium"
        variant="outlined"
        color="secondary"
        aria-label="collection-share-button"
        onClick={() => setOpenShare(true)}
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
