import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface PublishedChipProps {
  published: boolean
  // A publish that is waiting for Mux before the Variant goes live (see
  // isPublishPending).
  pending?: boolean
}

export function PublishedChip({
  published,
  pending = false
}: PublishedChipProps): ReactElement {
  if (pending) {
    return (
      <Stack sx={{ alignItems: 'flex-start' }}>
        <Chip data-testid="PublishedChip" label="Publishing..." color="info" />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Waiting for Mux to finish processing
        </Typography>
      </Stack>
    )
  }

  return (
    <Chip
      data-testid="PublishedChip"
      label={published ? 'Published' : 'Draft'}
      color={published ? 'success' : 'warning'}
    />
  )
}
