import { render, screen } from '@testing-library/react'
import { InteractionText } from './InteractionText'

describe('InteractionText', () => {
  it('should apply gradient styles to interaction text', () => {
    render(<InteractionText startingText="Resources" />)

    const Interaction = screen.getByText('interaction')

    expect(Interaction).toHaveStyle({
      background: 'linear-gradient(90deg, #0D7DE5 0%, #E02BAD 100%)'
    })
  })

  it('should apply correct starting text', () => {
    render(<InteractionText startingText="Next Step" />)

    expect(screen.getByText('Next Step for every')).toBeInTheDocument()
  })
})
