import { fireEvent, render } from '@testing-library/react'
import { videos } from '../Videos/testData'
import { VideoGrid } from './VideoGrid'

describe('VideoGrid', () => {
  const onLoadMore = jest.fn()

  xit('should display loading placeholders', async () => {
    const { getByText, getAllByTestId } = render(
      <VideoGrid videos={[]} loading onLoadMore={onLoadMore} />
    )
    expect(getAllByTestId('videos-grid-placeholder')).toHaveLength(8)
    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('should request more videos', async () => {
    const { getByText } = render(
      <VideoGrid
        videos={videos}
        loading={false}
        hasNextPage
        onLoadMore={onLoadMore}
      />
    )
    fireEvent.click(getByText('Load More'))
    expect(onLoadMore).toHaveBeenCalled()
  })

  it('should render correct number of videos', () => {
    const { getAllByLabelText } = render(<VideoGrid videos={videos} />)
    expect(getAllByLabelText('collection-page-video-card').length).toBe(
      videos.length
    )
  })
})
