import { render, screen } from '@testing-library/react'

import { ThemeProvider } from '../../ThemeProvider'

import { LeftPanelBody } from './LeftPanel'

describe('LeftPanelBody', () => {
  it('scrolls vertically only', () => {
    render(
      <ThemeProvider>
        <LeftPanelBody data-testid="Body">content</LeftPanelBody>
      </ThemeProvider>
    )

    const body = getComputedStyle(screen.getByTestId('Body'))
    expect(body.overflowY).toBe('auto')
    expect(body.overflowX).toBe('hidden')
  })
})
