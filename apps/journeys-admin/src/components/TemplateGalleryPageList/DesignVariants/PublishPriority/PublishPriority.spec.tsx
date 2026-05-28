import { DndContext } from '@dnd-kit/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement, ReactNode } from 'react'

import '../../../../../test/i18n'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import type { CollectionViewProps } from '../types'

import { PublishPriority } from './PublishPriority'

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
  // useDroppable inside PublishPriority requires a DndContext ancestor.
  return <DndContext>{children}</DndContext>
}

describe('PublishPriority', () => {
  it('shows the publish banner with the count of drafts ready to publish', () => {
    const collections = [
      makeCollection({ id: 'a', title: 'Alpha' }),
      makeCollection({ id: 'b', title: 'Beta' }),
      // Empty draft — does NOT count toward the banner.
      makeCollection({ id: 'c', title: 'Gamma', templates: [] }),
      // Published — does NOT count toward the banner.
      makeCollection({
        id: 'd',
        title: 'Delta',
        status: TemplateGalleryPageStatus.published
      })
    ]
    render(
      <Wrapper>
        <PublishPriority {...makeProps({ collections })} />
      </Wrapper>
    )
    const banner = screen.getByTestId('PublishPriorityBanner')
    expect(banner).toBeInTheDocument()
    expect(banner).toHaveTextContent('2 collections need publishing')
  })

  it('hides the banner when no collections need publishing', () => {
    const collections = [
      makeCollection({ id: 'c', title: 'Gamma', templates: [] }),
      makeCollection({
        id: 'd',
        title: 'Delta',
        status: TemplateGalleryPageStatus.published
      })
    ]
    render(
      <Wrapper>
        <PublishPriority {...makeProps({ collections })} />
      </Wrapper>
    )
    expect(
      screen.queryByTestId('PublishPriorityBanner')
    ).not.toBeInTheDocument()
    // Section 1 falls back to the "all caught up" empty state.
    expect(
      screen.getByTestId('PublishPriorityNeedsPublishingEmpty')
    ).toBeInTheDocument()
  })

  it('groups collections into the correct sections by status and emptiness', () => {
    const collections = [
      makeCollection({ id: 'needs', title: 'Needs One' }),
      makeCollection({ id: 'empty', title: 'Empty One', templates: [] }),
      makeCollection({
        id: 'live',
        title: 'Live One',
        status: TemplateGalleryPageStatus.published
      })
    ]
    render(
      <Wrapper>
        <PublishPriority {...makeProps({ collections })} />
      </Wrapper>
    )
    expect(
      screen.getByTestId('PublishPriorityNeedsCard-needs')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('PublishPriorityEmptyCard-empty')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('PublishPriorityPublishedCard-live')
    ).toBeInTheDocument()
  })

  it('renders a contained PUBLISH button on needs-publishing cards only', () => {
    const collections = [
      makeCollection({ id: 'needs', title: 'Needs One' }),
      makeCollection({ id: 'empty', title: 'Empty One', templates: [] }),
      makeCollection({
        id: 'live',
        title: 'Live One',
        status: TemplateGalleryPageStatus.published
      })
    ]
    render(
      <Wrapper>
        <PublishPriority {...makeProps({ collections })} />
      </Wrapper>
    )
    expect(
      screen.getByTestId('PublishPriorityNeedsCard-needs-publish')
    ).toBeInTheDocument()
    // No publish button on empty or published cards.
    expect(
      screen.queryByTestId('PublishPriorityEmptyCard-empty-publish')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('PublishPriorityPublishedCard-live-publish')
    ).not.toBeInTheDocument()
  })

  it('renders a LIVE label on published cards only', () => {
    const collections = [
      makeCollection({ id: 'needs', title: 'Needs One' }),
      makeCollection({
        id: 'live',
        title: 'Live One',
        status: TemplateGalleryPageStatus.published
      })
    ]
    render(
      <Wrapper>
        <PublishPriority {...makeProps({ collections })} />
      </Wrapper>
    )
    expect(
      screen.getByTestId('PublishPriorityPublishedCard-live-status')
    ).toBeInTheDocument()
    // The needs-card status label is the DRAFT chip, not LIVE.
    expect(
      screen.getByTestId('PublishPriorityNeedsCard-needs-status')
    ).toHaveTextContent('Draft')
  })

  it('calls onOpenPublish (and not onSelectCollection) when PUBLISH is clicked', async () => {
    const handleOpenPublish = jest.fn()
    const handleSelectCollection = jest.fn()
    const collection = makeCollection({ id: 'needs', title: 'Needs One' })
    render(
      <Wrapper>
        <PublishPriority
          {...makeProps({
            collections: [collection],
            onOpenPublish: handleOpenPublish,
            onSelectCollection: handleSelectCollection
          })}
        />
      </Wrapper>
    )
    await userEvent.click(
      screen.getByTestId('PublishPriorityNeedsCard-needs-publish')
    )
    expect(handleOpenPublish).toHaveBeenCalledWith(collection)
    // stopPropagation should keep the card click from firing.
    expect(handleSelectCollection).not.toHaveBeenCalled()
  })

  it('calls onSelectCollection with the id when the card body is clicked', async () => {
    const handleSelectCollection = jest.fn()
    const collection = makeCollection({ id: 'needs', title: 'Needs One' })
    render(
      <Wrapper>
        <PublishPriority
          {...makeProps({
            collections: [collection],
            onSelectCollection: handleSelectCollection
          })}
        />
      </Wrapper>
    )
    await userEvent.click(screen.getByTestId('PublishPriorityNeedsCard-needs'))
    expect(handleSelectCollection).toHaveBeenCalledWith('needs')
  })

  it('calls onSelectCollection with null when the All Templates card is clicked', async () => {
    const handleSelectCollection = jest.fn()
    render(
      <Wrapper>
        <PublishPriority
          {...makeProps({
            collections: [makeCollection({ id: 'col-1' })],
            selectedCollectionId: 'col-1',
            onSelectCollection: handleSelectCollection
          })}
        />
      </Wrapper>
    )
    await userEvent.click(screen.getByTestId('PublishPriorityAllTemplatesCard'))
    expect(handleSelectCollection).toHaveBeenCalledWith(null)
  })
})
