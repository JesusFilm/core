import { render, screen } from '@testing-library/react'
import React from 'react'

import { ImageAspectRatio } from '../../../constants'

import { BannerImage } from './BannerImage'

// Mock Apollo Client
jest.mock('@apollo/client', () => {
  const originalModule = jest.requireActual('@apollo/client')
  return {
    ...originalModule,
    useSuspenseQuery: jest.fn()
  }
})

// Mock the ImageDisplay component
jest.mock('../_ImageDisplay/ImageDisplay', () => ({
  ImageDisplay: ({ src, alt, title, aspectRatio, videoId }) => (
    <div data-testid="image-display-mock">
      <div data-testid="src">{String(src || '')}</div>
      <div data-testid="alt">{alt}</div>
      <div data-testid="title">{title}</div>
      <div data-testid="aspect-ratio">{aspectRatio}</div>
      <div data-testid="video-id">{videoId}</div>
    </div>
  )
}))

describe('VideoBanner', () => {
  const mockVideoId = 'video-123'

  // Setup useSuspenseQuery mock for each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the ImageDisplay with the correct props when image URL is available', () => {
    const mockImageUrl = 'https://example.com/banner-image.jpg'

    // Setup mock data
    const mockData = {
      adminVideo: {
        id: mockVideoId,
        images: [
          {
            id: 'image-123',
            mobileCinematicHigh: mockImageUrl
          }
        ]
      }
    }

    // Mock the hook
    const { useSuspenseQuery } = require('@apollo/client')
    useSuspenseQuery.mockReturnValue({ data: mockData })

    render(<BannerImage videoId={mockVideoId} />)

    expect(screen.getByTestId('image-display-mock')).toBeInTheDocument()
    expect(screen.getByTestId('src')).toHaveTextContent(mockImageUrl)
    expect(screen.getByTestId('alt')).toHaveTextContent('banner image')
    expect(screen.getByTestId('title')).toHaveTextContent('banner image')
    expect(screen.getByTestId('aspect-ratio')).toHaveTextContent(
      ImageAspectRatio.banner
    )
    expect(screen.getByTestId('video-id')).toHaveTextContent(mockVideoId)
  })

  it('renders the ImageDisplay with undefined src when image URL is not available', () => {
    // Setup mock data with null image URL
    const mockData = {
      adminVideo: {
        id: mockVideoId,
        images: [
          {
            id: 'image-123',
            mobileCinematicHigh: null
          }
        ]
      }
    }

    // Mock the hook
    const { useSuspenseQuery } = require('@apollo/client')
    useSuspenseQuery.mockReturnValue({ data: mockData })

    render(<BannerImage videoId={mockVideoId} />)

    expect(screen.getByTestId('image-display-mock')).toBeInTheDocument()
    expect(screen.getByTestId('src')).toHaveTextContent('')
    expect(screen.getByTestId('alt')).toHaveTextContent('banner image')
    expect(screen.getByTestId('title')).toHaveTextContent('banner image')
    expect(screen.getByTestId('aspect-ratio')).toHaveTextContent(
      ImageAspectRatio.banner
    )
    expect(screen.getByTestId('video-id')).toHaveTextContent(mockVideoId)
  })

  it('handles the case when images array is empty', () => {
    // Setup mock data with empty images array
    const mockData = {
      adminVideo: {
        id: mockVideoId,
        images: []
      }
    }

    // Mock the hook
    const { useSuspenseQuery } = require('@apollo/client')
    useSuspenseQuery.mockReturnValue({ data: mockData })

    render(<BannerImage videoId={mockVideoId} />)

    expect(screen.getByTestId('image-display-mock')).toBeInTheDocument()
    expect(screen.getByTestId('src')).toHaveTextContent('')
    expect(screen.getByTestId('alt')).toHaveTextContent('banner image')
    expect(screen.getByTestId('title')).toHaveTextContent('banner image')
    expect(screen.getByTestId('aspect-ratio')).toHaveTextContent(
      ImageAspectRatio.banner
    )
    expect(screen.getByTestId('video-id')).toHaveTextContent(mockVideoId)
  })
})
