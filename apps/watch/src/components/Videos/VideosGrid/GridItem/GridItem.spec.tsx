import { secondsToTimeFormatTrimmed } from '@core/shared/ui/timeFormat'
import { render, screen } from '@testing-library/react'
import { videos } from '../../testData'
import { GridItem } from './GridItem'

describe('GridItem', () => {
  const inputVideo = videos[0]

  it('should render title correctly', () => {
    render(<GridItem video={inputVideo} />)
    const outputText = screen.getByText(inputVideo.title[0].value)
    expect(outputText).toBeInTheDocument()
  })

  it('should render video duration correctly', () => {
    render(<GridItem video={inputVideo} />)
    const outputText = screen.getByText(
      secondsToTimeFormatTrimmed(inputVideo.variant?.duration ?? 0)
    )
    expect(outputText).toBeInTheDocument()
  })

  it('should have correct video link', () => {
    render(<GridItem video={inputVideo} />)
    const card = screen.getByLabelText(/collection page video card/i)
    expect(card.getAttribute('href')).toBe('/' + inputVideo.slug)
  })
})
