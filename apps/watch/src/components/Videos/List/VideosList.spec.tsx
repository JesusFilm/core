import { fireEvent, render } from '@testing-library/react'

import { videos } from '../testData'
import { VideosList } from './VideosList'

describe('VideosList', () => {
  const onLoadMore = jest.fn()
  it('should display loading placeholders', async () => {
    const { getByText, getAllByTestId } = render(
      <VideosList videos={[]} loading onLoadMore={onLoadMore} isEnd={false} />
    )
    expect(getAllByTestId('videos-list-placeholder')).toHaveLength(8)
    expect(getByText('Loading...')).toBeInTheDocument()
  })
  it('should request more videos', async () => {
    const { getByText } = render(
      <VideosList
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
      <VideosList
        videos={videos}
        loading={false}
        onLoadMore={onLoadMore}
        variant="small"
        isEnd={false}
      />
    )
    expect(getAllByTestId('videos-list-image-small')[0]).toBeInTheDocument()
  })
  it('should render large variant', () => {
    const { getAllByTestId } = render(
      <VideosList
        videos={videos}
        loading={false}
        onLoadMore={onLoadMore}
        variant="large"
        isEnd={false}
      />
    )
    expect(getAllByTestId('videos-list-image-large')[0]).toBeInTheDocument()
  })
})
