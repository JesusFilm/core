import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { LocalAppBar } from './LocalAppBar'

describe('LocalAppBar', () => {
  const mockOnMenuClick = jest.fn()

  beforeEach(() => {
    mockOnMenuClick.mockReset()
  })

  it('should render correctly', () => {
    render(
      <MockedProvider>
        <LocalAppBar onMenuClick={mockOnMenuClick} />
      </MockedProvider>
    )

    expect(screen.getByTestId('Header')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Watch Logo' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'open header menu' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('MenuBox')).toBeInTheDocument()
  })

  it('should call onMenuClick when menu button is clicked', () => {
    render(
      <MockedProvider>
        <LocalAppBar onMenuClick={mockOnMenuClick} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'open header menu' }))
    expect(mockOnMenuClick).toHaveBeenCalledTimes(1)
  })

  it('should have a link to the watch page', () => {
    render(
      <MockedProvider>
        <LocalAppBar onMenuClick={mockOnMenuClick} />
      </MockedProvider>
    )

    expect(screen.getByTestId('WatchLogo')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/'
    )
  })

  it('should add expanded class to menu button when menuOpen is true', () => {
    render(
      <MockedProvider>
        <LocalAppBar onMenuClick={mockOnMenuClick} menuOpen />
      </MockedProvider>
    )

    const menuButton = screen.getByRole('button', { name: 'open header menu' })
    expect(menuButton).toHaveClass('expanded')
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('should not add expanded class to menu button when menuOpen is false', () => {
    render(
      <MockedProvider>
        <LocalAppBar onMenuClick={mockOnMenuClick} menuOpen={false} />
      </MockedProvider>
    )

    const menuButton = screen.getByRole('button', { name: 'open header menu' })
    expect(menuButton).not.toHaveClass('expanded')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should hide language switcher by default', () => {
    render(
      <MockedProvider>
        <LocalAppBar onMenuClick={jest.fn()} />
      </MockedProvider>
    )

    expect(screen.queryByTestId('LanguageRoundedIcon')).not.toBeInTheDocument()
  })

  it('should open the language switcher dialog when language selector is clicked', async () => {
    render(
      <MockedProvider>
        <LocalAppBar onMenuClick={mockOnMenuClick} showLanguageSwitcher />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('LanguageSelector'))
    // Adjust the below line if the dialog has a different test id or text
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})
