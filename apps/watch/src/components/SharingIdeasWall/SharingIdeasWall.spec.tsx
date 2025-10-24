import { render, screen } from '@testing-library/react'

import { SharingIdeasWall } from './SharingIdeasWall'

describe('SharingIdeasWall', () => {
  it('renders idea cards', () => {
    const ideas = [
      'Host a watch party with neighbors.',
      'Share your favorite scene on social media.',
      'Discuss the key theme with your small group.'
    ]

    render(<SharingIdeasWall ideas={ideas} />)

    expect(screen.getByTestId('SharingIdeasWall')).toBeInTheDocument()
    expect(screen.getAllByTestId('SharingIdeasWallCard')).toHaveLength(
      ideas.length
    )
    ideas.forEach((idea) => {
      expect(screen.getByText(idea)).toBeInTheDocument()
    })
  })

  it('does not render when there are no ideas', () => {
    const { container } = render(<SharingIdeasWall ideas={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})
