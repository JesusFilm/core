import { render, screen } from '@testing-library/react'
import { InteractionText } from './InteractionText'

describe('InteractionText', () => {
  it('should apply gradient styles to interaction text', () => {
    render(<InteractionText heading="Resources" />)
    expect(screen.getByText('Resources for every')).toBeInTheDocument()
    const StyledSpan = screen.getByText('interaction')

    expect(StyledSpan).toHaveStyle({
      background: 'linear-gradient(90deg, #0D7DE5 0%, #E02BAD 100%)'
    })
  })
})
