import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
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
  const theme = useTheme()
  const smUp = useMediaQuery(theme.breakpoints.up('sm'))

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
                mb: 3.5,
                py: smUp ? 0.5 : 1,
                pl: smUp ? 0.5 : 1,
                pr: 1,
                borderRadius: 2
              }}
            >
              <Stack direction="row" spacing={smUp ? 0.5 : 2}>
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
