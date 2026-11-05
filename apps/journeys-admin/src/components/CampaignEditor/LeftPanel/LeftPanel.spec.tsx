import { render, screen } from '@testing-library/react'

import { ThemeProvider } from '../../ThemeProvider'

import { LEFT_PANEL_PADDING, LeftPanelBody } from './LeftPanel'

describe('LeftPanelBody', () => {
  it('pads its content from the shared left panel padding and scrolls vertically only', () => {
    render(
      <ThemeProvider>
        <LeftPanelBody data-testid="Body">content</LeftPanelBody>
      </ThemeProvider>
    )

    const body = getComputedStyle(screen.getByTestId('Body'))
    expect(body.padding).toBe(`${LEFT_PANEL_PADDING * 4}px`)
    expect(body.overflowY).toBe('auto')
    expect(body.overflowX).toBe('hidden')
  })
})
