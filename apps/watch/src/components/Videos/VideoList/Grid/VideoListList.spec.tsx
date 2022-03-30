import { fireEvent, render } from '@testing-library/react'

import { videos } from '../testData'
import { VideoListGrid } from './VideoListGrid'

describe('VideoListGrid', () => {
  const onLoadMore = jest.fn()
  it('should display loading placeholders', async () => {
    const { getByText, getAllByTestId } = render(
      <VideoListGrid videos={[]} loading={true} onLoadMore={onLoadMore} />
    )
    expect(getAllByTestId('video-list-grid-placeholder')).toHaveLength(8)
    expect(getByText('Loading...')).toBeInTheDocument()
  })
  it('should request more videos', async () => {
    const { getByText } = render(
      <VideoListGrid videos={videos} loading={false} onLoadMore={onLoadMore} />
    )
    fireEvent.click(getByText('Load More'))
    expect(onLoadMore).toHaveBeenCalled()
  })
})
