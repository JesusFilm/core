import { fireEvent, render, screen } from '@testing-library/react'

import {
  VideoLabel,
  VideoVariantDownloadQuality
} from '../../../../__generated__/globalTypes'
import type { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../../libs/videoContext'

import { ContentHero } from './ContentHero'

// Mock the video context
const mockVideoContent: VideoContentFields = {
  __typename: 'Video',
  id: 'test-id',
  label: VideoLabel.episode,
  images: [
    {
      __typename: 'CloudflareImage',
      mobileCinematicHigh: 'test-image.jpg'
    }
  ],
  imageAlt: [
    {
      __typename: 'VideoImageAlt',
      value: 'Test Image Alt'
    }
  ],
  snippet: [
    {
      __typename: 'VideoSnippet',
      value: 'Test Snippet'
    }
  ],
  description: [
    {
      __typename: 'VideoDescription',
      value: 'Test Description'
    }
  ],
  studyQuestions: [
    {
      __typename: 'VideoStudyQuestion',
      value: 'Test Question'
    }
  ],
  title: [
    {
      __typename: 'VideoTitle',
      value: 'Test Title'
    }
  ],
  variant: {
    __typename: 'VideoVariant',
    id: 'variant-id',
    duration: 120,
    hls: 'test-hls.m3u8',
    downloadable: true,
    downloads: [
      {
        __typename: 'VideoVariantDownload',
        quality: VideoVariantDownloadQuality.high,
        size: 1000,
        url: 'test-download.mp4'
      }
    ],
    language: {
      __typename: 'Language',
      id: 'lang-id',
      name: [
        {
          __typename: 'LanguageName',
          value: 'English',
          primary: true
        }
      ],
      bcp47: 'en'
    },
    slug: 'test-variant-slug',
    subtitleCount: 1
  },
  variantLanguagesCount: 1,
  slug: 'test-slug',
  childrenCount: 0
}

const mockVideo = {
  content: mockVideoContent
}

describe('ContentHero', () => {
  const renderComponent = () => {
    return render(
      <VideoProvider value={mockVideo}>
        <ContentHero />
      </VideoProvider>
    )
  }

  it('displays the correct title and snippet from video context', () => {
    renderComponent()

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Snippet')).toBeInTheDocument()
  })

  it('renders the mute button in initial muted state', () => {
    renderComponent()

    const muteButton = screen.getByRole('button', { name: 'muted' })
    expect(muteButton).toBeInTheDocument()
  })

  it('toggles mute state when mute button is clicked', () => {
    renderComponent()

    const muteButton = screen.getByRole('button', { name: 'muted' })
    fireEvent.click(muteButton)

    expect(screen.getByRole('button', { name: 'unmuted' })).toBeInTheDocument()
  })
})
