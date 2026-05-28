import { DndContext } from '@dnd-kit/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement, ReactNode } from 'react'

import '../../../../../test/i18n'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import type { CollectionViewProps } from '../types'

import { PublishPipeline } from './PublishPipeline'

function makeTemplate(
  overrides: Partial<TemplateGalleryPage['templates'][number]> = {}
): TemplateGalleryPage['templates'][number] {
  return {
    __typename: 'TemplateGalleryItem',
    id: 'tpl-1',
    title: 'Template',
    primaryImageBlock: null,
    ...overrides
  }
}

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
    templates: [makeTemplate()],
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
  // useDroppable inside PublishPipeline requires a DndContext ancestor.
  return <DndContext>{children}</DndContext>
}

describe('PublishPipeline', () => {
  it('renders collections in the correct kanban column by status', () => {
    const collections = [
      makeCollection({
        id: 'draft-empty',
        title: 'Empty Draft',
        templates: []
      }),
      makeCollection({
        id: 'ready-1',
        title: 'Ready One',
        templates: [makeTemplate({ id: 't1' })]
      }),
      makeCollection({
        id: 'live-1',
        title: 'Live One',
        status: TemplateGalleryPageStatus.published,
        templates: [makeTemplate({ id: 't2' })]
      })
    ]
    render(
      <Wrapper>
        <PublishPipeline {...makeProps({ collections })} />
      </Wrapper>
    )

    const draftColumn = screen.getByTestId('PublishPipelineColumn-draft')
    const readyColumn = screen.getByTestId('PublishPipelineColumn-ready')
    const liveColumn = screen.getByTestId('PublishPipelineColumn-live')

    expect(
      draftColumn.querySelector(
        '[data-testid="PublishPipelineCard-draft-empty"]'
      )
    ).not.toBeNull()
    expect(
      readyColumn.querySelector('[data-testid="PublishPipelineCard-ready-1"]')
    ).not.toBeNull()
    expect(
      liveColumn.querySelector('[data-testid="PublishPipelineCard-live-1"]')
    ).not.toBeNull()

    // Cross-column negative: a ready card must not appear in the draft column.
    expect(
      draftColumn.querySelector('[data-testid="PublishPipelineCard-ready-1"]')
    ).toBeNull()
  })

  it('calls onOpenPublish when the READY card PUBLISH button is clicked', async () => {
    const handleOpenPublish = jest.fn()
    const handleSelectCollection = jest.fn()
    const ready = makeCollection({
      id: 'ready-1',
      title: 'Ready One',
      templates: [makeTemplate({ id: 't1' })]
    })
    render(
      <Wrapper>
        <PublishPipeline
          {...makeProps({
            collections: [ready],
            onOpenPublish: handleOpenPublish,
            onSelectCollection: handleSelectCollection
          })}
        />
      </Wrapper>
    )
    await userEvent.click(
      screen.getByTestId('PublishPipelineCard-ready-1-publish')
    )
    expect(handleOpenPublish).toHaveBeenCalledTimes(1)
    expect(handleOpenPublish).toHaveBeenCalledWith(ready)
    // stopPropagation: the card's own onClick must not fire.
    expect(handleSelectCollection).not.toHaveBeenCalled()
  })

  it('calls onSelectCollection when a card itself is clicked', async () => {
    const handleSelectCollection = jest.fn()
    const collections = [
      makeCollection({
        id: 'ready-1',
        title: 'Ready One',
        templates: [makeTemplate({ id: 't1' })]
      })
    ]
    render(
      <Wrapper>
        <PublishPipeline
          {...makeProps({
            collections,
            onSelectCollection: handleSelectCollection
          })}
        />
      </Wrapper>
    )
    await userEvent.click(screen.getByTestId('PublishPipelineCard-ready-1'))
    expect(handleSelectCollection).toHaveBeenCalledWith('ready-1')
  })

  it('renders the success LIVE label and Edit button on LIVE cards (no Publish)', async () => {
    const handleEdit = jest.fn()
    const live = makeCollection({
      id: 'live-1',
      title: 'Live One',
      status: TemplateGalleryPageStatus.published,
      templates: [makeTemplate({ id: 't1' })]
    })
    render(
      <Wrapper>
        <PublishPipeline
          {...makeProps({ collections: [live], onEdit: handleEdit })}
        />
      </Wrapper>
    )
    expect(
      screen.getByTestId('PublishPipelineCard-live-1-status')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('PublishPipelineCard-live-1-publish')
    ).not.toBeInTheDocument()
    await userEvent.click(screen.getByTestId('PublishPipelineCard-live-1-edit'))
    expect(handleEdit).toHaveBeenCalledWith(live)
  })

  it('shows the empty-column message when a column has no collections', () => {
    render(
      <Wrapper>
        <PublishPipeline {...makeProps({ collections: [] })} />
      </Wrapper>
    )
    expect(
      screen.getByTestId('PublishPipelineColumn-draft-empty')
    ).toHaveTextContent('No drafts.')
    expect(
      screen.getByTestId('PublishPipelineColumn-ready-empty')
    ).toHaveTextContent('No collections ready.')
    expect(
      screen.getByTestId('PublishPipelineColumn-live-empty')
    ).toHaveTextContent('Nothing published yet.')
  })

  it('renders the All Templates strip with the active aria-pressed state', () => {
    render(
      <Wrapper>
        <PublishPipeline
          {...makeProps({
            collections: [
              makeCollection({
                id: 'c1',
                templates: [makeTemplate({ id: 't1' })]
              })
            ],
            selectedCollectionId: null,
            allTemplatesCount: 5
          })}
        />
      </Wrapper>
    )
    const strip = screen.getByTestId('PublishPipelineAllTemplatesStrip')
    expect(strip).toBeInTheDocument()
    expect(strip).toHaveAttribute('aria-pressed', 'true')
  })
})
