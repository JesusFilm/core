import { Breakpoint, ThemeProvider, createTheme } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom' // For extended matchers like toBeInTheDocument
import { CenterPage } from './CenterPage'

const theme = createTheme({
  spacing: (factor: number) => `${factor * 4}px`,
  breakpoints: {
    up: (key: number | Breakpoint) =>
      `@media (min-width: ${key === 'sm' ? '600px' : '0px'})`
  }
})

describe('CenterPage Component', () => {
  it('should render the children inside the Card', () => {
    render(
      <ThemeProvider theme={theme}>
        <CenterPage>
          <div data-testid="child-content">Test Child</div>
        </CenterPage>
      </ThemeProvider>
    )
    const childElement = screen.getByTestId('child-content')
    expect(childElement).toBeInTheDocument()
    expect(childElement).toHaveTextContent('Test Child')
  })

  it('should apply the styles correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <CenterPage>
          <div data-testid="child-content">Test Child</div>
        </CenterPage>
      </ThemeProvider>
    )

    const containerDiv = screen.getByTestId('CenterPageContainer')
    expect(containerDiv).toHaveStyle('height: 100dvh')
    expect(containerDiv).toHaveStyle(
      'background-image: radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))'
    )

    const card = screen.getByTestId('CenterPageCard')
    expect(card).toHaveStyle('padding: 16px')
  })
})
