import { NetworkStatus, useSuspenseQuery } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { VideoTabView } from './VideoTabView'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

// Mock getVideoChildrenLabel
jest.mock('../../../../../libs/getVideoChildrenLabel', () => ({
  getVideoChildrenLabel: (label: string) => {
    if (label === 'collection') return 'Items'
    if (label === 'featureFilm') return 'Clips'
    if (label === 'series') return 'Episodes'
    return undefined
  }
}))

// Mock useSuspenseQuery hook
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useSuspenseQuery: jest.fn()
  }
})

const mockFeatureFilmData = {
  adminVideo: {
    label: 'featureFilm',
    variantLanguagesCount: 3,
    videoEditions: [{ id: 'edition-1' }, { id: 'edition-2' }],
    childrenCount: 5
  }
}

const mockCollectionData = {
  adminVideo: {
    label: 'collection',
    variantLanguagesCount: 2,
    videoEditions: [{ id: 'edition-1' }],
    childrenCount: 10
  }
}

const mockOtherTypeData = {
  adminVideo: {
    label: 'other',
    variantLanguagesCount: 1,
    videoEditions: [],
    childrenCount: 0
  }
}

// Helper to setup mocked data
const setupMock = (data: any) => {
  const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
    typeof useSuspenseQuery
  >
  mockedUseSuspenseQuery.mockReturnValue({
    data,
    fetchMore: jest.fn(),
    subscribeToMore: jest.fn(),
    client: {} as any,
    error: undefined,
    networkStatus: NetworkStatus.ready,
    refetch: jest.fn()
  })
}

describe('VideoTabView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    expect(screen.getByText('3')).toBeInTheDocument() // Audio Languages count
    expect(screen.getByText('2')).toBeInTheDocument() // Editions count
    expect(screen.getByText('5')).toBeInTheDocument() // Children count
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

    // Verify tabs order by checking the DOM order
    const tabsContent = document.body.textContent
    expect(tabsContent?.indexOf('Metadata')).toBeLessThan(
      tabsContent?.indexOf('Children') as number
    )
    expect(tabsContent?.indexOf('Children')).toBeLessThan(
      tabsContent?.indexOf('Audio Languages') as number
    )
    expect(tabsContent?.indexOf('Audio Languages')).toBeLessThan(
      tabsContent?.indexOf('Editions') as number
    )

    // Verify counts
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

    // Verify Children tab is not rendered
    expect(screen.queryByText('Children')).not.toBeInTheDocument()

    // Verify other tabs are rendered
    expect(screen.getByText('Metadata')).toBeInTheDocument()
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

    // Check hrefs on links
    expect(screen.getAllByRole('link')[0]).toHaveAttribute(
      'href',
      '/videos/video-123'
    )
    expect(screen.getAllByRole('link')[1]).toHaveAttribute(
      'href',
      '/videos/video-123/children'
    )
    expect(screen.getAllByRole('link')[2]).toHaveAttribute(
      'href',
      '/videos/video-123/audio'
    )
    expect(screen.getAllByRole('link')[3]).toHaveAttribute(
      'href',
      '/videos/video-123/editions'
    )
  })
})
