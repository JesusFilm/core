import { render, screen } from '@testing-library/react'

import { Suggestions } from './Suggestions'

describe('Suggestions', () => {
  it('should display suggestions header', () => {
    render(<Suggestions />)
    expect(screen.getByText('Suggestions')).toBeInTheDocument()
  })
})
