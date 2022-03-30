import { fireEvent, render } from '@testing-library/react'

import { videos } from '../testData'
import { VideoListList } from './VideoListList'

describe('VideoListList', () => {
  const onLoadMore = jest.fn()
  it('should display loading placeholders', async () => {
    const { getByText, getAllByTestId } = render(
      <VideoListList
        videos={[]}
        loading={true}
        onLoadMore={onLoadMore}
        isEnd={false}
      />
    )
    expect(getAllByTestId('video-list-list-placeholder')).toHaveLength(8)
    expect(getByText('Loading...')).toBeInTheDocument()
  })
  it('should request more videos', async () => {
    const { getByText } = render(
      <VideoListList
        videos={videos}
        loading={false}
        onLoadMore={onLoadMore}
        isEnd={false}
      />
    )
    fireEvent.click(getByText('Load More'))
    expect(onLoadMore).toHaveBeenCalled()
  })
  it('should render small variant', () => {
    const { getAllByTestId } = render(
      <VideoListList
        videos={videos}
        loading={false}
        onLoadMore={onLoadMore}
        variant="small"
        isEnd={false}
      />
    )
    expect(getAllByTestId('video-list-list-image-small')[0]).toBeInTheDocument()
  })
  it('should render large variant', () => {
    const { getAllByTestId } = render(
      <VideoListList
        videos={videos}
        loading={false}
        onLoadMore={onLoadMore}
        variant="large"
        isEnd={false}
      />
    )
    expect(getAllByTestId('video-list-list-image-large')[0]).toBeInTheDocument()
  })
})
