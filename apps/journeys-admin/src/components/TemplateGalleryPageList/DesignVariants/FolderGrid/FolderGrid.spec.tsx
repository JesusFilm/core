import { DndContext } from '@dnd-kit/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement, ReactNode } from 'react'

import '../../../../../test/i18n'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import type { CollectionViewProps } from '../types'

import { FolderGrid } from './FolderGrid'

function makeCollection(
  overrides: Partial<TemplateGalleryPage> = {}
): TemplateGalleryPage {
  return {
    __typename: 'TemplateGalleryPage',
    id: 'page-1',
    title: 'My Collection',
    description: '',
    slug: 'my-collection',
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
        title: 'a',
        primaryImageBlock: null
      }
    ],
    ...overrides
  }
}

function makeProps(
  overrides: Partial<CollectionViewProps> = {}
): CollectionViewProps {
  return {
    collections: [],
    allTemplatesCount: 0,
    selectedCollectionId: null,
    onSelectCollection: jest.fn(),
    dropDisabled: false,
    filteredJourneys: [],
    selectedCollection: null,
    dragInFlight: false,
    onEdit: jest.fn(),
    onOpenPublish: jest.fn(),
    onUngroup: jest.fn(),
    busyId: null,
    canPublish: true,
    publishBlockedReason: null,
    ...overrides
  }
}

function Wrapper({ children }: { children: ReactNode }): ReactElement {
  // useDroppable inside FolderGrid requires a DndContext ancestor.
  return <DndContext>{children}</DndContext>
}

describe('FolderGrid', () => {
  it('renders the All Templates card and a title for each collection', () => {
    const collections = [
      makeCollection({ id: 'col-1', title: 'Marketing' }),
      makeCollection({ id: 'col-2', title: 'Onboarding' })
    ]
    render(
      <Wrapper>
        <FolderGrid {...makeProps({ collections, allTemplatesCount: 12 })} />
      </Wrapper>
    )
    // All Templates appears both as a folder card and as the templates
    // section header, so it shows up multiple times in the DOM.
    expect(screen.getAllByText('All Templates').length).toBeGreaterThan(0)
    expect(screen.getByTestId('FolderGridAllTemplatesCard')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
    expect(screen.getByText('Onboarding')).toBeInTheDocument()
  })

  it('calls onSelectCollection with the id when a folder card is clicked', async () => {
    const handleSelectCollection = jest.fn()
    const collections = [makeCollection({ id: 'col-42', title: 'Sales' })]
    render(
      <Wrapper>
        <FolderGrid
          {...makeProps({
            collections,
            onSelectCollection: handleSelectCollection
          })}
        />
      </Wrapper>
    )
    await userEvent.click(screen.getByTestId('FolderGridCard-col-42'))
    expect(handleSelectCollection).toHaveBeenCalledWith('col-42')
  })

  it('calls onSelectCollection with null when the All Templates card is clicked', async () => {
    const handleSelectCollection = jest.fn()
    render(
      <Wrapper>
        <FolderGrid
          {...makeProps({
            collections: [makeCollection({ id: 'col-1' })],
            selectedCollectionId: 'col-1',
            onSelectCollection: handleSelectCollection
          })}
        />
      </Wrapper>
    )
    await userEvent.click(screen.getByTestId('FolderGridAllTemplatesCard'))
    expect(handleSelectCollection).toHaveBeenCalledWith(null)
  })

  it('marks the active card with aria-pressed="true"', () => {
    const collections = [
      makeCollection({ id: 'col-1', title: 'Marketing' }),
      makeCollection({ id: 'col-2', title: 'Onboarding' })
    ]
    render(
      <Wrapper>
        <FolderGrid
          {...makeProps({
            collections,
            selectedCollectionId: 'col-2',
            selectedCollection: collections[1]
          })}
        />
      </Wrapper>
    )
    expect(screen.getByTestId('FolderGridCard-col-1')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.getByTestId('FolderGridCard-col-2')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByTestId('FolderGridAllTemplatesCard')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('marks the All Templates card aria-pressed when no collection is selected', () => {
    render(
      <Wrapper>
        <FolderGrid
          {...makeProps({
            collections: [makeCollection({ id: 'col-1' })],
            selectedCollectionId: null
          })}
        />
      </Wrapper>
    )
    expect(screen.getByTestId('FolderGridAllTemplatesCard')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('renders a LIVE label for published collections', () => {
    const collections = [
      makeCollection({ id: 'col-draft', title: 'Draft One' }),
      makeCollection({
        id: 'col-live',
        title: 'Live One',
        status: TemplateGalleryPageStatus.published,
        publishedAt: '2026-05-06T00:00:00Z'
      })
    ]
    render(
      <Wrapper>
        <FolderGrid {...makeProps({ collections })} />
      </Wrapper>
    )
    // The LIVE label is only rendered on the published card.
    expect(
      screen.getByTestId('FolderGridCard-col-live-status')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('FolderGridCard-col-draft-status')
    ).not.toBeInTheDocument()
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('shows the "No collections yet." empty state when there are no collections', () => {
    render(
      <Wrapper>
        <FolderGrid {...makeProps({ collections: [] })} />
      </Wrapper>
    )
    expect(screen.getByTestId('FolderGridEmptyCollections')).toBeInTheDocument()
    expect(screen.getByText('No collections yet.')).toBeInTheDocument()
  })
})
