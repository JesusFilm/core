import { render, screen } from '@testing-library/react'

import { videos } from '../../Videos/__generated__/testData'

import { VideoCarousel } from './VideoCarousel'

// Mock Swiper modules
jest.mock('swiper/modules', () => ({
  A11y: jest.fn(),
  FreeMode: jest.fn(),
  Mousewheel: jest.fn()
}))

describe('VideoCarousel', () => {
  it('renders the carousel container', () => {
    render(<VideoCarousel videos={videos} />)
    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })

  it('renders ChapterCards for each video', () => {
    render(<VideoCarousel videos={videos} />)
    videos.forEach((video) => {
      expect(screen.getByText(video.title[0].value)).toBeInTheDocument()
    })
  })

  it('handles empty videos array', () => {
    render(<VideoCarousel videos={[]} />)
    expect(screen.getByTestId('VideoCarouselSwiper')).toBeInTheDocument()
    expect(screen.queryByTestId(/^CarouselSlide-/)).not.toBeInTheDocument()
  })
})
