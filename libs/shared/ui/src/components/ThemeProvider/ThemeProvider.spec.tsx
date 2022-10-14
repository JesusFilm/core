import { render } from '@testing-library/react'
import { getTheme, themes } from '../../libs/themes'
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
          getTheme(ThemeName.base, ThemeMode.light, false).palette.background
            .default
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
          getTheme(ThemeName.base, ThemeMode.dark, false).palette.background
            .default
        };`
      )
    )
  })

  it('should apply base rtl theme', () => {
    const { baseElement } = render(
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
        Hello from ThemeProvider
      </ThemeProvider>
    )
    expect(baseElement.parentElement?.innerHTML).toEqual(
      expect.stringContaining(
        `font-family:${
          getTheme(ThemeName.base, ThemeMode.light, false).typography.fontFamily
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
