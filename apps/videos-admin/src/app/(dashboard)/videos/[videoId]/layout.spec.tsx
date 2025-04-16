// Mock the Apollo Client hooks before imports
import { gql, useSuspenseQuery } from '@apollo/client'
import { render, screen } from '@testing-library/react'
import { useSelectedLayoutSegment } from 'next/navigation'
import React from 'react'

import VideoViewLayout from './layout'

jest.mock('@apollo/client', () => {
  const originalModule = jest.requireActual('@apollo/client')
  return {
    ...originalModule,
    useSuspenseQuery: jest.fn()
  }
})

const mockUseSuspenseQuery = useSuspenseQuery as jest.Mock

// Create the query directly here instead of importing from layout
// to avoid dual imports and type errors
const GET_TAB_DATA = gql`
  query GetTabData($id: ID!, $languageId: ID!) {
    adminVideo(id: $id) {
      id
      locked
      published
      title(languageId: $languageId) {
        id
        value
      }
    }
  }
`

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useSelectedLayoutSegment: jest.fn()
}))

const mockUseSelectedLayoutSegment = useSelectedLayoutSegment as jest.Mock

// Mock the components
jest.mock('./_VideoTabs', () => ({
  VideoTabView: ({
    currentTab,
    videoId
  }: {
    currentTab: string
    videoId: string
  }) => (
    <div data-testid="mock-video-tabs">
      Current Tab: {currentTab}, Video ID: {videoId}
    </div>
  )
}))

jest.mock('./_VideoInformation', () => ({
  VideoInformation: ({ videoId }: { videoId: string }) => (
    <div data-testid="mock-video-information">Video ID: {videoId}</div>
  )
}))

jest.mock('./_VideoSnippet', () => ({
  VideoSnippet: ({ videoId }: { videoId: string }) => (
    <div data-testid="mock-video-snippet">Video ID: {videoId}</div>
  )
}))

jest.mock('./_VideoDescription', () => ({
  VideoDescription: ({ videoId }: { videoId: string }) => (
    <div data-testid="mock-video-description">Video ID: {videoId}</div>
  )
}))

jest.mock('./_VideoImageAlt', () => ({
  VideoImageAlt: ({ videoId }: { videoId: string }) => (
    <div data-testid="mock-video-image-alt">Video ID: {videoId}</div>
  )
}))

jest.mock('./_VideoFallback', () => ({
  VideoViewFallback: () => (
    <div data-testid="mock-video-fallback">Video not found</div>
  )
}))

jest.mock('./_LockedVideo', () => ({
  LockedVideoView: () => (
    <div data-testid="mock-locked-video">Video is locked</div>
  )
}))

jest.mock('../../../../components/PublishedChip', () => ({
  PublishedChip: ({ published }: { published: boolean }) => (
    <div data-testid="mock-published-chip">
      Published: {published ? 'Yes' : 'No'}
    </div>
  )
}))

jest.mock('../../../../components/Section', () => ({
  Section: ({
    title,
    children,
    variant
  }: {
    title: string
    children: React.ReactNode
    variant?: string
  }) => (
    <div
      data-testid={`mock-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div>Section Title: {title}</div>
      <div>Variant: {variant}</div>
      {children}
    </div>
  )
}))

const videoId = 'test-video-id'

describe('VideoViewLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSelectedLayoutSegment.mockReturnValue('metadata')
  })

  it('should render the video fallback when video is not found', async () => {
    mockUseSuspenseQuery.mockReturnValue({
      data: { adminVideo: null }
    })

    render(
      <VideoViewLayout
        params={{ videoId }}
        images={<div data-testid="mock-images">Mock Images</div>}
        studyQuestions={
          <div data-testid="mock-study-questions">Mock Study Questions</div>
        }
      >
        <div data-testid="mock-children">Mock Children</div>
      </VideoViewLayout>
    )

    expect(mockUseSuspenseQuery).toHaveBeenCalledWith(expect.anything(), {
      variables: {
        id: videoId,
        languageId: '529'
      }
    })

    expect(screen.getByTestId('mock-video-fallback')).toBeInTheDocument()
  })

  it('should render the locked view when video is locked', async () => {
    mockUseSuspenseQuery.mockReturnValue({
      data: {
        adminVideo: {
          id: videoId,
          locked: true,
          published: false,
          title: [
            {
              id: 'title-1',
              value: 'Test Video'
            }
          ]
        }
      }
    })

    render(
      <VideoViewLayout
        params={{ videoId }}
        images={<div data-testid="mock-images">Mock Images</div>}
        studyQuestions={
          <div data-testid="mock-study-questions">Mock Study Questions</div>
        }
      >
        <div data-testid="mock-children">Mock Children</div>
      </VideoViewLayout>
    )

    expect(mockUseSuspenseQuery).toHaveBeenCalledWith(expect.anything(), {
      variables: {
        id: videoId,
        languageId: '529'
      }
    })

    expect(screen.getByTestId('mock-locked-video')).toBeInTheDocument()
  })

  it('should render metadata tab with all sections', async () => {
    mockUseSuspenseQuery.mockReturnValue({
      data: {
        adminVideo: {
          id: videoId,
          locked: false,
          published: true,
          title: [
            {
              id: 'title-1',
              value: 'Test Video'
            }
          ]
        }
      }
    })

    render(
      <VideoViewLayout
        params={{ videoId }}
        images={<div data-testid="mock-images">Mock Images</div>}
        studyQuestions={
          <div data-testid="mock-study-questions">Mock Study Questions</div>
        }
      >
        <div data-testid="mock-children">Mock Children</div>
      </VideoViewLayout>
    )

    expect(mockUseSuspenseQuery).toHaveBeenCalledWith(expect.anything(), {
      variables: {
        id: videoId,
        languageId: '529'
      }
    })

    // Check main structure
    expect(screen.getByText('Test Video')).toBeInTheDocument()
    expect(screen.getByTestId('mock-published-chip')).toBeInTheDocument()
    expect(screen.getByTestId('mock-video-tabs')).toBeInTheDocument()

    // Check all sections are present in metadata tab
    expect(screen.getByTestId('mock-section-information')).toBeInTheDocument()
    expect(screen.getByTestId('mock-section-images')).toBeInTheDocument()
    expect(
      screen.getByTestId('mock-section-short-description')
    ).toBeInTheDocument()
    expect(screen.getByTestId('mock-section-description')).toBeInTheDocument()

    // Check custom components are present
    expect(screen.getByTestId('mock-video-information')).toBeInTheDocument()
    expect(screen.getByTestId('mock-images')).toBeInTheDocument()
    expect(screen.getByTestId('mock-video-image-alt')).toBeInTheDocument()
    expect(screen.getByTestId('mock-video-snippet')).toBeInTheDocument()
    expect(screen.getByTestId('mock-video-description')).toBeInTheDocument()
    expect(screen.getByTestId('mock-study-questions')).toBeInTheDocument()

    // Check container styles
    expect(screen.getByTestId('VideoView')).toBeInTheDocument()
  })

  it('should render children for non-metadata tabs', async () => {
    mockUseSelectedLayoutSegment.mockReturnValue('audio')

    mockUseSuspenseQuery.mockReturnValue({
      data: {
        adminVideo: {
          id: videoId,
          locked: false,
          published: true,
          title: [
            {
              id: 'title-1',
              value: 'Test Video'
            }
          ]
        }
      }
    })

    render(
      <VideoViewLayout
        params={{ videoId }}
        images={<div data-testid="mock-images">Mock Images</div>}
        studyQuestions={
          <div data-testid="mock-study-questions">Mock Study Questions</div>
        }
      >
        <div data-testid="mock-children">Audio Tab Content</div>
      </VideoViewLayout>
    )

    expect(mockUseSuspenseQuery).toHaveBeenCalledWith(expect.anything(), {
      variables: {
        id: videoId,
        languageId: '529'
      }
    })

    // Check main structure is present
    expect(screen.getByText('Test Video')).toBeInTheDocument()
    expect(screen.getByTestId('mock-published-chip')).toBeInTheDocument()
    expect(screen.getByTestId('mock-video-tabs')).toBeInTheDocument()

    // Children content should be shown for non-metadata tabs
    expect(screen.getByTestId('mock-children')).toBeInTheDocument()

    // Metadata sections should not be present
    expect(
      screen.queryByTestId('mock-section-information')
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-section-images')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('mock-section-short-description')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('mock-section-description')
    ).not.toBeInTheDocument()
  })
})
