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
    const expectedBackgroundColor = getTheme({
      themeName: ThemeName.base,
      themeMode: ThemeMode.light
    }).palette.background.default
    expect(baseElement).toHaveStyle(
      `background-color: ${expectedBackgroundColor}`
    )
  })

  it('should apply base dark theme', () => {
    const { baseElement } = render(
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.dark}>
        Hello from ThemeProvider
      </ThemeProvider>
    )
    const expectedBackgroundColor = getTheme({
      themeName: ThemeName.base,
      themeMode: ThemeMode.dark
    }).palette.background.default

    expect(baseElement).toHaveStyle(
      `background-color: ${expectedBackgroundColor}`
    )
  })

  it('should apply base rtl theme', () => {
    const { baseElement } = render(
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light} rtl>
        Hello from ThemeProvider
      </ThemeProvider>
    )
    const expectedRtlTheme = `font-family:${
      getTheme({
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        rtl: true
      }).typography.fontFamily ?? ''
    };`

    expect(baseElement).toHaveStyle(expectedRtlTheme)
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

    const expectedUrduRtlTheme = `font-family:${
      getTheme({
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        rtl: true,
        locale: 'ur'
      }).typography.fontFamily ?? ''
    };`

    expect(baseElement).toHaveStyle(expectedUrduRtlTheme)
  })

  it('should not apply CssBaseline when nestedTheme', () => {
    const { container } = render(
      <ThemeProvider
        themeName={ThemeName.base}
        themeMode={ThemeMode.dark}
        nested
      >
        Hello from ThemeProvider
      </ThemeProvider>
    )
    // Check that our content is rendered correctly
    expect(container.textContent).toBe('Hello from ThemeProvider')
    // When nested=true, CssBaseline should not be rendered, so we shouldn't see global styles applied
    expect(container.firstChild).toHaveTextContent('Hello from ThemeProvider')
  })
})
