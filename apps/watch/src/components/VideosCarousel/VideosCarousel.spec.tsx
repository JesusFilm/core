import { fireEvent, render, waitFor } from '@testing-library/react'

import { videos } from '../Videos/testData'
import { VideosCarousel } from './VideosCarousel'

describe('VideosCarousel', () => {
  Object.assign(window, { innerWidth: 1600 })

  it('should display video items', async () => {
    const renderItem = jest.fn()

    render(<VideosCarousel videos={videos} renderItem={renderItem} />)
    // Renders twice for some reason...
    expect(renderItem).toHaveBeenCalledTimes(videos.length * 2)
    expect(renderItem).toHaveBeenNthCalledWith(1, videos[0])
  })

  // Swiper doesn't properly initialise in jest. E2E test.
  xdescribe('swiper', () => {
    it('should hide nav buttons when items fit on page', async () => {
      const { getByRole } = render(
        <VideosCarousel
          videos={[videos[0]]}
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
