import useScrollTrigger from '@mui/material/useScrollTrigger'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ContentHeader } from './ContentHeader'

// Mock the useScrollTrigger hook
jest.mock('@mui/material/useScrollTrigger')

describe('ContentHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header with a logo', () => {
    ;(useScrollTrigger as jest.Mock).mockReturnValue(false)

    render(<ContentHeader />)

    const header = screen.getByRole('img', { name: 'JesusFilm Project' })
    expect(header).toBeInTheDocument()

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://www.jesusfilm.org/watch')
  })
})
