import Chip from '@mui/material/Chip'
import { ReactElement } from 'react'

interface PublishedChipProps {
  published: boolean
  // A publish that is waiting on reconciliation (Mux still processing). The
  // Variant is still Draft, so say so rather than showing a plain Draft chip
  // an editor has already tried to change.
  publishPending?: boolean
}

export function PublishedChip({
  published,
  publishPending = false
}: PublishedChipProps): ReactElement {
  if (!published && publishPending) {
    return (
      <Chip data-testid="PublishedChip" label="Publishing..." color="info" />
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
