import { useSuspenseQuery as apolloClient_useSuspenseQuery } from '@apollo/client'
import { render, screen } from '@testing-library/react'
import { type Mock } from 'vitest'

import VideoViewLayout from './layout'

const mockPush = vi.fn()
const mockSegment = vi.fn()
const mockVideoInformation = vi.fn(() => (
  <div data-testid="video-information" />
))

vi.mock('next/navigation', () => ({
  useParams: () => ({ videoId: 'video123' }),
  useRouter: () => ({ push: mockPush }),
  useSelectedLayoutSegment: () => mockSegment()
}))

vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useSuspenseQuery: vi.fn()
  }
})

vi.mock('./_VideoInformation', () => ({
  VideoInformation: () => mockVideoInformation()
}))

vi.mock('./_VideoImages', () => ({
  VideoImages: () => <div data-testid="video-images" />
}))

vi.mock('./_VideoImageAlt', () => ({
  VideoImageAlt: () => <div data-testid="video-image-alt" />
}))

vi.mock('./_VideoSnippet', () => ({
  VideoSnippet: () => <div data-testid="video-snippet" />
}))

vi.mock('./_VideoDescription', () => ({
  VideoDescription: () => <div data-testid="video-description" />
}))

vi.mock('./_VideoBibleCitation', () => ({
  VideoBibleCitation: () => <div data-testid="video-bible-citation" />
}))

vi.mock('./_VideoTabs', () => ({
  VideoTabView: ({ currentTab }: { currentTab: string }) => (
    <div data-testid="current-tab">{currentTab}</div>
  )
}))

describe('VideoViewLayout', () => {
  const useSuspenseQuery = vi.mocked(
    apolloClient_useSuspenseQuery as unknown as Mock
  )

  beforeEach(() => {
    vi.clearAllMocks()
    mockSegment.mockReturnValue('metadata')
    useSuspenseQuery.mockReturnValue({
      data: {
        adminVideo: {
          id: 'video123',
          locked: false,
          published: true,
          publishedAt: '2026-01-01T00:00:00.000Z',
          label: 'series',
          title: [{ id: 'title1', value: 'Series Title' }]
        }
      }
    })
  })

  it('uses the children tab behind the publish all dialog without rendering metadata queries', () => {
    mockSegment.mockReturnValue('publishAll')

    render(
      <VideoViewLayout studyQuestions={<div>Study questions</div>}>
        <div data-testid="publish-all-dialog">Publish all dialog</div>
      </VideoViewLayout>
    )

    expect(screen.getByTestId('current-tab')).toHaveTextContent('children')
    expect(screen.getByTestId('publish-all-dialog')).toBeInTheDocument()
    expect(mockVideoInformation).not.toHaveBeenCalled()
  })

  it('uses the restrictions tab for the restrictions route without rendering metadata queries', () => {
    mockSegment.mockReturnValue('restrictions')

    render(
      <VideoViewLayout studyQuestions={<div>Study questions</div>}>
        <div data-testid="restrictions-page">Restrictions page</div>
      </VideoViewLayout>
    )

    expect(screen.getByTestId('current-tab')).toHaveTextContent('restrictions')
    expect(screen.getByTestId('restrictions-page')).toBeInTheDocument()
    expect(mockVideoInformation).not.toHaveBeenCalled()
  })

  it('does not render restriction sections on the metadata tab', () => {
    render(
      <VideoViewLayout studyQuestions={<div>Study questions</div>}>
        <div />
      </VideoViewLayout>
    )

    expect(screen.getByTestId('VideoMetadata')).toBeInTheDocument()
    expect(screen.queryByText('Restricted Downloads')).not.toBeInTheDocument()
    expect(screen.queryByText('Restricted Views')).not.toBeInTheDocument()
  })
})
