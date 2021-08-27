import { render } from '@testing-library/react'
import { JourneysThemeProvider } from '.'

describe('journeys theme provider', () => {
  it('should render the component', () => {
    const { getByText } = render(
      <JourneysThemeProvider>
        Hello from JourneysThemeProvider
      </JourneysThemeProvider>
    )
    expect(getByText('Hello from JourneysThemeProvider')).toBeDefined()
  })
})
