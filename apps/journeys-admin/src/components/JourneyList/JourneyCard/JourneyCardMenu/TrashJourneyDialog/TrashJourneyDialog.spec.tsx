import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import { TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY } from '../../../../../libs/useTemplateGalleryPageAssignJourneyMutation'

import { JOURNEY_TRASH } from './TrashJourneyDialog'

import { TrashJourneyDialog } from '.'

jest.mock(
  '../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery',
  () => ({
    useTemplateFamilyStatsAggregateLazyQuery: jest.fn()
  })
)

const mockedUseTemplateFamilyStatsAggregateLazyQuery =
  useTemplateFamilyStatsAggregateLazyQuery as jest.MockedFunction<
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
  const refetchTemplateStats = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    refetchTemplateStats.mockClear()
    mockedUseTemplateFamilyStatsAggregateLazyQuery.mockReturnValue({
      query: [
        jest.fn(),
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
    const handleClose = jest.fn()
    const result = jest.fn(() => ({
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
    const handleClose = jest.fn()
    const result = jest.fn(() => ({
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
      'TemplateGalleryPage:page-A': {
        __typename: 'TemplateGalleryPage',
        id: 'page-A',
        templates: [
          { __ref: 'TemplateGalleryItem:journey-id' },
          { __ref: 'TemplateGalleryItem:other-journey' }
        ]
      },
      'TemplateGalleryPage:page-B': {
        __typename: 'TemplateGalleryPage',
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

    const result = jest.fn(() => ({
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
          <TrashJourneyDialog id="journey-id" open handleClose={jest.fn()} />
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
    expect(finalSnapshot['TemplateGalleryPage:page-A']?.templates).toEqual([
      { __ref: 'TemplateGalleryItem:other-journey' }
    ])
    expect(finalSnapshot['TemplateGalleryPage:page-B']?.templates).toEqual([])
  })

  it('should not call refetchTemplateStats when trashing a journey without fromTemplateId', async () => {
    const handleClose = jest.fn()
    const result = jest.fn(() => ({
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
    const trashMock = jest.fn(() => ({
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
    const unassignResult = jest.fn(() => ({
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
          <TrashJourneyDialog id="journey-id" open handleClose={jest.fn()} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(trashMock).toHaveBeenCalled())
    await waitFor(() => expect(unassignResult).toHaveBeenCalled())
    expect(getByText('Journey trashed')).toBeInTheDocument()
  })

  it('still surfaces success when the unassign mutation fails (best-effort)', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const trashMock = jest.fn(() => ({
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
          <TrashJourneyDialog id="journey-id" open handleClose={jest.fn()} />
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
})
