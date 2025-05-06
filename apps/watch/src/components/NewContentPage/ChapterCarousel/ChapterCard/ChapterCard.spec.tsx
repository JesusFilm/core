import { render, screen, fireEvent } from '@testing-library/react'
import { ChapterCard } from './ChapterCard'
import { VideoLabel } from '../../../../../__generated__/globalTypes'
import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'

describe('ChapterCard', () => {
  const mockVideo: VideoChildFields = {
    __typename: 'Video',
    id: 'test-id',
    slug: 'test-video',
    label: VideoLabel.episode,
    title: [{ __typename: 'VideoTitle', value: 'Test Video Title' }],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'Test Image Alt' }],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh: 'https://example.com/test-image.jpg'
      }
    ],
    snippet: [{ __typename: 'VideoSnippet', value: 'Test Snippet' }],
    description: [
      { __typename: 'VideoDescription', value: 'Test Description' }
    ],
    variant: null,
    studyQuestions: [],
    childrenCount: 0
  }

  it('renders the component with video data correctly', () => {
    render(<ChapterCard video={mockVideo} />)

    expect(screen.getByText('Test Video Title')).toBeInTheDocument()
    expect(screen.getByText(VideoLabel.episode)).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test Image Alt')
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/test-image.jpg'
    )
  })

  it('has proper accessibility attributes', () => {
    render(<ChapterCard video={mockVideo} />)

    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('tabIndex', '0')
    expect(card).toHaveAttribute('aria-label', `Navigate to ${mockVideo.slug}`)
  })
})
