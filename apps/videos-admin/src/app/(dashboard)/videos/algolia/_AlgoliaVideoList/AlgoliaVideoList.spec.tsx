import { fireEvent, render, screen } from '@testing-library/react'
import { algoliasearch } from 'algoliasearch'
import {
  Configure,
  useHits,
  useInstantSearch,
  usePagination,
  useRefinementList,
  useSearchBox
} from 'react-instantsearch'
import { type MockedFunction } from 'vitest'

import { AlgoliaVideoList } from './AlgoliaVideoList'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush
  }))
}))

vi.mock('algoliasearch', () => ({
  algoliasearch: vi.fn(() => ({}))
}))

vi.mock('react-instantsearch', () => ({
  Configure: vi.fn(() => null),
  InstantSearch: ({ children }) => <>{children}</>,
  useHits: vi.fn(),
  useInstantSearch: vi.fn(),
  usePagination: vi.fn(),
  useRefinementList: vi.fn(),
  useSearchBox: vi.fn()
}))

const mockConfigure = Configure as MockedFunction<typeof Configure>
const mockUseSearchBox = useSearchBox as MockedFunction<typeof useSearchBox>
const mockUseHits = useHits as MockedFunction<typeof useHits>
const mockUseInstantSearch = useInstantSearch as MockedFunction<
  typeof useInstantSearch
>
const mockUsePagination = usePagination as MockedFunction<typeof usePagination>
const mockUseRefinementList = useRefinementList as MockedFunction<
  typeof useRefinementList
>
const mockAlgoliaSearch = algoliasearch as MockedFunction<typeof algoliasearch>

describe('AlgoliaVideoList', () => {
  const originalEnv = process.env
  const mockSearchRefine = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
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
      error: null
    } as any)
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('renders search and published filter controls with local hit counts', () => {
    mockUseHits.mockReturnValue({
      items: [
        {
          objectID: 'published-1',
          mediaComponentId: 'published-1',
          published: true
        },
        {
          objectID: 'published-2',
          mediaComponentId: 'published-2',
          published: true
        },
        { objectID: 'draft-1', mediaComponentId: 'draft-1', published: false }
      ]
    } as any)

    render(<AlgoliaVideoList />)

    expect(screen.getByLabelText('Search Algolia')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Showing up to 1000 Algolia records. Some records may not map to an editable admin video detail page.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Published' })
    ).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Published' }))
    expect(screen.getByRole('option', { name: 'Both (3)' })).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Published (2)' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Draft (1)' })
    ).toBeInTheDocument()
  })

  it('requests one large algolia result set without facet or pagination refinement hooks', () => {
    render(<AlgoliaVideoList />)

    const configureProps = mockConfigure.mock.calls[0]?.[0] as
      | {
          attributesToRetrieve?: string[]
          hitsPerPage?: number
        }
      | undefined

    expect(configureProps).toEqual(
      expect.objectContaining({
        attributesToRetrieve: expect.arrayContaining([
          'objectID',
          'mediaComponentId',
          'published'
        ]),
        hitsPerPage: 1000
      })
    )
    expect(mockUseRefinementList).not.toHaveBeenCalled()
    expect(mockUsePagination).not.toHaveBeenCalled()
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
      error: null
    } as any)

    render(<AlgoliaVideoList />)

    expect(screen.getByText('English Title')).toBeInTheDocument()
    expect(screen.getByText('Fallback Title')).toBeInTheDocument()
    const publishedChips = screen.getAllByTestId('PublishedChip')
    expect(publishedChips).toHaveLength(2)
    expect(publishedChips.map((chip) => chip.textContent)).toEqual(
      expect.arrayContaining(['Published', 'Draft'])
    )
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

  it('does not navigate when row has no mediaComponentId', () => {
    mockUseHits.mockReturnValue({
      items: [
        {
          objectID: 'orphan-id',
          title: 'Orphan Record',
          description: 'No editable mapping',
          published: false,
          subType: '',
          containsCount: 0
        }
      ]
    } as any)

    render(<AlgoliaVideoList />)

    fireEvent.click(screen.getByText('orphan-id'))

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('filters published rows locally with dropdown selections', () => {
    mockUseHits.mockReturnValue({
      items: [
        {
          objectID: 'published-id',
          mediaComponentId: 'published-id',
          title: 'Published Title',
          published: true
        },
        {
          objectID: 'draft-id',
          mediaComponentId: 'draft-id',
          title: 'Draft Title',
          published: false
        }
      ]
    } as any)

    render(<AlgoliaVideoList />)

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Published' }))
    fireEvent.click(screen.getByRole('option', { name: 'Published (1)' }))

    expect(screen.getByText('Published Title')).toBeInTheDocument()
    expect(screen.queryByText('Draft Title')).not.toBeInTheDocument()
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
