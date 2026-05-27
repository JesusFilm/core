import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'
import { type MockedFunction } from 'vitest'

import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery'

import { JOURNEY_RESTORE } from './RestoreJourneyDialog'

import { RestoreJourneyDialog } from '.'

vi.mock(
  '../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery',
  () => ({
    useTemplateFamilyStatsAggregateLazyQuery: vi.fn()
  })
)

const mockedUseTemplateFamilyStatsAggregateLazyQuery =
  useTemplateFamilyStatsAggregateLazyQuery as MockedFunction<
    typeof useTemplateFamilyStatsAggregateLazyQuery
  >

describe('RestoreJourneyDialog', () => {
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

  it('should restore journey to published', async () => {
    const handleClose = vi.fn()
    const result = vi.fn(() => ({
      data: {
        journeysRestore: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.published
          }
        ]
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_RESTORE,
              variables: {
                ids: ['journey-id']
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <RestoreJourneyDialog
            id="journey-id"
            published
            open
            handleClose={handleClose}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Restore' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleClose).toHaveBeenCalled()
    expect(getByText('Journey Restored')).toBeInTheDocument()
  })

  it('should restore journey to draft', async () => {
    const handleClose = vi.fn()
    const result = vi.fn(() => ({
      data: {
        journeysRestore: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.draft
          }
        ]
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_RESTORE,
              variables: {
                ids: ['journey-id']
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <RestoreJourneyDialog
            id="journey-id"
            published={false}
            open
            handleClose={handleClose}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Restore' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleClose).toHaveBeenCalled()
    expect(getByText('Journey Restored')).toBeInTheDocument()
  })

  it('should show error if trash fails', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_RESTORE,
              variables: {
                ids: ['journey-id']
              }
            },
            error: new Error('Error')
          }
        ]}
      >
        <SnackbarProvider>
          <RestoreJourneyDialog
            id="journey-id"
            published={false}
            open
            handleClose={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Restore' }))
    await waitFor(() => expect(getByText('Error')).toBeInTheDocument())
  })

  it('should call refetchTemplateStats when restoring a journey with fromTemplateId', async () => {
    const handleClose = vi.fn()
    const result = vi.fn(() => ({
      data: {
        journeysRestore: [
          {
            id: 'journey-id',
            __typename: 'Journey',
            status: JourneyStatus.published,
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
              query: JOURNEY_RESTORE,
              variables: {
                ids: ['journey-id']
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <RestoreJourneyDialog
            id="journey-id"
            published
            open
            handleClose={handleClose}
            fromTemplateId="template-id-123"
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Restore' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(refetchTemplateStats).toHaveBeenCalledWith(['template-id-123'])
    })
    expect(handleClose).toHaveBeenCalled()
    expect(getByText('Journey Restored')).toBeInTheDocument()
  })
})
