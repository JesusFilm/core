import { render, screen } from '@testing-library/react'

import { SeeAllButton } from './SeeAllButton'

describe('SeeAllButton', () => {
  it('renders the button with provided text', () => {
    render(<SeeAllButton text="View All" />)

    expect(screen.getByText('View All')).toBeInTheDocument()
  })

  it('contains a link to the watch page', () => {
    render(<SeeAllButton text="View All" />)

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/watch?utm_source=jesusfilm-watch'
    )
  })
})
