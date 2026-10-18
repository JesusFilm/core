import Popover from '@mui/material/Popover'
import Popper from '@mui/material/Popper'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { render, screen, waitFor } from '@testing-library/react'

import { FrameTheme } from './FrameTheme'

describe('FrameTheme', () => {
  it('opens a popover without an anchor in the frame’s body, not the editor’s', async () => {
    const frameDocument = document.implementation.createHTMLDocument('frame')
    render(
      <ThemeProvider theme={createTheme()}>
        <FrameTheme document={frameDocument}>
          <Popover
            open
            anchorReference="anchorPosition"
            anchorPosition={{ top: 10, left: 10 }}
          >
            Colours
          </Popover>
        </FrameTheme>
      </ThemeProvider>
    )

    await waitFor(() =>
      expect(frameDocument.body.textContent).toContain('Colours')
    )
    expect(screen.queryByText('Colours')).not.toBeInTheDocument()
  })

  it('opens a popper in the frame’s body, not the editor’s', async () => {
    const frameDocument = document.implementation.createHTMLDocument('frame')
    render(
      <ThemeProvider theme={createTheme()}>
        <FrameTheme document={frameDocument}>
          <Popper open anchorEl={null}>
            Options
          </Popper>
        </FrameTheme>
      </ThemeProvider>
    )

    await waitFor(() =>
      expect(frameDocument.body.textContent).toContain('Options')
    )
    expect(screen.queryByText('Options')).not.toBeInTheDocument()
  })
})
