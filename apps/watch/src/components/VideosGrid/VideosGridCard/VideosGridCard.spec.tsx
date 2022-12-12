import { render } from '@testing-library/react'
import { videos } from '../../Videos/testData'
import { VideosGridCard } from './VideosGridCard'

describe('VideosGridCard', () => {
  const inputVideo = videos[0]

  it('should render title correctly', () => {
    const { getByText } = render(<VideosGridCard video={inputVideo} />)
    const outputText = getByText(inputVideo.title[0].value)
    expect(outputText).toBeInTheDocument()
  })

  it('should render episode count correctly', () => {
    const { getByText } = render(<VideosGridCard video={inputVideo} />)
    const outputText = getByText(`${inputVideo.children.length} episodes`)
    expect(outputText).toBeInTheDocument()
  })

  it('should have correct video link', () => {
    const { getByLabelText } = render(<VideosGridCard video={inputVideo} />)
    const card = getByLabelText(/collection-page-video-card/i)
    expect(card.getAttribute('href')).toBe(
      `/${inputVideo.variant?.slug as string}`
    )
  })
})
