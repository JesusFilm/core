import { render, screen } from '@testing-library/react'

import { ResourceHeading } from './ResourceHeading'

describe('ResourceHeading', () => {
  it('should apply gradient styles to interaction text', () => {
    render(<ResourceHeading heading="Resource" />)
    expect(screen.getByText('Resource for every')).toBeInTheDocument()
    const StyledSpan = screen.getByText('interaction')

    expect(StyledSpan).toHaveStyle({
      background: 'linear-gradient(90deg, #0D7DE5 0%, #E02BAD 100%)'
    })
  })
})
