import { render, screen } from '@testing-library/react'

import { VideoLabel } from '../../../__generated__/globalTypes'
import type { GetVideoChildren_video_children } from '../../../__generated__/GetVideoChildren'

import { SectionFeaturedVideo } from './SectionFeaturedVideo'
import { useFeaturedVideos } from '../VideoHero/libs/useFeaturedVideos'

jest.mock('video.js', () => {
  const mockPlayer = {
    src: jest.fn(),
    poster: jest.fn(),
    dispose: jest.fn()
  }

  const mockVideoJs = jest.fn(() => mockPlayer)

  return {
    __esModule: true,
    default: mockVideoJs
  }
})

jest.mock('../VideoHero/libs/useFeaturedVideos')

const mockUseFeaturedVideos = useFeaturedVideos as jest.MockedFunction<
  typeof useFeaturedVideos
>

describe('SectionFeaturedVideo', () => {
  const featuredVideo: GetVideoChildren_video_children = {
    __typename: 'Video',
    id: 'emmaus-story',
    label: VideoLabel.shortFilm,
    title: [{ __typename: 'VideoTitle', value: 'The Road to Emmaus' }],
    images: [
      { __typename: 'CloudflareImage', mobileCinematicHigh: 'https://example.com/poster.jpg' }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt', value: 'The Road to Emmaus poster' }],
    snippet: [
      {
        __typename: 'VideoSnippet',
        value: 'Two friends encounter hope on the road.'
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: 'variant-id',
      duration: 150,
      hls: 'https://example.com/video.m3u8',
      slug: 'emmaus-story/en'
    },
    childrenCount: 0
  }

  beforeEach(() => {
    mockUseFeaturedVideos.mockReturnValue({
      loading: false,
      videos: [featuredVideo]
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the featured video details and share guidance', () => {
    render(<SectionFeaturedVideo />)

    expect(
      screen.getByText("Today's Featured Video", { selector: 'p' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'The Road to Emmaus' })
    ).toBeInTheDocument()
    expect(screen.getByText('2:30')).toBeInTheDocument()
    expect(screen.getByText('Short Film')).toBeInTheDocument()
    expect(screen.getByText('Share with a friend')).toBeInTheDocument()
    expect(screen.getByText(/Share this story/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Open video page' })
    ).toHaveAttribute('href', '/watch/emmaus-story.html/en.html')
  })
})
