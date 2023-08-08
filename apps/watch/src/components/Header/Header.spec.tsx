import useScrollTrigger from '@mui/material/useScrollTrigger'
import { fireEvent, render, waitFor } from '@testing-library/react'

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
    const { getByText, getByRole, queryByText } = render(<Header />)

    fireEvent.click(getByRole('button', { name: 'open header menu' }))
    fireEvent.click(getByText('About'))
    await waitFor(() => expect(queryByText('About')).not.toBeInTheDocument())
  })

  it('should show fixed app bar', async () => {
    useScrollTriggerMock.mockReturnValue(true)
    const { getAllByRole, getByText, queryByText } = render(<Header />)

    expect(getAllByRole('button', { name: 'open header menu' })).toHaveLength(2)

    fireEvent.click(getAllByRole('button', { name: 'open header menu' })[1])
    fireEvent.click(getByText('About'))
    await waitFor(() => expect(queryByText('About')).not.toBeInTheDocument())
  })

  it('should hide absolute app bar', () => {
    const { queryByRole } = render(<Header hideAbsoluteAppBar />)

    expect(
      queryByRole('button', { name: 'open header menu' })
    ).not.toBeInTheDocument()
  })
})
