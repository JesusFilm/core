import { render, screen } from '@testing-library/react'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { VideoChildFields } from '../../../../__generated__/VideoChildFields'

import { VideoCarousel } from './VideoCarousel'

// Mock Swiper modules
jest.mock('swiper/modules', () => ({
  A11y: jest.fn(),
  FreeMode: jest.fn(),
  Mousewheel: jest.fn()
}))

describe('VideoCarousel', () => {
  const mockVideos: VideoChildFields[] = [
    {
      __typename: 'Video',
      id: 'video-1',
      slug: 'test-video-1',
      label: VideoLabel.episode,
      title: [{ __typename: 'VideoTitle', value: 'Test Video 1' }],
      imageAlt: [{ __typename: 'VideoImageAlt', value: 'Test Image Alt 1' }],
      images: [
        {
          __typename: 'CloudflareImage',
          mobileCinematicHigh: 'https://example.com/test-image-1.jpg'
        }
      ],
      snippet: [{ __typename: 'VideoSnippet', value: 'Test Snippet 1' }],
      description: [
        { __typename: 'VideoDescription', value: 'Test Description 1' }
      ],
      variant: null,
      studyQuestions: [],
      childrenCount: 0
    },
    {
      __typename: 'Video',
      id: 'video-2',
      slug: 'test-video-2',
      label: VideoLabel.episode,
      title: [{ __typename: 'VideoTitle', value: 'Test Video 2' }],
      imageAlt: [{ __typename: 'VideoImageAlt', value: 'Test Image Alt 2' }],
      images: [
        {
          __typename: 'CloudflareImage',
          mobileCinematicHigh: 'https://example.com/test-image-2.jpg'
        }
      ],
      snippet: [{ __typename: 'VideoSnippet', value: 'Test Snippet 2' }],
      description: [
        { __typename: 'VideoDescription', value: 'Test Description 2' }
      ],
      variant: null,
      studyQuestions: [],
      childrenCount: 0
    }
  ]

  it('renders the carousel container', () => {
    render(<VideoCarousel videos={mockVideos} />)
    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })

  it('renders ChapterCards for each video', () => {
    render(<VideoCarousel videos={mockVideos} />)
    mockVideos.forEach((video) => {
      expect(screen.getByText(video.title[0].value)).toBeInTheDocument()
    })
  })

  it('handles empty videos array', () => {
    render(<VideoCarousel videos={[]} />)
    expect(screen.getByTestId('VideoCarouselSwiper')).toBeInTheDocument()
    expect(screen.queryByTestId(/^CarouselSlide-/)).not.toBeInTheDocument()
  })
})
