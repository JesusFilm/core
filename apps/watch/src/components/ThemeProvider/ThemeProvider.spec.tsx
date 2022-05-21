import { render } from '@testing-library/react'
import { theme } from './ThemeProvider'
import { ThemeProvider } from '.'

describe('ThemeProvider', () => {
  it('should apply base light theme', () => {
    const { baseElement } = render(
      <ThemeProvider>Hello from ThemeProvider</ThemeProvider>
    )
    expect(baseElement.parentElement?.innerHTML).toEqual(
      expect.stringContaining(
        `background-color:${theme.palette.background.default};`
      )
    )
  })

  it('should apply base dark theme', () => {
    const { baseElement } = render(
      <ThemeProvider>Hello from ThemeProvider</ThemeProvider>
    )
    expect(baseElement.parentElement?.innerHTML).toEqual(
      expect.stringContaining(
        `background-color:${theme.palette.background.default};`
      )
    )
  })

  it('should not apply CssBaseline when nestedTheme', () => {
    const { baseElement } = render(
      <ThemeProvider>Hello from ThemeProvider</ThemeProvider>
    )
    expect(baseElement.parentElement?.innerHTML).toEqual(
      '<head></head><body><div>Hello from ThemeProvider</div></body>'
    )
  })
})
