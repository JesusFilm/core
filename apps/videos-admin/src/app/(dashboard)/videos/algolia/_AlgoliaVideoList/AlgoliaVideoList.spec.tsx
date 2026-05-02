import { fireEvent, render, screen, within } from '@testing-library/react'
import { algoliasearch } from 'algoliasearch'
import {
  useHits,
  useInstantSearch,
  usePagination,
  useRefinementList,
  useSearchBox
} from 'react-instantsearch'

import { AlgoliaVideoList } from './AlgoliaVideoList'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush
  }))
}))

jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn(() => ({}))
}))

jest.mock('react-instantsearch', () => ({
  Configure: ({ children }) => <>{children}</>,
  InstantSearch: ({ children }) => <>{children}</>,
  useHits: jest.fn(),
  useInstantSearch: jest.fn(),
  usePagination: jest.fn(),
  useRefinementList: jest.fn(),
  useSearchBox: jest.fn()
}))

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>
const mockUseHits = useHits as jest.MockedFunction<typeof useHits>
const mockUseInstantSearch = useInstantSearch as jest.MockedFunction<
  typeof useInstantSearch
>
const mockUsePagination = usePagination as jest.MockedFunction<
  typeof usePagination
>
const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>
const mockAlgoliaSearch = algoliasearch as jest.MockedFunction<
  typeof algoliasearch
>

describe('AlgoliaVideoList', () => {
  const originalEnv = process.env
  const mockSearchRefine = jest.fn()
  const mockPageRefine = jest.fn()
  const mockPublishedRefine = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ALGOLIA_APP_ID: 'test-app-id',
      NEXT_PUBLIC_ALGOLIA_API_KEY: 'test-api-key',
      NEXT_PUBLIC_ALGOLIA_INDEX_VIDEOS: 'test-videos'
    }

    mockUseSearchBox.mockReturnValue({
      query: '',
      refine: mockSearchRefine
    } as any)
    mockUseHits.mockReturnValue({
      items: []
    } as any)
    mockUseInstantSearch.mockReturnValue({
      status: 'idle',
      results: { nbHits: 0 },
      error: null
    } as any)
    mockUsePagination.mockReturnValue({
      currentRefinement: 0,
      nbPages: 1,
      refine: mockPageRefine
    } as any)
    mockUseRefinementList.mockReturnValue({
      items: [
        { label: 'true', value: 'published:true', isRefined: false, count: 2 },
        { label: 'false', value: 'published:false', isRefined: false, count: 1 }
      ],
      refine: mockPublishedRefine
    } as any)
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('renders search and published filter controls', () => {
    render(<AlgoliaVideoList />)

    expect(screen.getByLabelText('Search Algolia')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Previous page' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Next page' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Published' })
    ).toBeInTheDocument()
  })

  it('renders mapped hits and published draft chips', () => {
    mockUseHits.mockReturnValue({
      items: [
        {
          objectID: 'id-1',
          mediaComponentId: 'id-1',
          titles: [{ value: 'English Title', languageId: '529', bcp47: 'en' }],
          descriptions: [{ value: 'English Description', languageId: '529' }],
          published: true,
          subType: 'collection',
          containsCount: 3
        },
        {
          objectID: 'id-2',
          mediaComponentId: 'id-2',
          title: 'Fallback Title',
          description: 'Fallback Description',
          published: false,
          subType: 'series',
          containsCount: 4
        }
      ]
    } as any)
    mockUseInstantSearch.mockReturnValue({
      status: 'idle',
      results: { nbHits: 2 },
      error: null
    } as any)

    render(<AlgoliaVideoList />)

    expect(screen.getByText('English Title')).toBeInTheDocument()
    expect(screen.getByText('Fallback Title')).toBeInTheDocument()
    const publishedRow = screen.getByRole('row', { name: /english title/i })
    expect(
      within(publishedRow).getByTestId('PublishedChip')
    ).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('navigates to media component detail on row click', () => {
    mockUseHits.mockReturnValue({
      items: [
        {
          objectID: 'video-id',
          mediaComponentId: 'video-id',
          title: 'Test Title',
          description: 'Desc',
          published: true,
          subType: 'collection',
          containsCount: 1
        }
      ]
    } as any)

    render(<AlgoliaVideoList />)

    fireEvent.click(screen.getByText('video-id'))

    expect(mockPush).toHaveBeenCalledWith('/videos/video-id')
  })

  it('refines published filter with dropdown selections', () => {
    render(<AlgoliaVideoList />)

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Published' }))
    fireEvent.click(screen.getByRole('option', { name: 'Published' }))

    expect(mockPublishedRefine).toHaveBeenCalledWith('published:true')
  })

  it('shows warning when algolia env vars are missing', () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ALGOLIA_APP_ID: '',
      NEXT_PUBLIC_ALGOLIA_API_KEY: ''
    }

    render(<AlgoliaVideoList />)

    expect(
      screen.getByText(
        'Set NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_API_KEY to use this tab.'
      )
    ).toBeInTheDocument()
    expect(mockAlgoliaSearch).not.toHaveBeenCalled()
  })

  it('shows warning when algolia index env var is missing', () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ALGOLIA_APP_ID: 'test-app-id',
      NEXT_PUBLIC_ALGOLIA_API_KEY: 'test-api-key',
      NEXT_PUBLIC_ALGOLIA_INDEX_VIDEOS: ''
    }

    render(<AlgoliaVideoList />)

    expect(
      screen.getByText('Set NEXT_PUBLIC_ALGOLIA_INDEX_VIDEOS to use this tab.')
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Search Algolia')).not.toBeInTheDocument()
  })
})
