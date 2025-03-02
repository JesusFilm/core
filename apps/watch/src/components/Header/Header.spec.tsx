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
    const { getByRole } = render(<Header />)
    fireEvent.click(getByRole('button', { name: 'open header menu' }))
    expect(getByRole('button', { name: 'About Us' })).toBeInTheDocument()
  })

  it('should hide absolute app bar', () => {
    const { queryByRole } = render(<Header hideAbsoluteAppBar />)

    expect(
      queryByRole('button', { name: 'open header menu' })
    ).not.toBeInTheDocument()
  })

  it('should hide spacer', () => {
    render(<Header hideAbsoluteAppBar hideSpacer />)
    expect(screen.queryByTestId('HeaderSpacer')).not.toBeInTheDocument()
  })
})
