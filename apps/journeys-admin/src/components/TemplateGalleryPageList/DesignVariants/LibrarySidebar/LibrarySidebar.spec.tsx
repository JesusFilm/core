import { DndContext } from '@dnd-kit/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement, ReactNode } from 'react'

import '../../../../../test/i18n'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'

import { LibrarySidebar } from './LibrarySidebar'

function makeCollection(
  overrides: Partial<TemplateGalleryPage> = {}
): TemplateGalleryPage {
  return {
    __typename: 'TemplateGalleryPage',
    id: 'page-1',
    title: 'Marketing',
    description: '',
    slug: 'marketing',
    status: TemplateGalleryPageStatus.draft,
    creatorName: 'Creator',
    creatorImageSrc: null,
    creatorImageAlt: null,
    mediaUrl: null,
    publishedAt: null,
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    templates: [
      {
        __typename: 'TemplateGalleryItem',
        id: 'j1',
        title: 'Welcome',
        primaryImageBlock: null
      }
    ],
    ...overrides
  }
}

interface RenderOptions {
  collections?: readonly TemplateGalleryPage[]
  selectedCollectionId?: string | null
  selectedCollection?: TemplateGalleryPage | null
  onSelectCollection?: (id: string | null) => void
  filteredJourneys?: readonly Journey[]
  allTemplatesCount?: number
}

function Wrapper({ children }: { children: ReactNode }): ReactElement {
  // useDroppable inside LibrarySidebar requires a DndContext ancestor.
  return <DndContext>{children}</DndContext>
}

function renderSidebar(options: RenderOptions = {}): void {
  const {
    collections = [],
    selectedCollectionId = null,
    selectedCollection = null,
    onSelectCollection = jest.fn(),
    filteredJourneys = [],
    allTemplatesCount = 0
  } = options

  render(
    <Wrapper>
      <LibrarySidebar
        collections={collections}
        allTemplatesCount={allTemplatesCount}
        selectedCollectionId={selectedCollectionId}
        onSelectCollection={onSelectCollection}
        dropDisabled={false}
        filteredJourneys={filteredJourneys}
        selectedCollection={selectedCollection}
        dragInFlight={false}
        onEdit={jest.fn()}
        onOpenPublish={jest.fn()}
        onUngroup={jest.fn()}
        busyId={null}
        canPublish
        publishBlockedReason={null}
      />
    </Wrapper>
  )
}

describe('LibrarySidebar', () => {
  it('renders a row for each collection plus All Templates', () => {
    const collections = [
      makeCollection({ id: 'a', title: 'Marketing' }),
      makeCollection({ id: 'b', title: 'Onboarding' })
    ]
    renderSidebar({ collections, allTemplatesCount: 5 })

    expect(screen.getByTestId('LibrarySidebarRow-all')).toBeInTheDocument()
    expect(screen.getByTestId('LibrarySidebarRow-a')).toBeInTheDocument()
    expect(screen.getByTestId('LibrarySidebarRow-b')).toBeInTheDocument()
    // Row titles render in the rail.
    expect(
      screen.getByRole('button', { name: 'Marketing' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Onboarding' })
    ).toBeInTheDocument()
    // All Templates is always present.
    expect(
      screen.getByRole('button', { name: 'All Templates' })
    ).toBeInTheDocument()
  })

  it('calls onSelectCollection with the collection id when a row is clicked', async () => {
    const handleSelect = jest.fn()
    const collections = [makeCollection({ id: 'col-42', title: 'Sales' })]
    renderSidebar({ collections, onSelectCollection: handleSelect })

    await userEvent.click(screen.getByTestId('LibrarySidebarRow-col-42'))
    expect(handleSelect).toHaveBeenCalledWith('col-42')
  })

  it('calls onSelectCollection with null when the All Templates row is clicked', async () => {
    const handleSelect = jest.fn()
    renderSidebar({
      collections: [makeCollection({ id: 'a' })],
      onSelectCollection: handleSelect,
      selectedCollectionId: 'a'
    })

    await userEvent.click(screen.getByTestId('LibrarySidebarRow-all'))
    expect(handleSelect).toHaveBeenCalledWith(null)
  })

  it('filters visible rows by case-insensitive title match', async () => {
    const collections = [
      makeCollection({ id: 'a', title: 'Marketing' }),
      makeCollection({ id: 'b', title: 'Onboarding' }),
      makeCollection({ id: 'c', title: 'Sales' })
    ]
    renderSidebar({ collections })

    const searchInput = screen.getByLabelText('Search your library')
    await userEvent.type(searchInput, 'mark')

    expect(screen.getByTestId('LibrarySidebarRow-a')).toBeInTheDocument()
    expect(screen.queryByTestId('LibrarySidebarRow-b')).not.toBeInTheDocument()
    expect(screen.queryByTestId('LibrarySidebarRow-c')).not.toBeInTheDocument()
    // All Templates remains visible regardless of the search term.
    expect(screen.getByTestId('LibrarySidebarRow-all')).toBeInTheDocument()
  })

  it('marks the active row with aria-pressed="true"', () => {
    const collections = [
      makeCollection({ id: 'a', title: 'Marketing' }),
      makeCollection({ id: 'b', title: 'Onboarding' })
    ]
    renderSidebar({
      collections,
      selectedCollectionId: 'b',
      selectedCollection: collections[1]
    })

    expect(screen.getByTestId('LibrarySidebarRow-b')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByTestId('LibrarySidebarRow-a')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.getByTestId('LibrarySidebarRow-all')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('renders the LIVE label for a published collection', () => {
    const collections = [
      makeCollection({
        id: 'live-1',
        title: 'Live Collection',
        status: TemplateGalleryPageStatus.published,
        publishedAt: '2026-05-06T00:00:00Z'
      })
    ]
    renderSidebar({ collections })

    // LabelChip text is uppercased via CSS; the underlying string remains
    // the translated "Live".
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('renders the DRAFT label for an unpublished collection', () => {
    const collections = [
      makeCollection({
        id: 'draft-1',
        title: 'Draft Collection',
        status: TemplateGalleryPageStatus.draft
      })
    ]
    renderSidebar({ collections })

    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders the empty-state message when there are no filtered journeys', () => {
    renderSidebar({
      filteredJourneys: [],
      allTemplatesCount: 0
    })

    expect(screen.getByTestId('LibrarySidebarEmpty')).toBeInTheDocument()
    expect(screen.getByText('No team templates yet.')).toBeInTheDocument()
  })

  it('shows the selected collection name and count in the header strip', () => {
    const collections = [makeCollection({ id: 'a', title: 'Marketing' })]
    renderSidebar({
      collections,
      selectedCollectionId: 'a',
      selectedCollection: collections[0],
      // No filteredJourneys keeps the test off the DraggableJourneysGrid
      // render path, which pulls in Apollo-dependent JourneyCard children.
      filteredJourneys: [],
      allTemplatesCount: 1
    })

    const header = screen.getByTestId('LibrarySidebarHeader')
    expect(header).toHaveTextContent('Marketing')
    expect(header).toHaveTextContent('(0 templates)')
  })

  it('exposes a Create collection button in the rail header', () => {
    renderSidebar()
    expect(
      screen.getByRole('button', { name: 'Create collection' })
    ).toBeInTheDocument()
  })
})
