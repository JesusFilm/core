import { MockedProvider } from '@apollo/client/testing'
import { DndContext } from '@dnd-kit/core'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import '../../../../../test/i18n'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import { defaultJourney } from '../../../JourneyList/journeyListData'
import { ThemeProvider } from '../../../ThemeProvider'
import type { CollectionViewProps } from '../types'

import { FinderColumns } from './FinderColumns'

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
        id: 'journey-id',
        title: 'a',
        primaryImageBlock: null
      }
    ],
    ...overrides
  }
}

const collectionA = makeCollection({
  id: 'col-a',
  title: 'Marketing',
  templates: [
    {
      __typename: 'TemplateGalleryItem',
      id: 'journey-id',
      title: 'a',
      primaryImageBlock: null
    }
  ]
})

const collectionB = makeCollection({
  id: 'col-b',
  title: 'Welcome',
  templates: []
})

const journeyOne = { ...defaultJourney, id: 'j1', title: 'First Template' }
const journeyTwo = { ...defaultJourney, id: 'j2', title: 'Second Template' }

function buildProps(
  overrides: Partial<CollectionViewProps> = {}
): CollectionViewProps {
  return {
    collections: [collectionA, collectionB],
    allTemplatesCount: 12,
    selectedCollectionId: null,
    onSelectCollection: jest.fn(),
    dropDisabled: false,
    filteredJourneys: [journeyOne, journeyTwo],
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

function renderVariant(overrides: Partial<CollectionViewProps> = {}): {
  props: CollectionViewProps
  rendered: ReturnType<typeof render>
} {
  const props = buildProps(overrides)
  const rendered = render(
    <SnackbarProvider>
      <MockedProvider>
        <ThemeProvider>
          <DndContext>
            <FinderColumns {...props} />
          </DndContext>
        </ThemeProvider>
      </MockedProvider>
    </SnackbarProvider>
  )
  return { props, rendered }
}

describe('FinderColumns', () => {
  it('renders the three Finder columns with collections, templates, and an empty detail panel', () => {
    renderVariant()
    // Column 1: All Templates + each collection row.
    expect(
      screen.getByTestId('FinderColumnsAllTemplatesRow')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('FinderColumnsCollectionRow-col-a')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('FinderColumnsCollectionRow-col-b')
    ).toBeInTheDocument()
    // Column 2: a row per filtered journey.
    expect(
      screen.getByTestId('FinderColumnsTemplateRow-j1')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('FinderColumnsTemplateRow-j2')
    ).toBeInTheDocument()
    // Column 3: starts with the first journey auto-selected via the
    // selection-reset effect, so the detail panel renders — not the
    // empty state.
    expect(screen.getByTestId('FinderColumnsDetail')).toBeInTheDocument()
  })

  it('renders the All Templates row pinned at the top of column 1', () => {
    renderVariant()
    const allRow = screen.getByTestId('FinderColumnsAllTemplatesRow')
    expect(allRow).toBeInTheDocument()
    expect(allRow).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows the empty detail state when the filtered list is empty', () => {
    renderVariant({ filteredJourneys: [] })
    expect(screen.getByTestId('FinderColumnsDetailEmpty')).toBeInTheDocument()
    expect(
      screen.getByText('Select a template to preview.')
    ).toBeInTheDocument()
  })

  it('shows the empty templates state when the selected collection has no templates', () => {
    renderVariant({
      selectedCollectionId: 'col-b',
      selectedCollection: collectionB,
      filteredJourneys: []
    })
    expect(
      screen.getByText('No templates yet — drag templates here to add them.')
    ).toBeInTheDocument()
  })

  it('calls onSelectCollection when a column 1 row is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderVariant()
    await user.click(screen.getByTestId('FinderColumnsCollectionRow-col-a'))
    expect(props.onSelectCollection).toHaveBeenCalledWith('col-a')
  })

  it('selects a template when a column 2 row is clicked and updates the detail title', () => {
    renderVariant()
    // The detail h6 (column 3) starts with the first journey auto-selected.
    expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent(
      'First Template'
    )
    // `fireEvent.click` is used here over `userEvent.click` because the
    // row is also a dnd-kit sortable item: its `listeners` capture the
    // pointer-down phase that `userEvent` simulates, which would race
    // with the click handler. The plain DOM click event still fires the
    // selection branch.
    fireEvent.click(screen.getByTestId('FinderColumnsTemplateRow-j2'))
    // The detail panel now reflects the newly clicked template.
    expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent(
      'Second Template'
    )
    // The clicked row is marked as selected.
    expect(screen.getByTestId('FinderColumnsTemplateRow-j2')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })
})
