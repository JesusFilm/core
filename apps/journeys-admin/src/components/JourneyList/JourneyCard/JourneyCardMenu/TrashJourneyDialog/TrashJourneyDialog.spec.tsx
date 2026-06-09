import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'
import { type MockedFunction } from 'vitest'

import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import { TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY } from '../../../../../libs/useTemplateGalleryPageAssignJourneyMutation'

import { JOURNEY_TRASH } from './TrashJourneyDialog'

import { TrashJourneyDialog } from '.'

vi.mock('../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery', () => ({
  useTemplateFamilyStatsAggregateLazyQuery: vi.fn()
}))

const mockedUseTemplateFamilyStatsAggregateLazyQuery =
  useTemplateFamilyStatsAggregateLazyQuery as MockedFunction<
    typeof useTemplateFamilyStatsAggregateLazyQuery
  >

// After trashJourney resolves, the dialog issues a best-effort
// templateGalleryPageAssignJourney({ pageId: null }) to sever any
// collection membership. Every success-path test needs this mock or
// MockedProvider logs a no-match error.
function unassignMock(
  journeyId = 'journey-id',
  result: Record<string, unknown> | null = null
) {
  return {
    request: {
      query: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId, pageId: null }
    },
    result: {
      data: {
        templateGalleryPageAssignJourney: result
      }
    }
  }
}

describe('TrashJourneyDialog', () => {
  const refetchTemplateStats = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    refetchTemplateStats.mockClear()
    mockedUseTemplateFamilyStatsAggregateLazyQuery.mockReturnValue({
      query: [
        vi.fn(),
        {
          data: undefined,
          loading: false,
          error: undefined
        }
      ] as any,
      refetchTemplateStats
    })
  })

  it('should change journey status to trashed', async () => {
    const handleClose = vi.fn()
    const result = vi.fn(() => ({
      data: {
        journeysTrash: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.trashed
          }
        ]
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TRASH,
              variables: {
                ids: ['journey-id']
              }
            },
            result
          },
          unassignMock()
        ]}
      >
        <SnackbarProvider>
          <TrashJourneyDialog id="journey-id" open handleClose={handleClose} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleClose).toHaveBeenCalled()
    expect(getByText('Journey trashed')).toBeInTheDocument()
  })

  it('should show error if trash fails', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TRASH,
              variables: {
                ids: ['journey-id']
              }
            },
            error: new Error('Error')
          }
        ]}
      >
        <SnackbarProvider>
          <TrashJourneyDialog id="journey-id" open handleClose={noop} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(getByText('Error')).toBeInTheDocument())
  })

  it('should call refetchTemplateStats when trashing a journey with fromTemplateId', async () => {
    const handleClose = vi.fn()
    const result = vi.fn(() => ({
      data: {
        journeysTrash: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.trashed,
            fromTemplateId: 'template-id-123'
          }
        ]
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TRASH,
              variables: {
                ids: ['journey-id']
              }
            },
            result
          },
          unassignMock()
        ]}
      >
        <SnackbarProvider>
          <TrashJourneyDialog
            id="journey-id"
            open
            handleClose={handleClose}
            fromTemplateId="template-id-123"
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(refetchTemplateStats).toHaveBeenCalledWith(['template-id-123'])
    })
    expect(handleClose).toHaveBeenCalled()
    expect(getByText('Journey trashed')).toBeInTheDocument()
  })

  it('removes the trashed journey from every cached TemplateGalleryPage.templates list and evicts both entity flavours', async () => {
    const cache = new InMemoryCache()
    // Seed two collections that both reference the journey as a
    // TemplateGalleryItem ref — the Pothos variant the public templates
    // field stores. The trash update should filter both lists.
    cache.restore({
      'TemplateGalleryPageAdmin:page-A': {
        __typename: 'TemplateGalleryPageAdmin',
        id: 'page-A',
        templates: [
          { __ref: 'TemplateGalleryItem:journey-id' },
          { __ref: 'TemplateGalleryItem:other-journey' }
        ]
      },
      'TemplateGalleryPageAdmin:page-B': {
        __typename: 'TemplateGalleryPageAdmin',
        id: 'page-B',
        templates: [{ __ref: 'TemplateGalleryItem:journey-id' }]
      },
      'TemplateGalleryItem:journey-id': {
        __typename: 'TemplateGalleryItem',
        id: 'journey-id'
      },
      'TemplateGalleryItem:other-journey': {
        __typename: 'TemplateGalleryItem',
        id: 'other-journey'
      },
      'Journey:journey-id': {
        __typename: 'Journey',
        id: 'journey-id',
        status: JourneyStatus.published
      }
    })

    const result = vi.fn(() => ({
      data: {
        journeysTrash: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.trashed,
            fromTemplateId: null
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: JOURNEY_TRASH,
              variables: { ids: ['journey-id'] }
            },
            result
          },
          unassignMock()
        ]}
      >
        <SnackbarProvider>
          <TrashJourneyDialog id="journey-id" open handleClose={vi.fn()} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(result).toHaveBeenCalled())

    // Both entity flavours evicted — the Journey and the Pothos variant.
    await waitFor(() => {
      const snapshot = cache.extract()
      expect(snapshot['Journey:journey-id']).toBeUndefined()
      expect(snapshot['TemplateGalleryItem:journey-id']).toBeUndefined()
    })

    // Every cached TemplateGalleryPage.templates list is trimmed of the
    // trashed ref, sibling refs survive.
    const finalSnapshot = cache.extract()
    expect(finalSnapshot['TemplateGalleryPageAdmin:page-A']?.templates).toEqual([
      { __ref: 'TemplateGalleryItem:other-journey' }
    ])
    expect(finalSnapshot['TemplateGalleryPageAdmin:page-B']?.templates).toEqual([])
  })

  it('should not call refetchTemplateStats when trashing a journey without fromTemplateId', async () => {
    const handleClose = vi.fn()
    const result = vi.fn(() => ({
      data: {
        journeysTrash: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.trashed,
            fromTemplateId: null
          }
        ]
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TRASH,
              variables: {
                ids: ['journey-id']
              }
            },
            result
          },
          unassignMock()
        ]}
      >
        <SnackbarProvider>
          <TrashJourneyDialog
            id="journey-id"
            open
            handleClose={handleClose}
            fromTemplateId={null}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(refetchTemplateStats).not.toHaveBeenCalled()
    expect(handleClose).toHaveBeenCalled()
    expect(getByText('Journey trashed')).toBeInTheDocument()
  })

  it('unassigns the journey from its collection after trashing', async () => {
    const trashMock = vi.fn(() => ({
      data: {
        journeysTrash: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.trashed,
            fromTemplateId: null
          }
        ]
      }
    }))
    const unassignResult = vi.fn(() => ({
      data: { templateGalleryPageAssignJourney: null }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TRASH,
              variables: { ids: ['journey-id'] }
            },
            result: trashMock
          },
          {
            request: {
              query: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
              variables: { journeyId: 'journey-id', pageId: null }
            },
            result: unassignResult
          }
        ]}
      >
        <SnackbarProvider>
          <TrashJourneyDialog id="journey-id" open handleClose={vi.fn()} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(trashMock).toHaveBeenCalled())
    await waitFor(() => expect(unassignResult).toHaveBeenCalled())
    expect(getByText('Journey trashed')).toBeInTheDocument()
  })

  it('fires the success snackbar BEFORE the unassign mutation resolves (does not block UX)', async () => {
    // Mike review (NES-1644): waitFor doesn't assert ordering. This
    // test holds the unassign mock indefinitely and asserts the
    // snackbar still appears — proving the dialog doesn't await
    // unassign before surfacing success.
    const trashMock = vi.fn(() => ({
      data: {
        journeysTrash: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.trashed,
            fromTemplateId: null
          }
        ]
      }
    }))
    let unassignCalled = false
    const unassignNeverResolves = new Promise<{
      data: { templateGalleryPageAssignJourney: null }
    }>(() => {
      // Intentionally never resolves — proves the snackbar is not
      // gated on this promise.
    })

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TRASH,
              variables: { ids: ['journey-id'] }
            },
            result: trashMock
          },
          {
            request: {
              query: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
              variables: { journeyId: 'journey-id', pageId: null }
            },
            result: () => {
              unassignCalled = true
              return unassignNeverResolves as unknown as {
                data: { templateGalleryPageAssignJourney: null }
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <TrashJourneyDialog id="journey-id" open handleClose={vi.fn()} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(trashMock).toHaveBeenCalled())
    await waitFor(() =>
      expect(getByText('Journey trashed')).toBeInTheDocument()
    )
    // Unassign should have been kicked off (fire-and-forget) but its
    // promise never resolved — yet the snackbar appeared, proving the
    // dialog did not await it.
    expect(unassignCalled).toBe(true)
  })

  it('still surfaces success when the unassign mutation fails (best-effort)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(noop)
    const trashMock = vi.fn(() => ({
      data: {
        journeysTrash: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.trashed,
            fromTemplateId: null
          }
        ]
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TRASH,
              variables: { ids: ['journey-id'] }
            },
            result: trashMock
          },
          {
            request: {
              query: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
              variables: { journeyId: 'journey-id', pageId: null }
            },
            error: new Error('unassign exploded')
          }
        ]}
      >
        <SnackbarProvider>
          <TrashJourneyDialog id="journey-id" open handleClose={vi.fn()} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(trashMock).toHaveBeenCalled())
    await waitFor(() =>
      expect(getByText('Journey trashed')).toBeInTheDocument()
    )
    expect(warn).toHaveBeenCalledWith(
      '[TrashJourneyDialog] failed to unassign trashed journey from its collection',
      expect.objectContaining({ journeyId: 'journey-id' })
    )
    warn.mockRestore()
  })

  // NES-1669: TrashJourneyDialog is shared between regular journeys and
  // templates. When the parent passes `template`, the dialog title, body,
  // and success snackbar all switch to template-flavoured copy. The
  // underlying mutation is unchanged — `journeysTrash` handles both.
  it('shows template-flavoured copy and snackbar when template is true (NES-1669)', async () => {
    const handleClose = vi.fn()
    const result = vi.fn(() => ({
      data: {
        journeysTrash: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.trashed,
            fromTemplateId: null
          }
        ]
      }
    }))

    const { getByRole, getByText, queryByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TRASH,
              variables: { ids: ['journey-id'] }
            },
            result
          },
          unassignMock()
        ]}
      >
        <SnackbarProvider>
          <TrashJourneyDialog
            id="journey-id"
            open
            handleClose={handleClose}
            template
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByText('Trash Template?')).toBeInTheDocument()
    expect(queryByText('Trash Journey?')).not.toBeInTheDocument()
    expect(
      getByText(/this template will be moved to the trash/i)
    ).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleClose).toHaveBeenCalled()
    expect(getByText('Template trashed')).toBeInTheDocument()
    expect(queryByText('Journey trashed')).not.toBeInTheDocument()
  })
})
