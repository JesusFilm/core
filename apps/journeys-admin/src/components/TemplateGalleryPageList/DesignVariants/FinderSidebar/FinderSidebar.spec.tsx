import { DndContext } from '@dnd-kit/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement, ReactNode } from 'react'

import '../../../../../test/i18n'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import { CollectionViewProps } from '../types'

import { FinderSidebar } from './FinderSidebar'

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
    templates: [],
    ...overrides
  }
}

function makeProps(
  overrides: Partial<CollectionViewProps> = {}
): CollectionViewProps {
  return {
    collections: [
      makeCollection({ id: 'col-1', title: 'Marketing' }),
      makeCollection({ id: 'col-2', title: 'Onboarding' }),
      makeCollection({ id: 'col-3', title: 'Sales' })
    ],
    allTemplatesCount: 12,
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
  // useDroppable inside SidebarRow requires a DndContext ancestor.
  return <DndContext>{children}</DndContext>
}

describe('FinderSidebar', () => {
  it('renders All Templates plus a row per collection', () => {
    render(
      <Wrapper>
        <FinderSidebar {...makeProps()} />
      </Wrapper>
    )
    expect(screen.getByTestId('FinderSidebarRow-all')).toBeInTheDocument()
    expect(screen.getByTestId('FinderSidebarRow-col-1')).toBeInTheDocument()
    expect(screen.getByTestId('FinderSidebarRow-col-2')).toBeInTheDocument()
    expect(screen.getByTestId('FinderSidebarRow-col-3')).toBeInTheDocument()
    // Header strip shows the active filter (All Templates by default).
    expect(screen.getByTestId('FinderSidebarHeader')).toHaveTextContent(
      'All Templates'
    )
  })

  it('calls onSelectCollection with the id when a collection row is clicked', async () => {
    const handleSelect = jest.fn()
    render(
      <Wrapper>
        <FinderSidebar {...makeProps({ onSelectCollection: handleSelect })} />
      </Wrapper>
    )
    await userEvent.click(screen.getByTestId('FinderSidebarRow-col-2'))
    expect(handleSelect).toHaveBeenCalledWith('col-2')
  })

  it('calls onSelectCollection with null when All Templates is clicked', async () => {
    const handleSelect = jest.fn()
    render(
      <Wrapper>
        <FinderSidebar
          {...makeProps({
            selectedCollectionId: 'col-1',
            onSelectCollection: handleSelect
          })}
        />
      </Wrapper>
    )
    await userEvent.click(screen.getByTestId('FinderSidebarRow-all'))
    expect(handleSelect).toHaveBeenCalledWith(null)
  })

  it('marks the active row with aria-pressed', () => {
    render(
      <Wrapper>
        <FinderSidebar {...makeProps({ selectedCollectionId: 'col-1' })} />
      </Wrapper>
    )
    expect(screen.getByTestId('FinderSidebarRow-col-1')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByTestId('FinderSidebarRow-all')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('filters the visible collection rows by search query (case-insensitive)', async () => {
    render(
      <Wrapper>
        <FinderSidebar {...makeProps()} />
      </Wrapper>
    )
    const search = screen.getByLabelText('Search collections')
    await userEvent.type(search, 'sal')
    // All Templates is always visible regardless of the search box.
    expect(screen.getByTestId('FinderSidebarRow-all')).toBeInTheDocument()
    expect(screen.getByTestId('FinderSidebarRow-col-3')).toBeInTheDocument()
    expect(
      screen.queryByTestId('FinderSidebarRow-col-1')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('FinderSidebarRow-col-2')
    ).not.toBeInTheDocument()
  })

  it('shows the published Live label on published collections', () => {
    render(
      <Wrapper>
        <FinderSidebar
          {...makeProps({
            collections: [
              makeCollection({
                id: 'col-1',
                title: 'Marketing',
                status: TemplateGalleryPageStatus.published,
                publishedAt: '2026-05-06T00:00:00Z'
              })
            ]
          })}
        />
      </Wrapper>
    )
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('hides the per-collection actions menu when All Templates is selected', () => {
    render(
      <Wrapper>
        <FinderSidebar {...makeProps({ selectedCollection: null })} />
      </Wrapper>
    )
    // The menu test ids include `-finder-sidebar`; nothing should match.
    expect(
      screen.queryByTestId(/collection-menu-.*-finder-sidebar/)
    ).not.toBeInTheDocument()
  })

  it('renders the empty state message when no templates match', () => {
    render(
      <Wrapper>
        <FinderSidebar
          {...makeProps({
            selectedCollection: makeCollection({ id: 'col-1' }),
            filteredJourneys: []
          })}
        />
      </Wrapper>
    )
    expect(screen.getByTestId('FinderSidebarEmpty')).toBeInTheDocument()
    expect(
      screen.getByText('No templates yet — drag templates here to add them.')
    ).toBeInTheDocument()
  })

  it('renders the "all in collections" empty state for All Templates with grouped items', () => {
    render(
      <Wrapper>
        <FinderSidebar
          {...makeProps({
            selectedCollection: null,
            filteredJourneys: [],
            allTemplatesCount: 5
          })}
        />
      </Wrapper>
    )
    expect(
      screen.getByText('All templates are in collections.')
    ).toBeInTheDocument()
  })
})
