import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  defaultJourney,
  publishedJourney
} from '../../../JourneyList/journeyListData'
import { TeamProvider } from '../../TeamProvider'
import {
  customDomain,
  getLastActiveTeamIdAndTeamsMock,
  mockJourneyCollectionCreate,
  mockJourneyCollectionDelete,
  mockJourneyCollectionUpdate
} from '../data'

import { DefaultJourneyForm } from './DefaultJourneyForm'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn(() => 'uuid')
}))

const getAdminJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      useLastActiveTeamId: true
    }
  },
  result: jest.fn(() => ({
    data: {
      journeys: [defaultJourney, publishedJourney]
    }
  }))
}

describe('DefaultJourneyForm', () => {
  afterEach(() => jest.clearAllMocks())

  it('should set a default journey for custom domain', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          getAdminJourneysMock,
          getLastActiveTeamIdAndTeamsMock,
          mockJourneyCollectionCreate
        ]}
      >
        <TeamProvider>
          <SnackbarProvider>
            <DefaultJourneyForm customDomain={customDomain} />
          </SnackbarProvider>
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(getAdminJourneysMock.result).toHaveBeenCalled())

    fireEvent.mouseDown(getByRole('combobox'))
    fireEvent.click(getByRole('option', { name: 'Default Journey Heading' }))
    await waitFor(() =>
      expect(mockJourneyCollectionCreate.result).toHaveBeenCalled()
    )
  })

  it('should set a default journey for custom domain', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          getAdminJourneysMock,
          getLastActiveTeamIdAndTeamsMock,
          mockJourneyCollectionUpdate
        ]}
      >
        <TeamProvider>
          <SnackbarProvider>
            <DefaultJourneyForm
              customDomain={{
                ...customDomain,
                journeyCollection: {
                  __typename: 'JourneyCollection',
                  id: 'journeyCollectionId',
                  journeys: [
                    {
                      __typename: 'Journey',
                      id: 'journey-id',
                      title: 'Default Journey Heading'
                    }
                  ]
                }
              }}
            />
          </SnackbarProvider>
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(getAdminJourneysMock.result).toHaveBeenCalled())

    fireEvent.mouseDown(getByRole('combobox'))
    fireEvent.click(getByRole('option', { name: 'Published Journey Heading' }))
    await waitFor(() =>
      expect(mockJourneyCollectionUpdate.result).toHaveBeenCalled()
    )
  })

  it('should set a default journey for custom domain', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          getAdminJourneysMock,
          getLastActiveTeamIdAndTeamsMock,
          mockJourneyCollectionUpdate
        ]}
      >
        <TeamProvider>
          <SnackbarProvider>
            <DefaultJourneyForm
              customDomain={{
                ...customDomain,
                journeyCollection: {
                  __typename: 'JourneyCollection',
                  id: 'journeyCollectionId',
                  journeys: [
                    {
                      __typename: 'Journey',
                      id: 'journey-id',
                      title: 'Default Journey Heading'
                    }
                  ]
                }
              }}
            />
          </SnackbarProvider>
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(getAdminJourneysMock.result).toHaveBeenCalled())

    fireEvent.mouseDown(getByRole('combobox'))
    fireEvent.click(getByRole('option', { name: 'Published Journey Heading' }))
    await waitFor(() =>
      expect(mockJourneyCollectionUpdate.result).toHaveBeenCalled()
    )
  })

  it('should delete custom journey', async () => {
    const { getByRole, getByLabelText } = render(
      <MockedProvider
        mocks={[
          getAdminJourneysMock,
          getLastActiveTeamIdAndTeamsMock,
          mockJourneyCollectionDelete
        ]}
      >
        <TeamProvider>
          <SnackbarProvider>
            <DefaultJourneyForm
              customDomain={{
                ...customDomain,
                journeyCollection: {
                  __typename: 'JourneyCollection',
                  id: 'journeyCollectionId',
                  journeys: [
                    {
                      __typename: 'Journey',
                      id: 'journey-id',
                      title: 'Default Journey Heading'
                    }
                  ]
                }
              }}
            />
          </SnackbarProvider>
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(getAdminJourneysMock.result).toHaveBeenCalled())

    fireEvent.mouseDown(getByRole('combobox'))
    fireEvent.click(getByLabelText('Clear'))
    await waitFor(() =>
      expect(mockJourneyCollectionDelete.result).toHaveBeenCalled()
    )
  })
})
