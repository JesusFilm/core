import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import { render, screen } from '@testing-library/react'
import { EmptySearch } from './EmptySearch'

describe('EmptySearch', () => {
  it('should render emptysearch', () => {
    render(
      <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.light}>
        <EmptySearch />
      </ThemeProvider>
    )

    const sorryText = screen.getByText('Sorry, no results')
    expect(sorryText).toHaveStyle({
      color: '#EF3340'
    })
    expect(
      screen.getByText('Try removing or changing something from your request')
    ).toBeInTheDocument()
  })
})
