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

  // NES-1669: TrashJourneyDialog is shared between regular journeys and
  // templates. When the parent passes `template`, the dialog title, body,
  // and success snackbar all switch to template-flavoured copy. The
  // underlying mutation is unchanged — `journeysTrash` handles both.
  it('shows template-flavoured copy and snackbar when template is true (NES-1669)', async () => {
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

    const { getByRole, getByText, queryByText } = render(
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
