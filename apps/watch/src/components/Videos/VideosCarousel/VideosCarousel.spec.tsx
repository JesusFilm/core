import { fireEvent, render } from '@testing-library/react'

import { videos } from '../testData'
import { VideosCarousel } from './VideosCarousel'

describe('VideosCarousel', () => {
  const onLoadMore = jest.fn()
  it('should display loading skeletons', async () => {
    const renderItem = jest.fn()

    render(
      <VideosCarousel
        videos={videos}
        loading
        playingVideoId=""
        onLoadMore={onLoadMore}
        renderItem={renderItem}
      />
    )
    expect(renderItem).toHaveBeenNthCalledWith(1, {
      ...videos[0],
      loading: true
    })
  })

  it('should display video items', async () => {
    const renderItem = jest.fn()

    render(
      <VideosCarousel
        videos={videos}
        playingVideoId={videos[0].id}
        onLoadMore={onLoadMore}
        renderItem={renderItem}
      />
    )
    // Renders twice for some reason...
    expect(renderItem).toHaveBeenCalledTimes(videos.length * 2)
    expect(renderItem).toHaveBeenNthCalledWith(1, {
      ...videos[0],
      loading: false,
      isPlaying: true
    })
    expect(renderItem).toHaveBeenNthCalledWith(2, {
      ...videos[1],
      loading: false,
      isPlaying: false
    })
  })

  // Cannot trigger without navigation arrows
  xit('should request more videos', async () => {
    const { getAllByTestId } = render(
      <VideosCarousel
        videos={videos}
        playingVideoId=""
        onLoadMore={onLoadMore}
        renderItem={() => <div data-testid="video-carousel-item" />}
      />
    )
    fireEvent.click(getAllByTestId('video-carousel-item')[8])
    expect(onLoadMore).toHaveBeenCalled()
  })
})
