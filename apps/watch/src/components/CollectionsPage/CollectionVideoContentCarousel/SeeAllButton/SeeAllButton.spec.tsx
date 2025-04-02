import { fireEvent, render, screen } from '@testing-library/react'
import noop from 'lodash/noop'

import { SeeAllButton } from './SeeAllButton'

describe('SeeAllButton', () => {
  it('renders the button with provided text', () => {
    render(<SeeAllButton text="View All" onClick={noop} />)

    expect(screen.getByText('View All')).toBeInTheDocument()
  })

  it('calls the onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<SeeAllButton text="View All" onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
