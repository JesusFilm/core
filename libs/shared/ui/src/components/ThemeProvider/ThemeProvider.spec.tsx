import { render } from '@testing-library/react'

import { ThemeMode, ThemeName, getTheme } from '../../libs/themes'

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
          getTheme({ themeName: ThemeName.base, themeMode: ThemeMode.light })
            .palette.background.default
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
          getTheme({ themeName: ThemeName.base, themeMode: ThemeMode.dark })
            .palette.background.default
        };`
      )
    )
  })

  it('should apply base rtl theme', () => {
    const { baseElement } = render(
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light} rtl>
        Hello from ThemeProvider
      </ThemeProvider>
    )
    expect(baseElement.parentElement?.innerHTML).toEqual(
      expect.stringContaining(
        `font-family:${
          getTheme({
            themeName: ThemeName.base,
            themeMode: ThemeMode.light,
            rtl: true
          }).typography.fontFamily ?? ''
        };`
      )
    )
  })

  it('should apply urdu rtl theme', () => {
    const { baseElement } = render(
      <ThemeProvider
        themeName={ThemeName.base}
        themeMode={ThemeMode.light}
        rtl
        locale="ur"
      >
        Hello from ThemeProvider
      </ThemeProvider>
    )
    expect(baseElement.parentElement?.innerHTML).toEqual(
      expect.stringContaining(
        `font-family:${
          getTheme({
            themeName: ThemeName.base,
            themeMode: ThemeMode.light,
            rtl: true,
            locale: 'ur'
          }).typography.fontFamily ?? ''
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
    expect(baseElement.parentElement?.innerHTML).toBe(
      '<head></head><body><div>Hello from ThemeProvider</div></body>'
    )
  })
})
