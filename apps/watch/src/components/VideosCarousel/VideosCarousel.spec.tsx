import { fireEvent, render, waitFor } from '@testing-library/react'

import { videos } from '../Videos/__generated__/testData'
import { VideosCarousel } from './VideosCarousel'

describe('VideosCarousel', () => {
  Object.assign(window, { innerWidth: 1600 })

  it('should display video items', async () => {
    const renderItem = jest.fn()

    render(
      <VideosCarousel
        activeVideo={videos[0].id}
        videos={videos}
        renderItem={renderItem}
      />
    )
    // Renders twice for some reason...
    expect(renderItem).toHaveBeenCalledTimes(videos.length * 2)
    expect(renderItem).toHaveBeenNthCalledWith(1, {
      video: videos[0],
      index: 0,
      active: true,
      imageSx: { height: { xs: 110, xl: 146 } }
    })
    expect(renderItem).toHaveBeenNthCalledWith(2, {
      video: videos[1],
      index: 1,
      active: false,
      imageSx: { height: { xs: 110, xl: 146 } }
    })
  })

  // Swiper doesn't properly initialise in jest. E2E test.
  xdescribe('swiper', () => {
    it('should hide nav buttons when items fit on page', async () => {
      const { getByRole } = render(
        <VideosCarousel
          videos={[videos[0]]}
          activeVideo={videos[0].id}
          renderItem={() => <div data-testid="video-carousel-item" />}
        />
      )
      const prevButton = getByRole('button', { name: 'Previous slide' })
      const nextButton = getByRole('button', { name: 'Next slide' })

      expect(prevButton).toBeDisabled()
      expect(nextButton).toBeDisabled()
    })

    it('should hide prev nav button at start', async () => {
      const { getByRole } = render(
        <VideosCarousel
          videos={videos}
          activeVideo={videos[0].id}
          renderItem={() => <div data-testid="video-carousel-item" />}
        />
      )
      const prevButton = getByRole('button', { name: 'Previous slide' })
      const nextButton = getByRole('button', { name: 'Next slide' })

      await waitFor(() => expect(prevButton).toBeDisabled())
      expect(nextButton).not.toBeDisabled()

      fireEvent.click(nextButton)

      expect(prevButton).not.toBeDisabled()
    })

    it('should hide next nav button at end', async () => {
      const { getByRole } = render(
        <VideosCarousel
          videos={videos}
          activeVideo={videos[0].id}
          renderItem={() => <div data-testid="video-carousel-item" />}
        />
      )
      const prevButton = getByRole('button', { name: 'Previous slide' })
      const nextButton = getByRole('button', { name: 'Next slide' })

      await waitFor(() => expect(prevButton).toBeDisabled())
      expect(nextButton).not.toBeDisabled()

      videos.forEach(() => {
        fireEvent.click(nextButton)
      })

      expect(nextButton).toBeDisabled()
    })
  })
})
