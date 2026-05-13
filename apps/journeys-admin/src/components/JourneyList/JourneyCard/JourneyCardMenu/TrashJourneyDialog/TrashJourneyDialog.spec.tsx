import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery'

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
          }
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
          }
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
          }
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

  // NES-1644 / QA C: callers rendering this dialog inside a published
  // template-gallery collection card pass `onTrashSuccess` to fire a
  // revalidate after the trash succeeds. Generic to the dialog — opaque.
  it('calls onTrashSuccess after a successful trash', async () => {
    const handleClose = jest.fn()
    const onTrashSuccess = jest.fn()
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

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TRASH,
              variables: { ids: ['journey-id'] }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <TrashJourneyDialog
            id="journey-id"
            open
            handleClose={handleClose}
            onTrashSuccess={onTrashSuccess}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(onTrashSuccess).toHaveBeenCalledTimes(1))
    expect(handleClose).toHaveBeenCalled()
  })

  it('does not call onTrashSuccess when the trash mutation errors', async () => {
    const onTrashSuccess = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TRASH,
              variables: { ids: ['journey-id'] }
            },
            error: new Error('Network down')
          }
        ]}
      >
        <SnackbarProvider>
          <TrashJourneyDialog
            id="journey-id"
            open
            handleClose={noop}
            onTrashSuccess={onTrashSuccess}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Delete' }))
    await waitFor(() =>
      expect(getByText('Network down')).toBeInTheDocument()
    )
    expect(onTrashSuccess).not.toHaveBeenCalled()
  })
})
