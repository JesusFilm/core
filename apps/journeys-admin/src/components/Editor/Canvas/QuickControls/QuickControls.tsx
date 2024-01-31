import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { DeleteBlock } from './DeleteBlock'
import { DuplicateBlock } from './DuplicateBlock'
import { MoveBlock } from './MoveBlock'

export function QuickControls(): ReactElement {
  return (
    <Stack spacing={4}>
      <MoveBlock />
      <DuplicateBlock variant="button" />
      <DeleteBlock variant="button" />
    </Stack>
  )
}
