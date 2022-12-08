import { fireEvent, render } from '@testing-library/react'
import { videos } from '../testData'
import { VideosGrid } from './VideosGrid'

describe('VideosGrid', () => {
  const videoList = videos
  const onLoadMore = jest.fn()

  it('should display loading placeholders', async () => {
    const { getByText, getAllByTestId } = render(
      <VideosGrid videos={[]} loading onLoadMore={onLoadMore} />
    )
    expect(getAllByTestId('videos-grid-placeholder')).toHaveLength(8)
    expect(getByText('Loading...')).toBeInTheDocument()
  })
  it('should request more videos', async () => {
    const { getByText } = render(
      <VideosGrid videos={videos} loading={false} onLoadMore={onLoadMore} />
    )
    fireEvent.click(getByText('Load More'))
    expect(onLoadMore).toHaveBeenCalled()
  })

  it('should render correct number of videos', () => {
    const { getAllByLabelText } = render(<VideosGrid videos={videoList} />)
    const outputVideos = getAllByLabelText(/collection-page-video-card/i)
    expect(outputVideos.length).toBe(videoList.length)
  })
})
