import { render, screen } from '@testing-library/react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { EmptySearch } from './EmptySearch'

describe('EmptySearch', () => {
  it('should render emptysearch', () => {
    render(
      <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.light}>
        <EmptySearch />
      </ThemeProvider>
    )

    expect(screen.getByText('Sorry, no results')).toHaveStyle({
      color: '#CB333B'
    })
    expect(
      screen.getByText('Try removing or changing something from your request')
    ).toBeInTheDocument()
  })
})
