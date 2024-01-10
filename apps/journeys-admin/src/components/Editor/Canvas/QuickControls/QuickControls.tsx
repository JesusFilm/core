import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { DeleteBlock } from './DeleteBlock'
import { DuplicateBlock } from './DuplicateBlock'
import { MoveBlock } from './MoveBlock'

export function QuickControls(): ReactElement {
  return (
    <Stack
      justifyContent="flex-end"
      spacing={4}
      sx={{
        height: 'calc(100% - 32px)',
        maxHeight: 640
      }}
    >
      <MoveBlock />
      <DuplicateBlock variant="button" />
      <DeleteBlock variant="button" />
    </Stack>
  )
}
