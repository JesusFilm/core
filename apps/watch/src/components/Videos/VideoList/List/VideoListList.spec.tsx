import { fireEvent, render } from '@testing-library/react'

import { videos } from '../testData'
import { VideoListList } from './VideoListList'

describe('VideoListList', () => {
  const onLoadMore = jest.fn()
  it('should display loading placeholders', async () => {
    const { getByText, getAllByTestId } = render(
      <VideoListList videos={[]} loading={true} onLoadMore={onLoadMore} />
    )
    expect(getAllByTestId('video-list-list-placeholder')).toHaveLength(8)
    expect(getByText('Loading...')).toBeInTheDocument()
  })
  it('should request more videos', async () => {
    const { getByText } = render(
      <VideoListList videos={videos} loading={false} onLoadMore={onLoadMore} />
    )
    fireEvent.click(getByText('Load More'))
    expect(onLoadMore).toHaveBeenCalled()
  })
})
