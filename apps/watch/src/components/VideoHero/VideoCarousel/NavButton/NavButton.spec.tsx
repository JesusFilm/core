import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { ReactElement } from 'react'

import { NavButton } from './NavButton'

const theme = createTheme()

describe('NavButton', () => {
  const renderWithTheme = (component: ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
  }

  it('renders prev button with correct icon', () => {
    renderWithTheme(<NavButton variant="prev" />)

    expect(screen.getByTestId('NavButton')).toBeInTheDocument()
    expect(screen.getByTestId('NavigateBeforeIcon')).toBeInTheDocument()
    expect(screen.queryByTestId('NavigateNextIcon')).not.toBeInTheDocument()
  })

  it('renders next button with correct icon', () => {
    renderWithTheme(<NavButton variant="next" />)

    expect(screen.getByTestId('NavButton')).toBeInTheDocument()
    expect(screen.getByTestId('NavigateNextIcon')).toBeInTheDocument()
    expect(screen.queryByTestId('NavigateBeforeIcon')).not.toBeInTheDocument()
  })

  it('sets correct aria-label for prev button', () => {
    renderWithTheme(<NavButton variant="prev" />)

    expect(screen.getByLabelText('Previous slide')).toBeInTheDocument()
  })

  it('sets correct aria-label for next button', () => {
    renderWithTheme(<NavButton variant="next" />)

    expect(screen.getByLabelText('Next slide')).toBeInTheDocument()
  })

  it('disables button when disabled prop is true', () => {
    renderWithTheme(<NavButton variant="prev" disabled />)

    const button = screen.getByTestId('NavButton')
    expect(button).toBeDisabled()
  })

  it('enables button when disabled prop is false', () => {
    renderWithTheme(<NavButton variant="prev" disabled={false} />)

    const button = screen.getByTestId('NavButton')
    expect(button).not.toBeDisabled()
  })
})
