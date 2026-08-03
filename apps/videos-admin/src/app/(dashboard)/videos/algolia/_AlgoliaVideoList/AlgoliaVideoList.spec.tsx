import { fireEvent, render, screen } from '@testing-library/react'
import { algoliasearch } from 'algoliasearch'
import {
  Configure,
  useHits,
  useInstantSearch,
  useMenu,
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
  useMenu: vi.fn(),
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
const mockUseMenu = useMenu as MockedFunction<typeof useMenu>
const mockAlgoliaSearch = algoliasearch as MockedFunction<typeof algoliasearch>

describe('AlgoliaVideoList', () => {
  const originalEnv = process.env
  const mockSearchRefine = vi.fn()
  const mockPublishedRefine = vi.fn()
  const mockLabelRefine = vi.fn()

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
    mockUseMenu.mockReturnValue({
      items: [
        { label: 'true', value: 'true', count: 2, isRefined: false },
        { label: 'false', value: 'false', count: 1, isRefined: false }
      ],
      refine: mockPublishedRefine
    } as any)
    mockUseRefinementList.mockReturnValue({
      items: [
        { label: 'series', value: 'series', count: 2, isRefined: false },
        { label: 'collection', value: 'collection', count: 5, isRefined: false }
      ],
      refine: mockLabelRefine
    } as any)
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('renders search and published filter controls with facet counts', () => {
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

  it('reports published counts from the facet rather than the fetched hits', () => {
    mockUseHits.mockReturnValue({
      items: [
        {
          objectID: 'published-1',
          mediaComponentId: 'published-1',
          published: true
        }
      ]
    } as any)
    mockUseMenu.mockReturnValue({
      items: [
        { label: 'true', value: 'true', count: 900, isRefined: false },
        { label: 'false', value: 'false', count: 100, isRefined: false }
      ],
      refine: mockPublishedRefine
    } as any)

    render(<AlgoliaVideoList />)

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Published' }))

    expect(
      screen.getByRole('option', { name: 'Both (1000)' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Published (900)' })
    ).toBeInTheDocument()
  })

  it('requests one large algolia result set without pagination refinement', () => {
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
    expect(mockUsePagination).not.toHaveBeenCalled()
  })

  it('refines the subType facet for the label filter', () => {
    render(<AlgoliaVideoList />)

    expect(mockUseRefinementList).toHaveBeenCalledWith(
      expect.objectContaining({ attribute: 'subType' })
    )
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

  it('refines the published facet from dropdown selections', () => {
    render(<AlgoliaVideoList />)

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Published' }))
    fireEvent.click(screen.getByRole('option', { name: 'Published (2)' }))

    expect(mockPublishedRefine).toHaveBeenCalledWith('true')
  })

  it('clears the published refinement when selecting both', () => {
    mockUseMenu.mockReturnValue({
      items: [
        { label: 'true', value: '', count: 2, isRefined: true },
        { label: 'false', value: 'false', count: 1, isRefined: false }
      ],
      refine: mockPublishedRefine
    } as any)

    render(<AlgoliaVideoList />)

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Published' }))
    fireEvent.click(screen.getByRole('option', { name: 'Both (3)' }))

    expect(mockPublishedRefine).toHaveBeenCalledWith('')
  })

  it('renders label facet options in canonical order with display names', () => {
    render(<AlgoliaVideoList />)

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Label' }))

    const options = screen.getAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual([
      'Collection (5)',
      'Series (2)'
    ])
  })

  it('toggles a label refinement when an option is selected', () => {
    render(<AlgoliaVideoList />)

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Label' }))
    fireEvent.click(screen.getByRole('option', { name: 'Collection (5)' }))

    expect(mockLabelRefine).toHaveBeenCalledWith('collection')
  })

  it('removes a label refinement when a selected option is deselected', () => {
    mockUseRefinementList.mockReturnValue({
      items: [
        { label: 'collection', value: 'collection', count: 5, isRefined: true }
      ],
      refine: mockLabelRefine
    } as any)

    render(<AlgoliaVideoList />)

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Label' }))
    fireEvent.click(screen.getByRole('option', { name: 'Collection (5)' }))

    expect(mockLabelRefine).toHaveBeenCalledWith('collection')
  })

  it('hides the label filter when the index exposes no facet values', () => {
    mockUseRefinementList.mockReturnValue({
      items: [],
      refine: mockLabelRefine
    } as any)

    render(<AlgoliaVideoList />)

    expect(
      screen.queryByRole('combobox', { name: 'Label' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Published' })
    ).toBeInTheDocument()
  })

  it('hides the published filter when the index exposes no facet values', () => {
    mockUseMenu.mockReturnValue({
      items: [],
      refine: mockPublishedRefine
    } as any)

    render(<AlgoliaVideoList />)

    expect(
      screen.queryByRole('combobox', { name: 'Published' })
    ).not.toBeInTheDocument()
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
