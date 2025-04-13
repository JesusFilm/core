import useScrollTrigger from '@mui/material/useScrollTrigger'
import { fireEvent, render, screen } from '@testing-library/react'

import { Header } from './Header'

jest.mock('@mui/material/useScrollTrigger', () => ({
  __esModule: true,
  default: jest.fn()
}))

const useScrollTriggerMock = useScrollTrigger as jest.Mock

describe('Header', () => {
  beforeEach(() => {
    useScrollTriggerMock.mockReset()
  })

  it('should open navigation panel on menu icon click', async () => {
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: 'open header menu' }))
    expect(screen.getByRole('button', { name: 'Give' })).toBeInTheDocument()
  })

  it('should set menuOpen prop on LocalAppBar when menu is clicked', () => {
    render(<Header />)

    expect(
      screen.queryByRole('button', { name: 'Give' })
    ).not.toBeInTheDocument()
    const menuButton = screen.getByRole('button', { name: 'open header menu' })
    expect(menuButton).not.toHaveClass('expanded')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(menuButton)
    expect(menuButton).toHaveClass('expanded')
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Give' })).toBeInTheDocument()
  })

  it('should hide bottom app bar', () => {
    render(<Header hideBottomAppBar />)
    expect(screen.queryByTestId('BottomAppBar')).not.toBeInTheDocument()
  })

  it('should hide spacer', () => {
    render(<Header hideSpacer />)
    expect(screen.queryByTestId('HeaderSpacer')).not.toBeInTheDocument()
  })

  it('should hide top app bar', () => {
    render(<Header hideTopAppBar />)
    expect(screen.queryByTestId('TopAppBar')).not.toBeInTheDocument()
  })
})
