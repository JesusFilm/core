import useScrollTrigger from '@mui/material/useScrollTrigger'
import { render, screen } from '@testing-library/react'

import { CollectionsHeader } from './CollectionsHeader'

// Mock the useScrollTrigger hook
jest.mock('@mui/material/useScrollTrigger')

describe('CollectionsHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header with a logo', () => {
    ;(useScrollTrigger as jest.Mock).mockReturnValue(false)

    render(<CollectionsHeader />)

    const header = screen.getByRole('img', { name: /Jesus Film Project Logo/i })
    expect(header).toBeInTheDocument()

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://www.jesusfilm.org/')
  })

  it('applies transparent background styling when not scrolled', () => {
    ;(useScrollTrigger as jest.Mock).mockReturnValue(false)

    render(<CollectionsHeader />)

    const headerContainer = screen.getByTestId('CollectionsHeader')

    expect(headerContainer).toHaveStyle({
      backgroundColor: 'transparent'
    })
  })

  it('applies blurred background styling when scrolled', () => {
    ;(useScrollTrigger as jest.Mock).mockReturnValue(true)

    render(<CollectionsHeader />)

    const headerContainer = screen.getByRole('link').parentElement

    expect(headerContainer).toHaveStyle('background-color: rgba(0, 0, 0, 0.7)')
  })
})
