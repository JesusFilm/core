import { render } from '@testing-library/react'
import { ThemeName } from '../../../__generated__/globalTypes'
import { JourneysThemeProvider } from '.'

describe('journeys theme provider', () => {
  it('should render the component', () => {
    const { getByText } = render(
      <JourneysThemeProvider theme={'default' as ThemeName}>
        Hello from JourneysThemeProvider
      </JourneysThemeProvider>
    )
    expect(getByText('Hello from JourneysThemeProvider')).toBeDefined()
  })
})
