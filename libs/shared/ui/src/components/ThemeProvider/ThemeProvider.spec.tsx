import { render } from '@testing-library/react'
import { themes } from '../../libs/themes'
import { ThemeName, ThemeMode } from './ThemeProvider'
import { ThemeProvider } from '.'

describe('ThemeProvider', () => {
  it('should apply base light theme', () => {
    const { baseElement } = render(
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
        Hello from ThemeProvider
      </ThemeProvider>
    )
    expect(baseElement.parentElement?.innerHTML).toEqual(
      expect.stringContaining(
        `background-color:${
          themes[ThemeName.base][ThemeMode.light].palette.background.default
        };`
      )
    )
  })

  it('should apply base dark theme', () => {
    const { baseElement } = render(
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.dark}>
        Hello from ThemeProvider
      </ThemeProvider>
    )
    expect(baseElement.parentElement?.innerHTML).toEqual(
      expect.stringContaining(
        `background-color:${
          themes[ThemeName.base][ThemeMode.dark].palette.background.default
        };`
      )
    )
  })

  it('should not apply CssBaseline when nestedTheme', () => {
    const { baseElement } = render(
      <ThemeProvider
        themeName={ThemeName.base}
        themeMode={ThemeMode.dark}
        nested
      >
        Hello from ThemeProvider
      </ThemeProvider>
    )
    expect(baseElement.parentElement?.innerHTML).toEqual(
      '<head></head><body><div>Hello from ThemeProvider</div></body>'
    )
  })
})
