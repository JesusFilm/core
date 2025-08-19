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
  anchorEl: HTMLElement | null
  block: any
}

export function QuickControls({
  open,
  anchorEl,
  block
}: QuickControlsProps): ReactElement {
  const isVideoBlock = block?.__typename === 'VideoBlock'

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
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              sx={{
                mb: 4,
                py: { xs: 1, sm: 0.5 },
                pl: { xs: 1, sm: 0.5 },
                pr: 1,
                borderRadius: 2
              }}
            >
              <Stack direction="row" sx={{ gap: { xs: 2, sm: 0.5 } }}>
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
