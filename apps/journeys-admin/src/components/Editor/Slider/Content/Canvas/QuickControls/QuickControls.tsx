import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { ThemeProvider } from '../../../../../ThemeProvider'

import { DeleteBlock } from './DeleteBlock'
import { DuplicateBlock } from './DuplicateBlock'
import { MoveBlock } from './MoveBlock'

export function QuickControls({ open, anchorEl }): ReactElement {
  return (
    <ThemeProvider nested>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="top"
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1
        }}
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper sx={{ mb: 2, p: 1 }}>
              <Stack spacing={2} direction="row">
                <MoveBlock />
                <DuplicateBlock variant="button" />
                <DeleteBlock variant="button" />
              </Stack>
            </Paper>
          </Fade>
        )}
      </Popper>
    </ThemeProvider>
  )
}
