import { render, screen } from '@testing-library/react'
import { videos } from '../../testData'
import { GridItem } from './GridItem'

describe('GridItem', () => {
  const inputVideo = videos[0]

  it('should render title correctly', () => {
    render(<GridItem video={inputVideo} />)
    const outputText = screen.getByText('The Story of Jesus for Children')
    expect(outputText).toBeInTheDocument()
  })

  it('should render video duration correctly', () => {
    render(<GridItem video={inputVideo} />)
    const outputText = screen.getByText('01:01:20')
    expect(outputText).toBeInTheDocument()
  })

  it('should have correct video link', () => {
    render(<GridItem video={inputVideo} />)
    const card = screen.getByLabelText(/collection page video card/i)
    expect(card.getAttribute('href')).toBe('/the-story-of-jesus-for-children')
  })
})
