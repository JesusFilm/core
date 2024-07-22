import { render, screen } from '@testing-library/react'
import { ResourceHeading } from './ResourceHeading'

describe('ResourceHeading', () => {
  it('should apply gradient styles to interaction text', () => {
    render(<ResourceHeading heading="Resources" />)
    expect(screen.getByText('Resources for every')).toBeInTheDocument()
    const StyledSpan = screen.getByText('interaction')

    expect(StyledSpan).toHaveStyle({
      background: 'linear-gradient(90deg, #0D7DE5 0%, #E02BAD 100%)'
    })
  })
})
