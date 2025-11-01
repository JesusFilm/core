import { fireEvent, render, screen } from '@testing-library/react'

import { Header } from './Header'

jest.mock('../SearchComponent/LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="LanguageSelector" />
}))

jest.mock('react-instantsearch', () => {
  const actual = jest.requireActual('react-instantsearch')
  return {
    ...actual,
    useInstantSearchContext: jest.fn()
  }
})

const useInstantSearchContextMock = jest.requireMock('react-instantsearch')
  .useInstantSearchContext as jest.Mock

describe('Header', () => {
  beforeEach(() => {
    useInstantSearchContextMock.mockReset()
  })

  it('should open navigation panel on menu icon click', () => {
    useInstantSearchContextMock.mockImplementation(() => ({}))

    render(<Header />)

    const menuButton = screen.getByRole('button', { name: 'open header menu' })
    expect(menuButton).not.toHaveClass('expanded')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(menuButton)

    expect(menuButton).toHaveClass('expanded')
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('HeaderMenuPanel')).toBeInTheDocument()
  })

  it('should render language selector when enabled inside instant search', () => {
    useInstantSearchContextMock.mockImplementation(() => ({}))

    render(<Header showLanguageSwitcher />)

    expect(screen.getByTestId('LanguageSelector')).toBeInTheDocument()
  })

  it('should not render language selector without instant search context', () => {
    useInstantSearchContextMock.mockImplementation(() => {
      throw new Error('no context')
    })

    render(<Header showLanguageSwitcher />)

    expect(screen.queryByTestId('LanguageSelector')).not.toBeInTheDocument()
  })
})
