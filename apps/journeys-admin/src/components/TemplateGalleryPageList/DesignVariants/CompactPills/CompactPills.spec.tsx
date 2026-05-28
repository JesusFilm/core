import { DndContext } from '@dnd-kit/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement, ReactNode } from 'react'

import '../../../../../test/i18n'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import type { CollectionViewProps } from '../types'

import { CompactPills } from './CompactPills'

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
    templates: [],
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
    canPublish: false,
    publishBlockedReason: null,
    ...overrides
  }
}

function Wrapper({ children }: { children: ReactNode }): ReactElement {
  // useDroppable inside the pills requires a DndContext ancestor — the parent
  // would normally provide it, so the spec mirrors that wiring.
  return <DndContext>{children}</DndContext>
}

describe('CompactPills', () => {
  it('renders an All Templates pill and a pill for every collection', () => {
    const collections = [
      makeCollection({ id: 'col-marketing', title: 'Marketing' }),
      makeCollection({ id: 'col-sales', title: 'Sales' })
    ]
    render(
      <Wrapper>
        <CompactPills {...makeProps({ collections, allTemplatesCount: 47 })} />
      </Wrapper>
    )
    expect(screen.getByTestId('CompactPill-__all_templates__')).toBeVisible()
    // "All Templates" also renders in the header strip; the pill is asserted
    // via its data-testid above, so we only check the collection titles here.
    expect(screen.getByText('Marketing')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
  })

  it('calls onSelectCollection with the collection id when a pill is clicked', async () => {
    const handleSelect = jest.fn()
    const collections = [
      makeCollection({ id: 'col-marketing', title: 'Marketing' })
    ]
    render(
      <Wrapper>
        <CompactPills
          {...makeProps({
            collections,
            onSelectCollection: handleSelect
          })}
        />
      </Wrapper>
    )
    await userEvent.click(screen.getByTestId('CompactPill-col-marketing'))
    expect(handleSelect).toHaveBeenCalledWith('col-marketing')
  })

  it('calls onSelectCollection with null when the All Templates pill is clicked', async () => {
    const handleSelect = jest.fn()
    render(
      <Wrapper>
        <CompactPills
          {...makeProps({
            selectedCollectionId: 'col-marketing',
            onSelectCollection: handleSelect
          })}
        />
      </Wrapper>
    )
    await userEvent.click(screen.getByTestId('CompactPill-__all_templates__'))
    expect(handleSelect).toHaveBeenCalledWith(null)
  })

  it('filters the visible pills by the search term (case-insensitive)', async () => {
    const collections = [
      makeCollection({ id: 'col-marketing', title: 'Marketing' }),
      makeCollection({ id: 'col-sales', title: 'Sales' }),
      makeCollection({ id: 'col-onboarding', title: 'Onboarding' })
    ]
    render(
      <Wrapper>
        <CompactPills {...makeProps({ collections })} />
      </Wrapper>
    )
    const searchInput = screen.getByLabelText('Search collections')
    await userEvent.type(searchInput, 'mark')
    expect(screen.getByTestId('CompactPill-col-marketing')).toBeInTheDocument()
    expect(
      screen.queryByTestId('CompactPill-col-sales')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('CompactPill-col-onboarding')
    ).not.toBeInTheDocument()
    // All Templates is always pinned, regardless of the active search term.
    expect(
      screen.getByTestId('CompactPill-__all_templates__')
    ).toBeInTheDocument()
  })

  it('marks the active pill with aria-pressed="true"', () => {
    const collections = [
      makeCollection({ id: 'col-marketing', title: 'Marketing' })
    ]
    render(
      <Wrapper>
        <CompactPills
          {...makeProps({
            collections,
            selectedCollectionId: 'col-marketing',
            selectedCollection: collections[0]
          })}
        />
      </Wrapper>
    )
    expect(screen.getByTestId('CompactPill-col-marketing')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByTestId('CompactPill-__all_templates__')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('renders the live-status indicator on published collection pills', () => {
    const collections = [
      makeCollection({
        id: 'col-marketing',
        title: 'Marketing',
        status: TemplateGalleryPageStatus.published
      }),
      makeCollection({
        id: 'col-sales',
        title: 'Sales',
        status: TemplateGalleryPageStatus.draft
      })
    ]
    render(
      <Wrapper>
        <CompactPills {...makeProps({ collections })} />
      </Wrapper>
    )
    expect(
      screen.getByTestId('CompactPillLiveDot-col-marketing')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('CompactPillLiveDot-col-sales')
    ).not.toBeInTheDocument()
  })

  it('renders the empty state when no templates match the active filter', () => {
    render(
      <Wrapper>
        <CompactPills {...makeProps({ filteredJourneys: [] })} />
      </Wrapper>
    )
    expect(screen.getByTestId('CompactPillsEmptyState')).toBeInTheDocument()
  })
})
