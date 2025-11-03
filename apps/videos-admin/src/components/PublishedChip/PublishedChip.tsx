import Chip from '@mui/material/Chip'
import { ReactElement } from 'react'

interface PublishedChipProps {
  published: boolean
}

export function PublishedChip({ published }: PublishedChipProps): ReactElement {
  return (
    <Chip
      data-testid="PublishedChip"
      label={published ? 'Published' : 'Draft'}
      color={published ? 'success' : 'warning'}
    />
  )
}
