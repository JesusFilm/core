import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface PublishedChipProps {
  published: boolean
  // A publish still unlanded on the reconciliation row (see isPublishPending)
  // -- Mux transcoding, a parent-sync retry, or an Algolia retry.
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
          Finishing publish processing
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
