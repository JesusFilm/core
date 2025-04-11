import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  getMockGetJourneyEventsCountQuery,
  mockCreateEventsExportLogMutation,
  mockGetJourneyEventsQuery
} from '../../../libs/useJourneyEventsExport/useJourneyEventsExport.mock'

import { ExportEventsButton } from './ExportEventsButton'

const mockGetJourneyEventsCountQuery = getMockGetJourneyEventsCountQuery()

describe('ExportEventsButton', () => {
  it('should render download button when not downloading', () => {
    render(
      <MockedProvider mocks={[]}>
        <ExportEventsButton journeyId="journey1" />
      </MockedProvider>
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeVisible()
  })

  it('should download events when button is clicked', async () => {
    const getJourneyEventsMockResult = jest.fn(() => ({
      ...mockGetJourneyEventsQuery.result
    }))
    const mutationResult = jest.fn(() => ({
      ...mockCreateEventsExportLogMutation.result
    }))
    render(
      <MockedProvider
        mocks={[
          mockGetJourneyEventsCountQuery,
          { ...mockGetJourneyEventsQuery, result: getJourneyEventsMockResult },
          { ...mockCreateEventsExportLogMutation, result: mutationResult }
        ]}
      >
        <ExportEventsButton journeyId="journey1" />
      </MockedProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockGetJourneyEventsCountQuery.result).toHaveBeenCalled()
    })

    expect(getJourneyEventsMockResult).toHaveBeenCalled()
    expect(mutationResult).toHaveBeenCalled()
  })
})
