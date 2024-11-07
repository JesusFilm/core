import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { MouseEvent, ReactElement } from 'react'

import { ThemeProvider } from '../../../../../ThemeProvider'

import { DeleteBlock } from './DeleteBlock'
import { DuplicateBlock } from './DuplicateBlock'
import { MoveBlock } from './MoveBlock'

interface QuickControlsProps {
  open: boolean
  anchorEl: HTMLDivElement | null
  isVideoBlock: boolean
}

export function QuickControls({
  open,
  anchorEl,
  isVideoBlock
}: QuickControlsProps): ReactElement {
  function handleClick(e: MouseEvent<HTMLDivElement>): void {
    e.stopPropagation()
  }

  return (
    <ThemeProvider nested>
      <Popper
        open={open}
        anchorEl={anchorEl}
        onClick={handleClick}
        placement="top"
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1
        }}
        transition
        data-testid="QuickControls"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: () => [0, isVideoBlock ? -70 : 0]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper sx={{ mb: 2, p: 1 }}>
              <Stack spacing={2} direction="row">
                <MoveBlock />
                <DuplicateBlock disabled={isVideoBlock} />
                <DeleteBlock variant="button" />
              </Stack>
            </Paper>
          </Fade>
        )}
      </Popper>
    </ThemeProvider>
  )
}
