import { render } from '@testing-library/react'
import { videos } from '../testData'
import { VideosGrid } from './VideosGrid'

describe('VideosGrid', () => {
  const videoList = videos

  it('should render correct number of videos', () => {
    const { getAllByLabelText } = render(<VideosGrid videos={videoList} />)
    const outputVideos = getAllByLabelText(/collection-page-video-card/i)
    expect(outputVideos.length).toBe(videoList.length)
  })
})
