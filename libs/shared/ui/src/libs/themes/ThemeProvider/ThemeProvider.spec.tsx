import { render } from '@testing-library/react'
import { ThemeName, ThemeMode } from '../../../../__generated__/globalTypes'
import { ThemeProvider } from '.'

describe('journeys theme provider', () => {
  it('should render the component', () => {
    const { getByText } = render(
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
        Hello from ThemeProvider
      </ThemeProvider>
    )
    expect(getByText('Hello from ThemeProvider')).toBeDefined()
  })
})
