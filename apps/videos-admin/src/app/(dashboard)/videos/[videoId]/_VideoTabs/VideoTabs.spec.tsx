import {
  NetworkStatus,
  OperationVariables,
  QueryResult,
  useQuery
} from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { type MockedFunction } from 'vitest'

import { VideoTabView } from './VideoTabs'

// Mock Next.js Link component
vi.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink(props: any) {
    return <a {...props}>{props.children}</a>
  }
}))

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn()
  }),
  usePathname: () => '/videos/video-123'
}))

// Mock getVideoChildrenLabel
vi.mock('../../../../../libs/getVideoChildrenLabel', () => ({
  getVideoChildrenLabel: (label: string) => {
    if (label === 'collection') return 'Items'
    if (label === 'featureFilm') return 'Clips'
    if (label === 'series') return 'Episodes'
    return undefined
  }
}))

// Mock useQuery hook
vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useQuery: vi.fn(),
    useSuspenseQuery: vi.fn()
  }
})

const mockFeatureFilmData = {
  adminVideo: {
    id: 'video-123',
    label: 'featureFilm',
    variantLanguagesCount: 3,
    videoEditions: [{ id: 'edition-1' }, { id: 'edition-2' }],
    children: [
      { id: 'child-1' },
      { id: 'child-2' },
      { id: 'child-3' },
      { id: 'child-4' },
      { id: 'child-5' }
    ],
    childrenCount: 5
  }
}

const mockCollectionData = {
  adminVideo: {
    id: 'video-123',
    label: 'collection',
    variantLanguagesCount: 2,
    videoEditions: [{ id: 'edition-1' }],
    children: [
      { id: 'child-1' },
      { id: 'child-2' },
      { id: 'child-3' },
      { id: 'child-4' },
      { id: 'child-5' },
      { id: 'child-6' },
      { id: 'child-7' },
      { id: 'child-8' },
      { id: 'child-9' },
      { id: 'child-10' }
    ],
    childrenCount: 10
  }
}

const mockOtherTypeData = {
  adminVideo: {
    id: 'video-123',
    label: 'other',
    variantLanguagesCount: 1,
    videoEditions: [],
    children: [],
    childrenCount: 0
  }
}

// Helper to setup mocked data
const setupMock = (data: any) => {
  const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
  mockedUseQuery.mockReturnValue({
    data,
    loading: false,
    error: undefined,
    refetch: vi.fn(),
    fetchMore: vi.fn(),
    networkStatus: NetworkStatus.ready,
    client: {} as any,
    previousData: null,
    called: true,
    startPolling: vi.fn(),
    stopPolling: vi.fn(),
    subscribeToMore: vi.fn(),
    updateQuery: vi.fn(),
    observable: {} as any,
    reobserve: vi.fn(),
    variables: {}
  } as QueryResult<any, OperationVariables>)
}

describe('VideoTabView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display all tabs for feature film', () => {
    setupMock(mockFeatureFilmData)

    render(
      <MockedProvider>
        <VideoTabView currentTab="metadata" videoId="video-123" />
      </MockedProvider>
    )

    // Verify all tabs are rendered
    expect(screen.getByText('Metadata')).toBeInTheDocument()
    expect(screen.getByText('Children')).toBeInTheDocument()
    expect(screen.getByText('Audio Languages')).toBeInTheDocument()
    expect(screen.getByText('Editions')).toBeInTheDocument()

    // Verify counts are displayed
    expect(screen.getByText('5')).toBeInTheDocument() // Children count
    expect(screen.getByText('3')).toBeInTheDocument() // Audio Languages count
    expect(screen.getByText('2')).toBeInTheDocument() // Editions count
  })

  it('should display children tab for collection', () => {
    setupMock(mockCollectionData)

    render(
      <MockedProvider>
        <VideoTabView currentTab="metadata" videoId="video-123" />
      </MockedProvider>
    )

    // Verify all tabs are rendered and in correct order
    expect(screen.getByText('Metadata')).toBeInTheDocument()
    expect(screen.getByText('Children')).toBeInTheDocument()
    expect(screen.getByText('Audio Languages')).toBeInTheDocument()
    expect(screen.getByText('Editions')).toBeInTheDocument()

    // Verify counts are displayed
    expect(screen.getByText('10')).toBeInTheDocument() // Children count
    expect(screen.getByText('2')).toBeInTheDocument() // Audio Languages count
    expect(screen.getByText('1')).toBeInTheDocument() // Editions count
  })

  it('should not display children tab for other types', () => {
    setupMock(mockOtherTypeData)

    render(
      <MockedProvider>
        <VideoTabView currentTab="metadata" videoId="video-123" />
      </MockedProvider>
    )

    // Verify other tabs are rendered
    expect(screen.getByText('Metadata')).toBeInTheDocument()
    expect(screen.queryByText('Children')).not.toBeInTheDocument() // Verify Children tab is not present
    expect(screen.getByText('Audio Languages')).toBeInTheDocument()
    expect(screen.getByText('Editions')).toBeInTheDocument()
  })

  it('should have correct hrefs', () => {
    setupMock(mockFeatureFilmData)

    render(
      <MockedProvider>
        <VideoTabView currentTab="metadata" videoId="video-123" />
      </MockedProvider>
    )

    const tabs = screen.getAllByRole('tab')

    // Check hrefs on tabs in their actual order
    expect(tabs[0]).toHaveAttribute('href', '/videos/video-123')
    expect(tabs[1]).toHaveAttribute('href', '/videos/video-123/children')
    expect(tabs[2]).toHaveAttribute('href', '/videos/video-123/audio')
    expect(tabs[3]).toHaveAttribute('href', '/videos/video-123/editions')
  })
})
