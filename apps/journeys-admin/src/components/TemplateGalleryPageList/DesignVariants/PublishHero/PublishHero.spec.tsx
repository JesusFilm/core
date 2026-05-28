import { DndContext } from '@dnd-kit/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement, ReactNode } from 'react'

import '../../../../../test/i18n'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'

import { PublishHero } from './PublishHero'

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
  onOpenPublish?: (collection: TemplateGalleryPage) => void
  onEdit?: (collection: TemplateGalleryPage) => void
  onUngroup?: (collection: TemplateGalleryPage) => void
  filteredJourneys?: readonly Journey[]
  allTemplatesCount?: number
  canPublish?: boolean
  publishBlockedReason?: string | null
  busyId?: string | null
}

function Wrapper({ children }: { children: ReactNode }): ReactElement {
  // useDroppable inside PublishHero requires a DndContext ancestor.
  return <DndContext>{children}</DndContext>
}

function renderHero(options: RenderOptions = {}): void {
  const {
    collections = [],
    selectedCollectionId = null,
    selectedCollection = null,
    onSelectCollection = jest.fn(),
    onOpenPublish = jest.fn(),
    onEdit = jest.fn(),
    onUngroup = jest.fn(),
    filteredJourneys = [],
    allTemplatesCount = 0,
    canPublish = true,
    publishBlockedReason = null,
    busyId = null
  } = options

  render(
    <Wrapper>
      <PublishHero
        collections={collections}
        allTemplatesCount={allTemplatesCount}
        selectedCollectionId={selectedCollectionId}
        onSelectCollection={onSelectCollection}
        dropDisabled={false}
        filteredJourneys={filteredJourneys}
        selectedCollection={selectedCollection}
        dragInFlight={false}
        onEdit={onEdit}
        onOpenPublish={onOpenPublish}
        onUngroup={onUngroup}
        busyId={busyId}
        canPublish={canPublish}
        publishBlockedReason={publishBlockedReason}
      />
    </Wrapper>
  )
}

describe('PublishHero', () => {
  it('renders a sidebar row for each collection plus All Templates', () => {
    const collections = [
      makeCollection({ id: 'a', title: 'Marketing' }),
      makeCollection({ id: 'b', title: 'Onboarding' })
    ]
    renderHero({ collections, allTemplatesCount: 5 })

    expect(screen.getByTestId('PublishHeroRow-all')).toBeInTheDocument()
    expect(screen.getByTestId('PublishHeroRow-a')).toBeInTheDocument()
    expect(screen.getByTestId('PublishHeroRow-b')).toBeInTheDocument()
  })

  it('calls onSelectCollection with the collection id when a sidebar row is clicked', async () => {
    const handleSelect = jest.fn()
    const collections = [makeCollection({ id: 'col-42', title: 'Sales' })]
    renderHero({ collections, onSelectCollection: handleSelect })

    await userEvent.click(screen.getByTestId('PublishHeroRow-col-42'))
    expect(handleSelect).toHaveBeenCalledWith('col-42')
  })

  it('calls onSelectCollection with null when the All Templates row is clicked', async () => {
    const handleSelect = jest.fn()
    renderHero({
      collections: [makeCollection({ id: 'a' })],
      selectedCollectionId: 'a',
      onSelectCollection: handleSelect
    })

    await userEvent.click(screen.getByTestId('PublishHeroRow-all'))
    expect(handleSelect).toHaveBeenCalledWith(null)
  })

  it('renders the PUBLISH NOW button when a draft collection with templates is selected', () => {
    const collection = makeCollection({
      id: 'draft-1',
      title: 'Marketing',
      status: TemplateGalleryPageStatus.draft
    })
    renderHero({
      collections: [collection],
      selectedCollectionId: collection.id,
      selectedCollection: collection
    })

    expect(screen.getByTestId('PublishHeroCard-draft')).toBeInTheDocument()
    const button = screen.getByTestId('PublishHeroPublishButton')
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('calls onOpenPublish with the active collection when the PUBLISH NOW button is clicked', async () => {
    const handlePublish = jest.fn()
    const collection = makeCollection({
      id: 'draft-1',
      title: 'Marketing',
      status: TemplateGalleryPageStatus.draft
    })
    renderHero({
      collections: [collection],
      selectedCollectionId: collection.id,
      selectedCollection: collection,
      onOpenPublish: handlePublish
    })

    await userEvent.click(screen.getByTestId('PublishHeroPublishButton'))
    expect(handlePublish).toHaveBeenCalledWith(collection)
  })

  it('shows the LIVE label and hides the publish button when a published collection is selected', () => {
    const collection = makeCollection({
      id: 'live-1',
      title: 'Live Collection',
      status: TemplateGalleryPageStatus.published,
      publishedAt: '2026-05-06T00:00:00Z'
    })
    renderHero({
      collections: [collection],
      selectedCollectionId: collection.id,
      selectedCollection: collection
    })

    expect(screen.getByTestId('PublishHeroCard-published')).toBeInTheDocument()
    // LabelChip text is uppercased via CSS; the underlying string remains
    // the translated "Live".
    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(
      screen.queryByTestId('PublishHeroPublishButton')
    ).not.toBeInTheDocument()
  })

  it('hides the publish button and shows the drop helper for a draft with no templates', () => {
    const collection = makeCollection({
      id: 'empty-1',
      title: 'Empty Folder',
      status: TemplateGalleryPageStatus.draft,
      templates: []
    })
    renderHero({
      collections: [collection],
      selectedCollectionId: collection.id,
      selectedCollection: collection
    })

    expect(screen.getByTestId('PublishHeroCard-empty')).toBeInTheDocument()
    expect(
      screen.queryByTestId('PublishHeroPublishButton')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(
        'Add templates to publish. Drag any template card onto a folder.'
      )
    ).toBeInTheDocument()
  })

  it('renders the "ready to publish" callout on All Templates when draft collections have templates', () => {
    const collections = [
      makeCollection({
        id: 'draft-with-templates',
        title: 'Marketing',
        status: TemplateGalleryPageStatus.draft
      }),
      makeCollection({
        id: 'draft-empty',
        title: 'Onboarding',
        status: TemplateGalleryPageStatus.draft,
        templates: []
      }),
      makeCollection({
        id: 'live-1',
        title: 'Live Folder',
        status: TemplateGalleryPageStatus.published,
        templates: [
          {
            __typename: 'TemplateGalleryItem',
            id: 'jx',
            title: 'Live Template',
            primaryImageBlock: null
          }
        ]
      })
    ]
    renderHero({
      collections,
      allTemplatesCount: 2
    })

    expect(screen.getByTestId('PublishHeroCard-all')).toBeInTheDocument()
    const callout = screen.getByTestId('PublishHeroReadyToPublishCallout')
    expect(callout).toBeInTheDocument()
    // Exactly one draft collection has templates → singular copy.
    expect(callout).toHaveTextContent(
      '1 collection is ready to publish — pick one from the sidebar to publish'
    )
  })

  it('renders the quick-create-collection drop zone above All Templates', () => {
    renderHero({ collections: [] })
    const dropZone = screen.getByTestId('PublishHeroCreateNewDropZone')
    expect(dropZone).toBeInTheDocument()
    // Idle label is "New collection"; it switches to "Drop to create" while
    // a template is over the zone (drag state isn't simulated here, so we
    // only assert the idle copy).
    expect(dropZone).toHaveTextContent('New collection')
  })
})
